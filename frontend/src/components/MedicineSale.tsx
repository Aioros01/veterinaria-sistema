import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Chip,
  InputAdornment,
  Snackbar,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Store as StoreIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { medicineService, medicineSaleService } from '../services/api';

interface Medicine {
  id: number;
  name: string;
  genericName: string;
  manufacturer: string;
  category: string;
  description: string;
  presentation: string;
  concentration: string;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  supplier: string;
  expirationDate: string;
  storageConditions: string;
  isActive: boolean;
}

const MedicineSale: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [clientEmail, setClientEmail] = useState('');
  const [purchaseLocation, setPurchaseLocation] = useState<'clinic' | 'external' | 'split'>('clinic');
  const [quantityInClinic, setQuantityInClinic] = useState(0);
  const [quantityExternal, setQuantityExternal] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [stockSuggestion, setStockSuggestion] = useState<string>('');
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadMedicines();
  }, []);

  useEffect(() => {
    if (selectedMedicine) {
      checkStockAndSuggest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMedicine, quantity]);

  const loadMedicines = async () => {
    try {
      const response = await medicineService.getAll();
      const medicinesData = response.data || response;
      setMedicines(Array.isArray(medicinesData) ? medicinesData : []);
    } catch (error) {
      console.error('Error loading medicines:', error);
      setMedicines([]); // Asegurar que siempre sea un array
    }
  };

  const checkStockAndSuggest = () => {
    if (!selectedMedicine) return;

    const remainingStock = selectedMedicine.currentStock - quantity;

    if (remainingStock < 0) {
      setStockSuggestion(`⚠️ No hay suficiente stock. Stock disponible: ${selectedMedicine.currentStock}`);
    } else if (remainingStock <= selectedMedicine.minimumStock) {
      setStockSuggestion(`⚠️ Después de esta venta, el stock quedará en ${remainingStock} unidades (por debajo del mínimo de ${selectedMedicine.minimumStock}). Considera reordenar pronto.`);
    } else {
      setStockSuggestion('');
    }
  };

  const handleMedicineChange = (medicineId: string) => {
    const medicine = medicines.find(m => m.id === Number(medicineId));
    setSelectedMedicine(medicine || null);
    if (medicine) {
      setQuantity(1);
      setQuantityInClinic(0);
      setQuantityExternal(0);
    }
  };

  const handleQuantityChange = (value: number) => {
    if (value >= 1) {
      setQuantity(value);
      if (purchaseLocation === 'split') {
        const clinicQty = Math.min(value, selectedMedicine?.currentStock || 0);
        setQuantityInClinic(clinicQty);
        setQuantityExternal(Math.max(0, value - clinicQty));
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedMedicine) {
      setNotification({
        open: true,
        message: 'Por favor selecciona un medicamento',
        severity: 'error'
      });
      return;
    }

    if (quantity < 1) {
      setNotification({
        open: true,
        message: 'La cantidad debe ser al menos 1',
        severity: 'error'
      });
      return;
    }

    if (!clientEmail) {
      setNotification({
        open: true,
        message: 'Por favor ingresa el email del cliente',
        severity: 'error'
      });
      return;
    }

    if (purchaseLocation === 'split' && (quantityInClinic + quantityExternal) !== quantity) {
      setNotification({
        open: true,
        message: 'La suma de las cantidades debe ser igual al total',
        severity: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      const saleData = {
        medicineId: selectedMedicine.id,
        quantity,
        unitPrice: selectedMedicine.unitPrice,
        clientEmail,
        prescriptionNumber: `PRES-${Date.now()}`,
        notes: notes || undefined,
        purchaseLocation,
        quantityInClinic: purchaseLocation === 'split' ? quantityInClinic : undefined,
        quantityExternal: purchaseLocation === 'split' ? quantityExternal : undefined
      };

      await medicineSaleService.create(saleData);

      setNotification({
        open: true,
        message: 'Venta registrada exitosamente',
        severity: 'success'
      });

      // Reset form
      setSelectedMedicine(null);
      setQuantity(1);
      setClientEmail('');
      setPurchaseLocation('clinic');
      setQuantityInClinic(0);
      setQuantityExternal(0);
      setNotes('');
      setStockSuggestion('');

      // Reload medicines to update stock
      loadMedicines();
    } catch (error) {
      setNotification({
        open: true,
        message: 'Error al registrar la venta',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (medicine: Medicine) => {
    if (medicine.currentStock === 0) {
      return <Chip label="Sin Stock" color="error" size="small" />;
    } else if (medicine.currentStock <= medicine.minimumStock) {
      return <Chip label="Stock Bajo" color="warning" size="small" />;
    }
    return <Chip label="Stock Normal" color="success" size="small" />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ShoppingCartIcon /> Venta de Medicamentos
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Registra ventas de medicamentos con control automático de inventario
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Selección de Medicamento */}
          <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
            <FormControl fullWidth>
              <InputLabel>Medicamento</InputLabel>
              <Select
                value={selectedMedicine?.id || ''}
                onChange={(e) => handleMedicineChange(String(e.target.value))}
                label="Medicamento"
              >
                {medicines.map((medicine) => (
                  <MenuItem key={medicine.id} value={medicine.id}>
                    <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
                      <Box>
                        <Typography variant="body2">
                          {medicine.name} - {medicine.presentation} {medicine.concentration}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Stock: {medicine.currentStock} | ${medicine.unitPrice}
                        </Typography>
                      </Box>
                      {getStockStatus(medicine)}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Cantidad */}
          <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
            <TextField
              label="Cantidad"
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(Number(e.target.value))}
              fullWidth
              inputProps={{ min: 1 }}
              InputProps={{
                endAdornment: selectedMedicine && (
                  <InputAdornment position="end">
                    unidades
                  </InputAdornment>
                )
              }}
            />
          </Box>

          {/* Email del Cliente */}
          <Box sx={{ width: '100%' }}>
            <TextField
              label="Email del Cliente"
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              fullWidth
              placeholder="cliente@ejemplo.com"
            />
          </Box>

          {/* Alerta de Stock */}
          {stockSuggestion && (
            <Box sx={{ width: '100%' }}>
              <Alert severity="warning" icon={<WarningIcon />}>
                {stockSuggestion}
              </Alert>
            </Box>
          )}

          {/* Modalidad de Compra */}
          <Box sx={{ width: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Modalidad de Compra
            </Typography>
            <RadioGroup
              value={purchaseLocation}
              onChange={(e) => {
                const value = e.target.value as 'clinic' | 'external' | 'split';
                setPurchaseLocation(value);
                if (value === 'split' && selectedMedicine) {
                  const clinicQty = Math.min(quantity, selectedMedicine.currentStock);
                  setQuantityInClinic(clinicQty);
                  setQuantityExternal(Math.max(0, quantity - clinicQty));
                }
              }}
              row
            >
              <FormControlLabel
                value="clinic"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocalPharmacyIcon fontSize="small" />
                    <span>Todo en Clínica</span>
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
                label="Parcial (Clínica + Externo)"
              />
            </RadioGroup>
          </Box>

          {/* Cantidades Split */}
          {purchaseLocation === 'split' && (
            <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  label="Cantidad en Clínica"
                  type="number"
                  value={quantityInClinic}
                  onChange={(e) => setQuantityInClinic(Number(e.target.value))}
                  fullWidth
                  inputProps={{ min: 0, max: selectedMedicine?.currentStock || 0 }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  label="Cantidad Externa"
                  type="number"
                  value={quantityExternal}
                  onChange={(e) => setQuantityExternal(Number(e.target.value))}
                  fullWidth
                  inputProps={{ min: 0 }}
                />
              </Box>
            </Box>
          )}

          {/* Notas */}
          <Box sx={{ width: '100%' }}>
            <TextField
              label="Notas (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder="Observaciones adicionales sobre la venta..."
            />
          </Box>
        </Box>

        {/* Resumen de Venta */}
        {selectedMedicine && (
          <Card sx={{ mt: 3, bgcolor: 'background.default' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resumen de Venta
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Medicamento:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {selectedMedicine.name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Cantidad:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {quantity} unidades
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Precio unitario:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    ${selectedMedicine.unitPrice}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6" color="primary">
                    ${(selectedMedicine.unitPrice * quantity).toFixed(2)}
                  </Typography>
                </Box>
                {purchaseLocation === 'split' && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      • {quantityInClinic} unidades de inventario clínica
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      • {quantityExternal} unidades compra externa
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Botón de Registro */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSubmit}
            disabled={!selectedMedicine || quantity < 1 || !clientEmail || loading}
            startIcon={<ShoppingCartIcon />}
          >
            {loading ? 'Procesando...' : 'Registrar Venta'}
          </Button>
        </Box>
      </Paper>

      {/* Notificación */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MedicineSale;