import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Chip,
  Card,
  CardContent,
  Divider,
  Alert,
} from '@mui/material';
import { 
  ExpandMore,
  LocalHospital as HospitalIcon,
  MedicalServices as MedicalIcon
} from '@mui/icons-material';
import { medicalHistoryService } from '../services/api';
import api from '../services/api';

interface MedicalHistoryRecord {
  id: string;
  visitDate: string;
  reasonForVisit: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  weight: number;
  temperature: number;
  veterinarian: {
    firstName: string;
    lastName: string;
  };
  prescriptions: Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
}

interface Hospitalization {
  id: string;
  admissionDate: string;
  dischargeDate?: string;
  reasonForAdmission: string;
  diagnosis: string;
  status: string;
  dischargeType?: string;
  dischargeNotes?: string;
  veterinarian: {
    firstName: string;
    lastName: string;
  };
  medications?: Array<{
    medicationName: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate?: string;
    administrations?: Array<{
      administeredAt: string;
      administeredBy: {
        firstName: string;
        lastName: string;
      };
    }>;
  }>;
}

const MedicalHistory: React.FC = () => {
  const { petId } = useParams<{ petId: string }>();
  const [histories, setHistories] = useState<MedicalHistoryRecord[]>([]);
  const [hospitalizations, setHospitalizations] = useState<Hospitalization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (petId) {
      loadData();
    }
  }, [petId]);

  const loadData = async () => {
    try {
      // Cargar historial médico
      const historyResponse = await medicalHistoryService.getByPet(petId!);
      setHistories(historyResponse.data.histories);
      
      // Cargar hospitalizaciones
      try {
        const hospResponse = await api.get(`/hospitalizations/pet/${petId}`);
        setHospitalizations(hospResponse.data.hospitalizations || []);
      } catch (hospError) {
        console.error('Error loading hospitalizations:', hospError);
      }
    } catch (error) {
      console.error('Error loading medical history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'admitted': return 'warning';
      case 'discharged': return 'success';
      case 'in_treatment': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'admitted': return 'Hospitalizado';
      case 'discharged': return 'Dado de Alta';
      case 'in_treatment': return 'En Tratamiento';
      default: return status;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        <MedicalIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Historial Médico
      </Typography>

      {/* Sección de Hospitalizaciones */}
      {hospitalizations.length > 0 && (
        <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              <HospitalIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Historial de Hospitalizaciones
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {hospitalizations.map((hosp) => (
              <Accordion key={hosp.id} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Typography variant="h6">
                      {formatDate(hosp.admissionDate)}
                    </Typography>
                    <Typography color="textSecondary">
                      {hosp.reasonForAdmission}
                    </Typography>
                    <Chip 
                      label={getStatusLabel(hosp.status)}
                      color={getStatusColor(hosp.status) as any}
                      size="small"
                      sx={{ ml: 'auto' }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          <strong>Diagnóstico</strong>
                        </TableCell>
                        <TableCell>{hosp.diagnosis}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          <strong>Veterinario</strong>
                        </TableCell>
                        <TableCell>
                          Dr. {hosp.veterinarian.firstName} {hosp.veterinarian.lastName}
                        </TableCell>
                      </TableRow>
                      {hosp.dischargeDate && (
                        <TableRow>
                          <TableCell component="th" scope="row">
                            <strong>Fecha de Alta</strong>
                          </TableCell>
                          <TableCell>{formatDate(hosp.dischargeDate)}</TableCell>
                        </TableRow>
                      )}
                      {hosp.dischargeType && (
                        <TableRow>
                          <TableCell component="th" scope="row">
                            <strong>Tipo de Alta</strong>
                          </TableCell>
                          <TableCell>{hosp.dischargeType}</TableCell>
                        </TableRow>
                      )}
                      {hosp.dischargeNotes && (
                        <TableRow>
                          <TableCell component="th" scope="row">
                            <strong>Notas de Alta</strong>
                          </TableCell>
                          <TableCell>{hosp.dischargeNotes}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {hosp.medications && hosp.medications.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="subtitle1" gutterBottom>
                        <strong>Medicamentos Administrados:</strong>
                      </Typography>
                      {hosp.medications.map((med, index) => (
                        <Box key={index} sx={{ mb: 1, pl: 2 }}>
                          <Typography variant="body2">
                            • {med.medicationName} - {med.dosage} - {med.frequency}
                          </Typography>
                          {med.administrations && med.administrations.length > 0 && (
                            <Typography variant="caption" color="textSecondary" sx={{ pl: 2 }}>
                              {med.administrations.length} administraciones registradas
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Sección de Consultas Médicas */}
      <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
        Consultas Médicas
      </Typography>
      {histories.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" color="textSecondary" align="center">
            No hay historial médico para esta mascota
          </Typography>
        </Paper>
      ) : (
        histories.map((history) => (
          <Accordion key={history.id} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Typography variant="h6">
                  {new Date(history.visitDate).toLocaleDateString()}
                </Typography>
                <Typography color="textSecondary">
                  {history.reasonForVisit}
                </Typography>
                <Typography sx={{ ml: 'auto', mr: 2 }} color="textSecondary">
                  Dr. {history.veterinarian.firstName} {history.veterinarian.lastName}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      <strong>Síntomas</strong>
                    </TableCell>
                    <TableCell>{history.symptoms || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      <strong>Diagnóstico</strong>
                    </TableCell>
                    <TableCell>{history.diagnosis}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      <strong>Tratamiento</strong>
                    </TableCell>
                    <TableCell>{history.treatment}</TableCell>
                  </TableRow>
                  {history.weight && (
                    <TableRow>
                      <TableCell component="th" scope="row">
                        <strong>Peso</strong>
                      </TableCell>
                      <TableCell>{history.weight} kg</TableCell>
                    </TableRow>
                  )}
                  {history.temperature && (
                    <TableRow>
                      <TableCell component="th" scope="row">
                        <strong>Temperatura</strong>
                      </TableCell>
                      <TableCell>{history.temperature} °C</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {history.prescriptions && history.prescriptions.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Prescripciones:</strong>
                  </Typography>
                  {history.prescriptions.map((prescription, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Chip
                        label={`${prescription.medicineName} - ${prescription.dosage} - ${prescription.frequency} por ${prescription.duration}`}
                        variant="outlined"
                        sx={{ mb: 0.5 }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
};

export default MedicalHistory;