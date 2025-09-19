"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicineSaleController = void 0;
const database_1 = require("../config/database");
const MedicineSale_1 = require("../entities/MedicineSale");
const Medicine_1 = require("../entities/Medicine");
const Prescription_1 = require("../entities/Prescription");
const User_1 = require("../entities/User");
const Pet_1 = require("../entities/Pet");
class MedicineSaleController {
    constructor() {
        this.saleRepository = database_1.AppDataSource.getRepository(MedicineSale_1.MedicineSale);
        this.medicineRepository = database_1.AppDataSource.getRepository(Medicine_1.Medicine);
        this.prescriptionRepository = database_1.AppDataSource.getRepository(Prescription_1.Prescription);
        this.userRepository = database_1.AppDataSource.getRepository(User_1.User);
        this.petRepository = database_1.AppDataSource.getRepository(Pet_1.Pet);
    }
    // Registrar una venta desde una prescripción
    async createSaleFromPrescription(req, res) {
        try {
            const { prescriptionId, purchaseLocation, quantity, quantityInClinic, // Nueva: cantidad a comprar en clínica
            quantityExternal, // Nueva: cantidad a comprar externamente
            discountPercentage = 0, notes, externalPharmacy } = req.body;
            // Validar prescripción
            const prescription = await this.prescriptionRepository.findOne({
                where: { id: prescriptionId },
                relations: ['medicine', 'medicalHistory', 'medicalHistory.pet', 'medicalHistory.pet.owner']
            });
            if (!prescription) {
                return res.status(404).json({ message: 'Prescripción no encontrada' });
            }
            if (!prescription.medicine) {
                return res.status(400).json({ message: 'La prescripción no tiene un medicamento asociado' });
            }
            const medicine = prescription.medicine;
            const finalQuantity = quantity || prescription.quantity || 1;
            // Determinar cantidades y tipo de compra
            let finalPurchaseLocation = purchaseLocation;
            let finalQuantityInClinic = 0;
            let finalQuantityExternal = 0;
            if (purchaseLocation === MedicineSale_1.PurchaseLocation.SPLIT) {
                // Compra parcial - usar las cantidades proporcionadas
                finalQuantityInClinic = quantityInClinic || 0;
                finalQuantityExternal = quantityExternal || 0;
                if (finalQuantityInClinic + finalQuantityExternal !== finalQuantity) {
                    return res.status(400).json({
                        message: 'La suma de cantidades parciales no coincide con el total'
                    });
                }
                if (finalQuantityInClinic > medicine.currentStock) {
                    return res.status(400).json({
                        message: `Stock insuficiente para cantidad en clínica. Stock actual: ${medicine.currentStock}`,
                        currentStock: medicine.currentStock,
                        requestedInClinic: finalQuantityInClinic,
                        suggestion: `Puede comprar máximo ${medicine.currentStock} en la clínica y ${finalQuantity - medicine.currentStock} externamente`
                    });
                }
            }
            else if (purchaseLocation === MedicineSale_1.PurchaseLocation.IN_CLINIC) {
                // Compra completa en clínica
                if (medicine.currentStock < finalQuantity) {
                    // Sugerir compra parcial
                    return res.status(400).json({
                        message: `Stock insuficiente para compra completa`,
                        currentStock: medicine.currentStock,
                        requested: finalQuantity,
                        suggestion: `Puede hacer una compra parcial: ${medicine.currentStock} en clínica y ${finalQuantity - medicine.currentStock} externamente`,
                        canSplit: true
                    });
                }
                finalQuantityInClinic = finalQuantity;
                finalQuantityExternal = 0;
            }
            else {
                // Compra completa externa
                finalQuantityInClinic = 0;
                finalQuantityExternal = finalQuantity;
            }
            // Crear la venta
            const sale = this.saleRepository.create({
                prescriptionId,
                medicineId: medicine.id,
                clientId: prescription.medicalHistory.pet.owner.id,
                petId: prescription.medicalHistory.pet.id,
                veterinarianId: prescription.medicalHistory.veterinarianId,
                quantity: finalQuantity,
                quantityInClinic: finalQuantityInClinic,
                quantityExternal: finalQuantityExternal,
                unitPrice: medicine.unitPrice || 0,
                discountPercentage: finalQuantityInClinic > 0 ? discountPercentage : 0, // Solo descuento en compras de clínica
                purchaseLocation: finalPurchaseLocation,
                externalPharmacy: finalQuantityExternal > 0 ? externalPharmacy : null,
                notes,
                status: MedicineSale_1.SaleStatus.COMPLETED,
                createdBy: req.user?.id,
                updatedBy: req.user?.id
            });
            // Calcular precios (solo para la parte comprada en clínica)
            if (finalQuantityInClinic > 0) {
                sale.totalPrice = finalQuantityInClinic * sale.unitPrice;
                sale.discountAmount = sale.totalPrice * (discountPercentage / 100);
                sale.finalPrice = sale.totalPrice - sale.discountAmount;
            }
            else {
                sale.totalPrice = 0;
                sale.discountAmount = 0;
                sale.finalPrice = 0;
            }
            // Guardar la venta
            const savedSale = await this.saleRepository.save(sale);
            // Actualizar el stock solo por la cantidad comprada en clínica
            if (finalQuantityInClinic > 0) {
                medicine.currentStock -= finalQuantityInClinic;
                await this.medicineRepository.save(medicine);
            }
            // Actualizar el estado de la prescripción
            prescription.purchaseStatus =
                finalPurchaseLocation === MedicineSale_1.PurchaseLocation.IN_CLINIC ? Prescription_1.PurchaseStatus.PURCHASED_IN_CLINIC :
                    finalPurchaseLocation === MedicineSale_1.PurchaseLocation.EXTERNAL ? Prescription_1.PurchaseStatus.PURCHASED_EXTERNAL :
                        Prescription_1.PurchaseStatus.PURCHASED_IN_CLINIC; // SPLIT se marca como comprado en clínica porque hubo venta parcial
            prescription.purchaseDate = new Date();
            prescription.externalPharmacy = externalPharmacy;
            await this.prescriptionRepository.save(prescription);
            // Cargar relaciones para la respuesta
            const fullSale = await this.saleRepository.findOne({
                where: { id: savedSale.id },
                relations: ['medicine', 'client', 'pet', 'veterinarian', 'prescription']
            });
            return res.status(201).json({
                message: finalPurchaseLocation === MedicineSale_1.PurchaseLocation.SPLIT
                    ? `Venta parcial registrada: ${finalQuantityInClinic} en clínica, ${finalQuantityExternal} para compra externa`
                    : 'Venta registrada exitosamente',
                sale: fullSale,
                stockAfterSale: finalQuantityInClinic > 0 ? medicine.currentStock : null,
                splitDetails: finalPurchaseLocation === MedicineSale_1.PurchaseLocation.SPLIT ? {
                    quantityInClinic: finalQuantityInClinic,
                    quantityExternal: finalQuantityExternal,
                    totalInClinicPrice: sale.finalPrice,
                    externalPharmacy
                } : null
            });
        }
        catch (error) {
            console.error('Error creando venta:', error);
            return res.status(500).json({ message: 'Error al registrar la venta' });
        }
    }
    // Registrar venta directa (sin prescripción)
    async createDirectSale(req, res) {
        try {
            const { medicineId, clientId, petId, quantity, discountPercentage = 0, notes } = req.body;
            // Validar medicina
            const medicine = await this.medicineRepository.findOne({ where: { id: medicineId } });
            if (!medicine) {
                return res.status(404).json({ message: 'Medicamento no encontrado' });
            }
            // Verificar stock
            if (medicine.currentStock < quantity) {
                return res.status(400).json({
                    message: `Stock insuficiente. Stock actual: ${medicine.currentStock}`,
                    currentStock: medicine.currentStock,
                    requested: quantity
                });
            }
            // Validar cliente
            const client = await this.userRepository.findOne({ where: { id: clientId } });
            if (!client) {
                return res.status(404).json({ message: 'Cliente no encontrado' });
            }
            // Crear la venta
            const sale = this.saleRepository.create({
                medicineId,
                clientId,
                petId,
                quantity,
                unitPrice: medicine.unitPrice || 0,
                discountPercentage,
                purchaseLocation: MedicineSale_1.PurchaseLocation.IN_CLINIC,
                notes,
                status: MedicineSale_1.SaleStatus.COMPLETED,
                veterinarianId: req.user?.id,
                createdBy: req.user?.id,
                updatedBy: req.user?.id
            });
            // Calcular precios
            sale.calculatePrices();
            // Guardar la venta
            const savedSale = await this.saleRepository.save(sale);
            // Actualizar stock
            medicine.currentStock -= quantity;
            await this.medicineRepository.save(medicine);
            // Cargar relaciones para la respuesta
            const fullSale = await this.saleRepository.findOne({
                where: { id: savedSale.id },
                relations: ['medicine', 'client', 'pet', 'veterinarian']
            });
            return res.status(201).json({
                message: 'Venta directa registrada exitosamente',
                sale: fullSale,
                stockAfterSale: medicine.currentStock
            });
        }
        catch (error) {
            console.error('Error creando venta directa:', error);
            return res.status(500).json({ message: 'Error al registrar la venta directa' });
        }
    }
    // Obtener ventas
    async getSales(req, res) {
        try {
            const { clientId, petId, medicineId, purchaseLocation, status, startDate, endDate, page = 1, limit = 10 } = req.query;
            const queryBuilder = this.saleRepository.createQueryBuilder('sale')
                .leftJoinAndSelect('sale.medicine', 'medicine')
                .leftJoinAndSelect('sale.client', 'client')
                .leftJoinAndSelect('sale.pet', 'pet')
                .leftJoinAndSelect('sale.veterinarian', 'veterinarian')
                .leftJoinAndSelect('sale.prescription', 'prescription');
            // Aplicar filtros
            if (clientId) {
                queryBuilder.andWhere('sale.clientId = :clientId', { clientId });
            }
            if (petId) {
                queryBuilder.andWhere('sale.petId = :petId', { petId });
            }
            if (medicineId) {
                queryBuilder.andWhere('sale.medicineId = :medicineId', { medicineId });
            }
            if (purchaseLocation) {
                queryBuilder.andWhere('sale.purchaseLocation = :purchaseLocation', { purchaseLocation });
            }
            if (status) {
                queryBuilder.andWhere('sale.status = :status', { status });
            }
            if (startDate) {
                queryBuilder.andWhere('sale.saleDate >= :startDate', { startDate });
            }
            if (endDate) {
                queryBuilder.andWhere('sale.saleDate <= :endDate', { endDate });
            }
            // Aplicar paginación
            const skip = (Number(page) - 1) * Number(limit);
            queryBuilder.skip(skip).take(Number(limit));
            // Ordenar por fecha descendente
            queryBuilder.orderBy('sale.saleDate', 'DESC');
            const [sales, total] = await queryBuilder.getManyAndCount();
            return res.json({
                sales,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit))
            });
        }
        catch (error) {
            console.error('Error obteniendo ventas:', error);
            return res.status(500).json({ message: 'Error al obtener las ventas' });
        }
    }
    // Obtener resumen de ventas
    async getSalesSummary(req, res) {
        try {
            const { startDate, endDate } = req.query;
            let whereClause = 'sale.status = :status';
            const parameters = { status: MedicineSale_1.SaleStatus.COMPLETED };
            if (startDate) {
                whereClause += ' AND sale.saleDate >= :startDate';
                parameters.startDate = startDate;
            }
            if (endDate) {
                whereClause += ' AND sale.saleDate <= :endDate';
                parameters.endDate = endDate;
            }
            // Ventas totales
            const totalSales = await this.saleRepository
                .createQueryBuilder('sale')
                .where(whereClause, parameters)
                .getCount();
            // Ingresos totales
            const totalRevenue = await this.saleRepository
                .createQueryBuilder('sale')
                .select('SUM(sale.finalPrice)', 'total')
                .where(whereClause, parameters)
                .getRawOne();
            // Ventas por ubicación
            const salesByLocation = await this.saleRepository
                .createQueryBuilder('sale')
                .select('sale.purchaseLocation', 'location')
                .addSelect('COUNT(*)', 'count')
                .addSelect('SUM(sale.finalPrice)', 'total')
                .where(whereClause, parameters)
                .groupBy('sale.purchaseLocation')
                .getRawMany();
            // Medicamentos más vendidos
            const topMedicines = await this.saleRepository
                .createQueryBuilder('sale')
                .leftJoinAndSelect('sale.medicine', 'medicine')
                .select('medicine.name', 'name')
                .addSelect('SUM(sale.quantity)', 'totalQuantity')
                .addSelect('SUM(sale.finalPrice)', 'totalRevenue')
                .where(whereClause, parameters)
                .groupBy('medicine.id, medicine.name')
                .orderBy('totalQuantity', 'DESC')
                .limit(10)
                .getRawMany();
            return res.json({
                summary: {
                    totalSales,
                    totalRevenue: totalRevenue?.total || 0,
                    salesByLocation,
                    topMedicines
                }
            });
        }
        catch (error) {
            console.error('Error obteniendo resumen de ventas:', error);
            return res.status(500).json({ message: 'Error al obtener el resumen de ventas' });
        }
    }
    // Cancelar una venta
    async cancelSale(req, res) {
        try {
            const { id } = req.params;
            const sale = await this.saleRepository.findOne({
                where: { id },
                relations: ['medicine', 'prescription']
            });
            if (!sale) {
                return res.status(404).json({ message: 'Venta no encontrada' });
            }
            if (sale.status === MedicineSale_1.SaleStatus.CANCELLED) {
                return res.status(400).json({ message: 'La venta ya está cancelada' });
            }
            // Si la venta afectó el inventario, devolver el stock
            if (sale.affectsInventory()) {
                const medicine = await this.medicineRepository.findOne({
                    where: { id: sale.medicineId }
                });
                if (medicine) {
                    medicine.currentStock += sale.quantity;
                    await this.medicineRepository.save(medicine);
                }
            }
            // Actualizar estado de la venta
            sale.status = MedicineSale_1.SaleStatus.CANCELLED;
            sale.updatedBy = req.user?.id;
            await this.saleRepository.save(sale);
            // Si tiene prescripción, actualizar su estado
            if (sale.prescription) {
                sale.prescription.purchaseStatus = Prescription_1.PurchaseStatus.NOT_PURCHASED;
                sale.prescription.purchaseDate = null;
                await this.prescriptionRepository.save(sale.prescription);
            }
            return res.json({
                message: 'Venta cancelada exitosamente',
                sale
            });
        }
        catch (error) {
            console.error('Error cancelando venta:', error);
            return res.status(500).json({ message: 'Error al cancelar la venta' });
        }
    }
}
exports.MedicineSaleController = MedicineSaleController;
//# sourceMappingURL=MedicineSaleController.js.map