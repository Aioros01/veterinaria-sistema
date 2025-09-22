import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Alert,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import ClientPetSelector, { Client, Pet } from '../components/sales/ClientPetSelector';
import PrescriptionSelector from '../components/sales/PrescriptionSelector';
import MedicineSelector from '../components/sales/MedicineSelector';
import SalesSummary from '../components/sales/SalesSummary';
import { medicineSaleService } from '../services/api';

interface Prescription {
  id: string;
  medicine: any;
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  prescriptionDate: string;
  purchaseStatus: string;
}

export interface SaleData {
  clientId: string;
  petId: string;
  prescriptionId?: string;
  medicineId: string;
  medicineName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  purchaseLocation: 'in_clinic' | 'external' | 'split';
  quantityInClinic?: number;
  quantityExternal?: number;
  discountPercentage?: number;
  notes?: string;
  externalPharmacy?: string;
}

const Sales: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [saleType, setSaleType] = useState<'prescription' | 'direct'>('prescription');
  const [saleData, setSaleData] = useState<SaleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const steps = [
    'Seleccionar Cliente y Mascota',
    'Seleccionar Prescripción o Venta Directa',
    'Configurar Venta',
    'Confirmar y Procesar'
  ];

  const handleNext = () => {
    if (activeStep === 0 && (!selectedClient || !selectedPet)) {
      setError('Por favor selecciona un cliente y una mascota');
      return;
    }
    if (activeStep === 1 && saleType === 'prescription' && !selectedPrescription) {
      setError('Por favor selecciona una prescripción o cambia a venta directa');
      return;
    }
    if (activeStep === 2 && !saleData) {
      setError('Por favor completa la información de la venta');
      return;
    }

    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedClient(null);
    setSelectedPet(null);
    setSelectedPrescription(null);
    setSaleType('prescription');
    setSaleData(null);
    setError('');
    setSuccess('');
  };

  const processSale = async () => {
    if (!saleData || !selectedClient || !selectedPet) {
      setError('Faltan datos para procesar la venta');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const requestData = {
        ...saleData,
        clientId: selectedClient.id,
        petId: selectedPet.id,
        prescriptionId: selectedPrescription?.id,
        clientEmail: selectedClient.email
      };

      if (selectedPrescription) {
        // Venta desde prescripción
        await medicineSaleService.createFromPrescription(requestData);
      } else {
        // Venta directa
        await medicineSaleService.create(requestData);
      }

      setSuccess('Venta procesada exitosamente');
      setTimeout(() => {
        handleReset();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar la venta');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <ClientPetSelector
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
            selectedPet={selectedPet}
            setSelectedPet={setSelectedPet}
          />
        );
      case 1:
        return (
          <PrescriptionSelector
            petId={selectedPet?.id || ''}
            saleType={saleType}
            setSaleType={setSaleType}
            selectedPrescription={selectedPrescription}
            setSelectedPrescription={setSelectedPrescription}
          />
        );
      case 2:
        return (
          <MedicineSelector
            prescription={selectedPrescription}
            saleType={saleType}
            onSaleDataChange={setSaleData}
            existingSaleData={saleData}
          />
        );
      case 3:
        return (
          <SalesSummary
            client={selectedClient!}
            pet={selectedPet!}
            prescription={selectedPrescription}
            saleData={saleData!}
          />
        );
      default:
        return 'Paso desconocido';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ShoppingCartIcon /> Gestión de Ventas
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ minHeight: 400 }}>
          {activeStep === steps.length ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                ¡Venta completada exitosamente!
              </Typography>
              <Button onClick={handleReset} sx={{ mt: 2 }}>
                Nueva Venta
              </Button>
            </Box>
          ) : (
            <>
              {getStepContent(activeStep)}

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  startIcon={<ArrowBackIcon />}
                >
                  Atrás
                </Button>

                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={processSale}
                    disabled={loading || !saleData}
                    startIcon={loading ? <CircularProgress size={20} /> : <ShoppingCartIcon />}
                  >
                    {loading ? 'Procesando...' : 'Procesar Venta'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForwardIcon />}
                  >
                    Siguiente
                  </Button>
                )}
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Sales;