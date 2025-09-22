import { Router, Request, Response } from 'express';
import { AuthMiddleware } from '../middleware/auth';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Pet } from '../entities/Pet';
import { Appointment } from '../entities/Appointment';
import { Medicine as Medication } from '../entities/Medicine';
import { Prescription } from '../entities/Prescription';
import { MedicineSale as Sale } from '../entities/MedicineSale';

const router = Router();

// Middleware para verificar que el usuario es admin
const adminMiddleware = async (req: Request, res: Response, next: Function) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
  }
  next();
};

// Aplicar autenticación y verificación de admin a todas las rutas
router.use(authMiddleware, adminMiddleware);

// Obtener estadísticas generales del sistema
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const petRepo = AppDataSource.getRepository(Pet);
    const appointmentRepo = AppDataSource.getRepository(Appointment);
    const medicationRepo = AppDataSource.getRepository(Medication);
    const prescriptionRepo = AppDataSource.getRepository(Prescription);
    const saleRepo = AppDataSource.getRepository(Sale);

    // Contar registros
    const totalUsers = await userRepo.count();
    const totalPets = await petRepo.count();
    const totalAppointments = await appointmentRepo.count();
    const totalMedications = await medicationRepo.count();
    const totalPrescriptions = await prescriptionRepo.count();
    const totalSales = await saleRepo.count();

    // Contar por estados
    const pendingAppointments = await appointmentRepo.count({
      where: { status: 'scheduled' }
    });

    const completedAppointments = await appointmentRepo.count({
      where: { status: 'completed' }
    });

    // Calcular total de ventas
    const sales = await saleRepo.find();
    const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat((sale.finalPrice || 0).toString()), 0);

    // Medicamentos con bajo stock
    const lowStockMeds = await medicationRepo
      .createQueryBuilder('medication')
      .where('medication.currentStock < 10')
      .getCount();

    res.json({
      users: {
        total: totalUsers,
        admins: await userRepo.count({ where: { role: 'admin' } }),
        vets: await userRepo.count({ where: { role: 'veterinarian' } }),
        clients: await userRepo.count({ where: { role: 'client' } })
      },
      pets: {
        total: totalPets,
        dogs: await petRepo.count({ where: { species: 'dog' } }),
        cats: await petRepo.count({ where: { species: 'cat' } }),
        others: await petRepo
          .createQueryBuilder('pet')
          .where('pet.species NOT IN (:...species)', { species: ['dog', 'cat'] })
          .getCount()
      },
      appointments: {
        total: totalAppointments,
        pending: pendingAppointments,
        completed: completedAppointments,
        cancelled: await appointmentRepo.count({ where: { status: 'cancelled' } })
      },
      inventory: {
        totalMedications: totalMedications,
        lowStock: lowStockMeds
      },
      prescriptions: {
        total: totalPrescriptions
      },
      sales: {
        total: totalSales,
        revenue: totalRevenue
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      message: 'Error al obtener estadísticas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Obtener todos los usuarios con detalles
router.get('/all-users', async (req: Request, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const users = await userRepo.find({
      select: ['id', 'firstName', 'lastName', 'email', 'phone', 'address', 'role', 'createdAt', 'updatedAt'],
      order: { createdAt: 'DESC' }
    });
    res.json(users);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

// Obtener todas las mascotas con propietarios
router.get('/all-pets', async (req: Request, res: Response) => {
  try {
    const petRepo = AppDataSource.getRepository(Pet);
    const pets = await petRepo.find({
      relations: ['owner'],
      order: { createdAt: 'DESC' }
    });
    res.json(pets);
  } catch (error) {
    console.error('Error obteniendo mascotas:', error);
    res.status(500).json({ message: 'Error al obtener mascotas' });
  }
});

// Obtener todas las citas con detalles completos
router.get('/all-appointments', async (req: Request, res: Response) => {
  try {
    const appointmentRepo = AppDataSource.getRepository(Appointment);
    const appointments = await appointmentRepo.find({
      relations: ['pet', 'pet.owner', 'veterinarian'],
      order: { appointmentDate: 'DESC', startTime: 'DESC' }
    });
    res.json(appointments);
  } catch (error) {
    console.error('Error obteniendo citas:', error);
    res.status(500).json({ message: 'Error al obtener citas' });
  }
});

// Obtener todo el inventario de medicamentos
router.get('/all-medications', async (req: Request, res: Response) => {
  try {
    const medicationRepo = AppDataSource.getRepository(Medication);
    const medications = await medicationRepo.find({
      order: { name: 'ASC' }
    });
    res.json(medications);
  } catch (error) {
    console.error('Error obteniendo medicamentos:', error);
    res.status(500).json({ message: 'Error al obtener medicamentos' });
  }
});

// Obtener todas las prescripciones
router.get('/all-prescriptions', async (req: Request, res: Response) => {
  try {
    const prescriptionRepo = AppDataSource.getRepository(Prescription);
    const prescriptions = await prescriptionRepo.find({
      relations: ['medicalHistory', 'medicalHistory.pet', 'medicalHistory.pet.owner', 'medicalHistory.veterinarian', 'medicine'],
      order: { startDate: 'DESC' }
    });
    res.json(prescriptions);
  } catch (error) {
    console.error('Error obteniendo prescripciones:', error);
    res.status(500).json({ message: 'Error al obtener prescripciones' });
  }
});

// Obtener todas las ventas con detalles
router.get('/all-sales', async (req: Request, res: Response) => {
  try {
    const saleRepo = AppDataSource.getRepository(Sale);
    const sales = await saleRepo.find({
      relations: ['client', 'medicine', 'prescription'],
      order: { saleDate: 'DESC' }
    });
    res.json(sales);
  } catch (error) {
    console.error('Error obteniendo ventas:', error);
    res.status(500).json({ message: 'Error al obtener ventas' });
  }
});

export default router;