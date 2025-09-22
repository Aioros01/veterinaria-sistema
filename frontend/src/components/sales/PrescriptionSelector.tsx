import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Description as DescriptionIcon,
  LocalPharmacy as LocalPharmacyIcon,
  ShoppingCart as ShoppingCartIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { prescriptionService } from '../../services/api';

interface Prescription {
  id: string;
  medicine: {
    id: string;
    name: string;
    presentation: string;
    concentration: string;
    unitPrice: number;
    currentStock: number;
  };
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  prescriptionDate: string;
  purchaseStatus: string;
  expirationDate?: string;
}

interface PrescriptionSelectorProps {
  petId: string;
  saleType: 'prescription' | 'direct';
  setSaleType: (type: 'prescription' | 'direct') => void;
  selectedPrescription: Prescription | null;
  setSelectedPrescription: (prescription: Prescription | null) => void;
}

const PrescriptionSelector: React.FC<PrescriptionSelectorProps> = ({
  petId,
  saleType,
  setSaleType,
  selectedPrescription,
  setSelectedPrescription
}) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (petId && saleType === 'prescription') {
      loadPrescriptions();
    }
  }, [petId, saleType]);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await prescriptionService.getByPet(petId);
      const prescriptionData = response.data || response;

      // Filtrar prescripciones activas y no completamente compradas
      const activePrescriptions = Array.isArray(prescriptionData)
        ? prescriptionData.filter((p: Prescription) =>
            p.purchaseStatus !== 'purchased_in_clinic' &&
            p.purchaseStatus !== 'purchased_complete'
          )
        : [];

      setPrescriptions(activePrescriptions);

      if (activePrescriptions.length === 0) {
        setError('No hay prescripciones pendientes para esta mascota');
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      setError('Error al cargar las prescripciones');
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getPurchaseStatusChip = (status: string) => {
    switch (status) {
      case 'not_purchased':
        return <Chip label="No comprado" color="warning" size="small" icon={<WarningIcon />} />;
      case 'partially_purchased':
        return <Chip label="Compra parcial" color="info" size="small" icon={<ShoppingCartIcon />} />;
      case 'purchased_external':
        return <Chip label="Comprado externamente" color="default" size="small" icon={<StoreIcon />} />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const isExpired = (expirationDate?: string) => {
    if (!expirationDate) return false;
    return new Date(expirationDate) < new Date();
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DescriptionIcon /> Tipo de Venta
      </Typography>

      <RadioGroup
        value={saleType}
        onChange={(e) => {
          setSaleType(e.target.value as 'prescription' | 'direct');
          setSelectedPrescription(null);
        }}
        sx={{ mb: 3 }}
      >
        <FormControlLabel
          value="prescription"
          control={<Radio />}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalPharmacyIcon fontSize="small" />
              <span>Venta desde Prescripción</span>
            </Box>
          }
        />
        <FormControlLabel
          value="direct"
          control={<Radio />}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShoppingCartIcon fontSize="small" />
              <span>Venta Directa (sin prescripción)</span>
            </Box>
          }
        />
      </RadioGroup>

      {saleType === 'prescription' && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Prescripciones Disponibles
          </Typography>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {error && !loading && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!loading && prescriptions.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {prescriptions.map((prescription) => (
                <Card
                  key={prescription.id}
                  sx={{
                    cursor: 'pointer',
                    border: selectedPrescription?.id === prescription.id ? 2 : 1,
                    borderColor: selectedPrescription?.id === prescription.id ? 'primary.main' : 'divider',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                  onClick={() => setSelectedPrescription(prescription)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Typography variant="h6">
                        {prescription.medicine.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {getPurchaseStatusChip(prescription.purchaseStatus)}
                        {isExpired(prescription.expirationDate) && (
                          <Chip label="Expirada" color="error" size="small" />
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Presentación</Typography>
                        <Typography variant="body2">
                          {prescription.medicine.presentation} {prescription.medicine.concentration}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Cantidad</Typography>
                        <Typography variant="body2">{prescription.quantity} unidades</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Precio Unitario</Typography>
                        <Typography variant="body2">${prescription.medicine.unitPrice}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Stock Disponible</Typography>
                        <Typography variant="body2">{prescription.medicine.currentStock} unidades</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ bgcolor: 'background.default', p: 1.5, borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">Posología</Typography>
                      <Typography variant="body2">
                        {prescription.dosage} - {prescription.frequency} por {prescription.duration}
                      </Typography>
                      {prescription.instructions && (
                        <>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Instrucciones
                          </Typography>
                          <Typography variant="body2">{prescription.instructions}</Typography>
                        </>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ScheduleIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          Prescrita el {formatDate(prescription.prescriptionDate)}
                        </Typography>
                      </Box>
                      {selectedPrescription?.id === prescription.id && (
                        <CheckCircleIcon color="primary" />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {!loading && prescriptions.length === 0 && !error && (
            <Alert severity="info">
              No se encontraron prescripciones para esta mascota
            </Alert>
          )}
        </Box>
      )}

      {saleType === 'direct' && (
        <Alert severity="info" icon={<ShoppingCartIcon />}>
          Has seleccionado venta directa. En el siguiente paso podrás elegir el medicamento y configurar la venta.
        </Alert>
      )}
    </Box>
  );
};

// Icono faltante
const StoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 6h14c.55 0 1-.45 1-1s-.45-1-1-1H5c-.55 0-1 .45-1 1s.45 1 1 1zm15.16 1.8c-.09-.46-.5-.8-.98-.8H4.82c-.48 0-.89.34-.98.8l-1.03 5c-.12.57.34 1.08.93 1.08h1.04c.51 0 .94-.38.99-.88l.22-1.12h11.98l.22 1.12c.05.5.48.88.99.88h1.04c.59 0 1.05-.51.93-1.08l-1.03-5zM4 19v-4.08c.33.05.66.08 1 .08h1v4c0 .55.45 1 1 1s1-.45 1-1v-4h8v4c0 .55.45 1 1 1s1-.45 1-1v-4h1c.34 0 .67-.03 1-.08V19c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2z"/>
  </svg>
);

export default PrescriptionSelector;