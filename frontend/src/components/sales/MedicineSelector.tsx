import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  Chip
} from '@mui/material';
import {
  LocalPharmacy as LocalPharmacyIcon,
  Store as StoreIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { medicineService } from '../../services/api';
import { SaleData } from '../../pages/Sales';

interface Medicine {
  id: string;
  name: string;
  genericName: string;
  presentation: string;
  concentration: string;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
}

interface MedicineSelectorProps {
  prescription: any | null;
  saleType: 'prescription' | 'direct';
  onSaleDataChange: (data: SaleData | null) => void;
  existingSaleData: SaleData | null;
}

const MedicineSelector: React.FC<MedicineSelectorProps> = ({
  prescription,
  saleType,
  onSaleDataChange,
  existingSaleData
}) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [purchaseLocation, setPurchaseLocation] = useState<'in_clinic' | 'external' | 'split'>('in_clinic');
  const [quantityInClinic, setQuantityInClinic] = useState(0);
  const [quantityExternal, setQuantityExternal] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [notes, setNotes] = useState('');
  const [externalPharmacy, setExternalPharmacy] = useState('');
  const [stockWarning, setStockWarning] = useState('');
  const [loading, setLoading] = useState(false);

  // Definir checkStockAndUpdatePurchaseOptions antes del useEffect
  const checkStockAndUpdatePurchaseOptions = React.useCallback((medicine: Medicine, requestedQuantity: number) => {
    if (medicine.currentStock < requestedQuantity) {
      if (medicine.currentStock === 0) {
        setPurchaseLocation('external');
        setStockWarning('Sin stock disponible en clínica. Debe comprar en farmacia externa.');
      } else {
        setPurchaseLocation('split');
        setQuantityInClinic(medicine.currentStock);
        setQuantityExternal(requestedQuantity - medicine.currentStock);
        setStockWarning(`Stock limitado: Solo ${medicine.currentStock} unidades disponibles en clínica.`);
      }
    } else {
      setPurchaseLocation('in_clinic');
      setStockWarning('');
    }

    if (medicine.currentStock <= medicine.minimumStock) {
      setStockWarning(prev => prev ? `${prev} Stock mínimo alcanzado.` : 'Stock mínimo alcanzado.');
    }
  }, []);

  useEffect(() => {
    if (saleType === 'direct') {
      loadMedicines();
    } else if (prescription?.medicine) {
      // Si es desde prescripción, usar el medicamento de la prescripción
      setSelectedMedicine(prescription.medicine);
      setQuantity(prescription.quantity || 1);
      checkStockAndUpdatePurchaseOptions(prescription.medicine, prescription.quantity || 1);
    }
  }, [prescription, saleType, checkStockAndUpdatePurchaseOptions]);

  useEffect(() => {
    // Actualizar los datos de venta cuando cambian los valores
    if (selectedMedicine) {
      const unitPrice = selectedMedicine.unitPrice;
      const actualQuantityInClinic = purchaseLocation === 'in_clinic' ? quantity :
                                     purchaseLocation === 'split' ? quantityInClinic : 0;
      const totalPrice = actualQuantityInClinic * unitPrice;
      const discountAmount = totalPrice * (discountPercentage / 100);
      const finalPrice = totalPrice - discountAmount;

      const saleData: SaleData = {
        clientId: '', // Se llenará en el componente padre
        petId: '', // Se llenará en el componente padre
        prescriptionId: prescription?.id,
        medicineId: selectedMedicine.id,
        medicineName: selectedMedicine.name,
        quantity,
        unitPrice,
        totalPrice: finalPrice,
        purchaseLocation,
        quantityInClinic: purchaseLocation === 'split' ? quantityInClinic : undefined,
        quantityExternal: purchaseLocation === 'split' ? quantityExternal : undefined,
        discountPercentage: actualQuantityInClinic > 0 ? discountPercentage : 0,
        notes,
        externalPharmacy: (purchaseLocation === 'external' || purchaseLocation === 'split') ? externalPharmacy : undefined
      };

      onSaleDataChange(saleData);
    } else {
      onSaleDataChange(null);
    }
  }, [selectedMedicine, quantity, purchaseLocation, quantityInClinic, quantityExternal, discountPercentage, notes, externalPharmacy, prescription]);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const response = await medicineService.getAll();
      const medicineData = response.data || response;
      setMedicines(Array.isArray(medicineData) ? medicineData : []);
    } catch (error) {
      console.error('Error loading medicines:', error);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };


  const handleMedicineChange = (medicineId: string) => {
    const medicine = medicines.find(m => m.id === medicineId);
    if (medicine) {
      setSelectedMedicine(medicine);
      checkStockAndUpdatePurchaseOptions(medicine, quantity);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
    if (selectedMedicine) {
      checkStockAndUpdatePurchaseOptions(selectedMedicine, newQuantity);
    }
  };

  const handlePurchaseLocationChange = (location: 'in_clinic' | 'external' | 'split') => {
    setPurchaseLocation(location);

    if (location === 'in_clinic') {
      setQuantityInClinic(0);
      setQuantityExternal(0);
      if (selectedMedicine && quantity > selectedMedicine.currentStock) {
        setStockWarning(`Solo hay ${selectedMedicine.currentStock} unidades disponibles en clínica`);
      }
    } else if (location === 'external') {
      setQuantityInClinic(0);
      setQuantityExternal(quantity);
    } else if (location === 'split' && selectedMedicine) {
      const clinicQty = Math.min(quantity, selectedMedicine.currentStock);
      setQuantityInClinic(clinicQty);
      setQuantityExternal(quantity - clinicQty);
    }
  };

  const getStockStatus = (medicine: Medicine) => {
    if (medicine.currentStock === 0) {
      return <Chip label="Sin Stock" color="error" size="small" />;
    } else if (medicine.currentStock <= medicine.minimumStock) {
      return <Chip label="Stock Bajo" color="warning" size="small" />;
    }
    return <Chip label={`Stock: ${medicine.currentStock}`} color="success" size="small" />;
  };

  const calculateTotal = () => {
    if (!selectedMedicine) return 0;
    const actualQuantityInClinic = purchaseLocation === 'in_clinic' ? quantity :
                                   purchaseLocation === 'split' ? quantityInClinic : 0;
    const subtotal = actualQuantityInClinic * selectedMedicine.unitPrice;
    const discount = subtotal * (discountPercentage / 100);
    return subtotal - discount;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocalPharmacyIcon /> Configurar Venta
      </Typography>

      {saleType === 'direct' && (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Medicamento</InputLabel>
          <Select
            value={selectedMedicine?.id || ''}
            onChange={(e) => handleMedicineChange(e.target.value)}
            label="Medicamento"
            disabled={loading}
          >
            {medicines.map(medicine => (
              <MenuItem key={medicine.id} value={medicine.id}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2">
                      {medicine.name} - {medicine.presentation} {medicine.concentration}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ${medicine.unitPrice} por unidad
                    </Typography>
                  </Box>
                  {getStockStatus(medicine)}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {selectedMedicine && (
        <>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label="Cantidad Total"
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(Number(e.target.value))}
              InputProps={{
                inputProps: { min: 1 },
                endAdornment: <InputAdornment position="end">unidades</InputAdornment>
              }}
              fullWidth
              disabled={saleType === 'prescription'}
            />
            <TextField
              label="Descuento"
              type="number"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(Number(e.target.value))}
              InputProps={{
                inputProps: { min: 0, max: 100 },
                endAdornment: <InputAdornment position="end">%</InputAdornment>
              }}
              fullWidth
              disabled={purchaseLocation === 'external'}
              helperText={purchaseLocation === 'external' ? 'Sin descuento en compras externas' : ''}
            />
          </Box>

          {stockWarning && (
            <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
              {stockWarning}
            </Alert>
          )}

          <Typography variant="subtitle1" gutterBottom>
            Modalidad de Compra
          </Typography>
          <RadioGroup
            value={purchaseLocation}
            onChange={(e) => handlePurchaseLocationChange(e.target.value as any)}
            sx={{ mb: 2 }}
          >
            <FormControlLabel
              value="in_clinic"
              control={<Radio />}
              disabled={selectedMedicine.currentStock < quantity}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocalPharmacyIcon fontSize="small" />
                  <span>Todo en Clínica</span>
                  {selectedMedicine.currentStock < quantity && (
                    <Typography variant="caption" color="error">
                      (Stock insuficiente)
                    </Typography>
                  )}
                </Box>
              }
            />
            <FormControlLabel
              value="external"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <StoreIcon fontSize="small" />
                  <span>Todo Externo</span>
                </Box>
              }
            />
            <FormControlLabel
              value="split"
              control={<Radio />}
              disabled={selectedMedicine.currentStock === 0}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <span>Compra Parcial (Clínica + Externo)</span>
                  {selectedMedicine.currentStock === 0 && (
                    <Typography variant="caption" color="error">
                      (Sin stock en clínica)
                    </Typography>
                  )}
                </Box>
              }
            />
          </RadioGroup>

          {purchaseLocation === 'split' && (
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Cantidad en Clínica"
                type="number"
                value={quantityInClinic}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val <= selectedMedicine.currentStock && val >= 0) {
                    setQuantityInClinic(val);
                    setQuantityExternal(quantity - val);
                  }
                }}
                InputProps={{
                  inputProps: { min: 0, max: selectedMedicine.currentStock }
                }}
                fullWidth
                helperText={`Máximo: ${selectedMedicine.currentStock}`}
              />
              <TextField
                label="Cantidad Externa"
                type="number"
                value={quantityExternal}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= 0) {
                    setQuantityExternal(val);
                    setQuantityInClinic(quantity - val);
                  }
                }}
                InputProps={{
                  inputProps: { min: 0 }
                }}
                fullWidth
              />
            </Box>
          )}

          {(purchaseLocation === 'external' || purchaseLocation === 'split') && (
            <TextField
              label="Farmacia Externa"
              value={externalPharmacy}
              onChange={(e) => setExternalPharmacy(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              placeholder="Nombre de la farmacia donde se comprará"
            />
          )}

          <TextField
            label="Notas (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            rows={2}
            sx={{ mb: 3 }}
            placeholder="Observaciones adicionales sobre la venta..."
          />

          <Card sx={{ bgcolor: 'background.default' }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Resumen de Precio
              </Typography>
              <Divider sx={{ my: 1 }} />

              {purchaseLocation === 'split' && (
                <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
                  Solo se cobra la parte comprada en clínica ({quantityInClinic} unidades)
                </Alert>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Medicamento:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {selectedMedicine.name}
                  </Typography>
                </Box>

                {purchaseLocation === 'in_clinic' && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Cantidad:</Typography>
                      <Typography variant="body2">{quantity} x ${selectedMedicine.unitPrice}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Subtotal:</Typography>
                      <Typography variant="body2">${(quantity * selectedMedicine.unitPrice).toFixed(2)}</Typography>
                    </Box>
                  </>
                )}

                {purchaseLocation === 'split' && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">En Clínica:</Typography>
                      <Typography variant="body2">{quantityInClinic} x ${selectedMedicine.unitPrice}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Externo:</Typography>
                      <Typography variant="body2">{quantityExternal} unidades (no se cobra)</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Subtotal:</Typography>
                      <Typography variant="body2">${(quantityInClinic * selectedMedicine.unitPrice).toFixed(2)}</Typography>
                    </Box>
                  </>
                )}

                {purchaseLocation === 'external' && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Compra Externa:</Typography>
                    <Typography variant="body2">{quantity} unidades (no se cobra en clínica)</Typography>
                  </Box>
                )}

                {discountPercentage > 0 && purchaseLocation !== 'external' && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Descuento ({discountPercentage}%):</Typography>
                    <Typography variant="body2" color="success.main">
                      -${((purchaseLocation === 'split' ? quantityInClinic : quantity) * selectedMedicine.unitPrice * discountPercentage / 100).toFixed(2)}
                    </Typography>
                  </Box>
                )}

                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total a Cobrar:</Typography>
                  <Typography variant="h6" color="primary">
                    ${calculateTotal().toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default MedicineSelector;