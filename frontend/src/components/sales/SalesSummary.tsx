import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
  Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Pets as PetsIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Store as StoreIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { SaleData } from '../../pages/Sales';
import { Client, Pet } from './ClientPetSelector';

interface Prescription {
  id: string;
  medicine: any;
  dosage: string;
  frequency: string;
  duration: string;
}

interface SalesSummaryProps {
  client: Client;
  pet: Pet;
  prescription: Prescription | null;
  saleData: SaleData;
}

const SalesSummary: React.FC<SalesSummaryProps> = ({
  client,
  pet,
  prescription,
  saleData
}) => {
  const getPurchaseLocationLabel = (location: string) => {
    switch (location) {
      case 'in_clinic':
        return { label: 'Compra en Clínica', icon: <LocalPharmacyIcon fontSize="small" />, color: 'success' as const };
      case 'external':
        return { label: 'Compra Externa', icon: <StoreIcon fontSize="small" />, color: 'info' as const };
      case 'split':
        return { label: 'Compra Parcial', icon: <ReceiptIcon fontSize="small" />, color: 'warning' as const };
      default:
        return { label: location, icon: undefined, color: 'default' as const };
    }
  };

  const locationInfo = getPurchaseLocationLabel(saleData.purchaseLocation);

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CheckCircleIcon color="primary" /> Resumen de la Venta
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Por favor revisa todos los detalles antes de procesar la venta
      </Alert>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Información del Cliente */}
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon fontSize="small" /> Cliente
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="body2">
                <strong>Nombre:</strong> {client.firstName} {client.lastName}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {client.email}
              </Typography>
              {client.phone && (
                <Typography variant="body2">
                  <strong>Teléfono:</strong> {client.phone}
                </Typography>
              )}
              {client.address && (
                <Typography variant="body2">
                  <strong>Dirección:</strong> {client.address}
                </Typography>
              )}
              {client.documentNumber && (
                <Typography variant="body2">
                  <strong>{client.documentType === 'pasaporte' ? 'Pasaporte' : 'Cédula'}:</strong> {client.documentNumber}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Información de la Mascota */}
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PetsIcon fontSize="small" /> Mascota
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="body2">
                <strong>Nombre:</strong> {pet.name}
              </Typography>
              <Typography variant="body2">
                <strong>Especie:</strong> {pet.species}
              </Typography>
              <Typography variant="body2">
                <strong>Raza:</strong> {pet.breed}
              </Typography>
              <Typography variant="body2">
                <strong>Género:</strong> {pet.gender === 'male' ? 'Macho' : 'Hembra'}
              </Typography>
              {pet.weight && (
                <Typography variant="body2">
                  <strong>Peso:</strong> {pet.weight} kg
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Información del Medicamento */}
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalPharmacyIcon fontSize="small" /> Medicamento
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">
                  <strong>{saleData.medicineName}</strong>
                </Typography>
                <Chip
                  label={locationInfo.label}
                  icon={locationInfo.icon}
                  color={locationInfo.color}
                  size="small"
                />
              </Box>

              {prescription && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  <Typography variant="caption">
                    Venta desde prescripción: {prescription.dosage} - {prescription.frequency} por {prescription.duration}
                  </Typography>
                </Alert>
              )}

              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">
                  <strong>Cantidad Total:</strong> {saleData.quantity} unidades
                </Typography>

                {saleData.purchaseLocation === 'split' && (
                  <>
                    <Typography variant="body2" color="success.main">
                      • En clínica: {saleData.quantityInClinic} unidades
                    </Typography>
                    <Typography variant="body2" color="info.main">
                      • Externa: {saleData.quantityExternal} unidades
                    </Typography>
                  </>
                )}

                {saleData.externalPharmacy && (
                  <Typography variant="body2">
                    <strong>Farmacia Externa:</strong> {saleData.externalPharmacy}
                  </Typography>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Información de Precio */}
        <Card sx={{ bgcolor: 'primary.50' }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptIcon fontSize="small" /> Detalle de Precio
            </Typography>
            <Divider sx={{ my: 1 }} />

            {saleData.purchaseLocation === 'external' ? (
              <Alert severity="info">
                Compra externa - No se cobra en la clínica
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Precio unitario:</Typography>
                  <Typography variant="body2">${saleData.unitPrice.toFixed(2)}</Typography>
                </Box>

                {saleData.purchaseLocation === 'split' ? (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Cantidad en clínica:</Typography>
                      <Typography variant="body2">{saleData.quantityInClinic} unidades</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Subtotal:</Typography>
                      <Typography variant="body2">
                        ${((saleData.quantityInClinic || 0) * saleData.unitPrice).toFixed(2)}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Cantidad:</Typography>
                      <Typography variant="body2">{saleData.quantity} unidades</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Subtotal:</Typography>
                      <Typography variant="body2">
                        ${(saleData.quantity * saleData.unitPrice).toFixed(2)}
                      </Typography>
                    </Box>
                  </>
                )}

                {saleData.discountPercentage && saleData.discountPercentage > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Descuento ({saleData.discountPercentage}%):</Typography>
                    <Typography variant="body2" color="success.main">
                      -${(((saleData.purchaseLocation === 'split' ? (saleData.quantityInClinic || 0) : saleData.quantity) * saleData.unitPrice * saleData.discountPercentage) / 100).toFixed(2)}
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total a Cobrar:</Typography>
                  <Typography variant="h6" color="primary">
                    ${saleData.totalPrice.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Notas */}
        {saleData.notes && (
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Notas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {saleData.notes}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default SalesSummary;