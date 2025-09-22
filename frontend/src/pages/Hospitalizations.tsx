import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Card,
  CardContent,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip
} from '@mui/material';
import Grid from '../components/GridCompat';
import {
  Add as AddIcon,
  LocalHospital as HospitalIcon,
  Medication as MedicationIcon,
  Note as NoteIcon,
  ExitToApp as DischargeIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import api from '../services/api';
import { medicineService } from '../services/api';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  owner?: {
    firstName: string;
    lastName: string;
  };
}

interface Hospitalization {
  id: string;
  admissionDate: string;
  dischargeDate?: string;
  diagnosis: string;
  reasonForAdmission?: string;
  treatmentPlan?: string;
  dischargeType?: string;
  dischargeNotes?: string;
  isActive: boolean;
  pet: Pet;
  veterinarian: {
    firstName: string;
    lastName: string;
  };
  medications?: HospitalizationMedication[];
  notes?: HospitalizationNote[];
}

interface HospitalizationMedication {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  route?: string;
  lastAdministered?: string;
  nextDue?: string;
  administrationLog?: any[];
  isActive: boolean;
}

interface HospitalizationNote {
  id: string;
  note: string;
  vitalSigns?: any;
  createdAt: string;
  author: {
    firstName: string;
    lastName: string;
  };
}

export default function Hospitalizations() {
  const [hospitalizations, setHospitalizations] = useState<Hospitalization[]>([]);
  const [selectedHospitalization, setSelectedHospitalization] = useState<Hospitalization | null>(null);
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openMedicationDialog, setOpenMedicationDialog] = useState(false);
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [openDischargeDialog, setOpenDischargeDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [pets, setPets] = useState<Pet[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const [newHospitalization, setNewHospitalization] = useState({
    petId: '',
    admissionDate: new Date().toISOString().split('T')[0],
    diagnosis: '',
    reasonForAdmission: '',
    treatmentPlan: ''
  });

  const [newMedication, setNewMedication] = useState({
    medicineId: '',
    medicationName: '',
    dosage: '',
    frequency: '',
    route: 'Oral',
    unitPrice: 0
  });

  const [newNote, setNewNote] = useState({
    note: '',
    temperature: '',
    heartRate: '',
    respiratoryRate: '',
    bloodPressure: ''
  });

  const [dischargeData, setDischargeData] = useState({
    dischargeType: 'normal',
    dischargeNotes: ''
  });

  useEffect(() => {
    loadHospitalizations();
    loadPets();
    loadMedicines();
  }, []);

  const loadHospitalizations = async () => {
    try {
      const response = await api.get('/hospitalizations/active');
      setHospitalizations(response.data.hospitalizations || []);
    } catch (error: any) {
      console.error('Error loading hospitalizations:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al cargar hospitalizaciones',
        severity: 'error'
      });
    }
  };

  const loadPets = async () => {
    try {
      const response = await api.get('/pets');
      setPets(response.data.pets || []);
    } catch (error) {
      console.error('Error loading pets:', error);
    }
  };

  const loadMedicines = async () => {
    try {
      const response = await medicineService.getAll();
      const medicineData = response.data || response;
      setMedicines(Array.isArray(medicineData) ? medicineData : []);
    } catch (error) {
      console.error('Error loading medicines:', error);
      setMedicines([]);
    }
  };

  const handleCreateHospitalization = async () => {
    try {
      await api.post('/hospitalizations', newHospitalization);
      setSnackbar({
        open: true,
        message: 'Hospitalización creada exitosamente',
        severity: 'success'
      });
      setOpenNewDialog(false);
      loadHospitalizations();
      setNewHospitalization({
        petId: '',
        admissionDate: new Date().toISOString().split('T')[0],
        diagnosis: '',
        reasonForAdmission: '',
        treatmentPlan: ''
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al crear hospitalización',
        severity: 'error'
      });
    }
  };

  const handleAddMedication = async () => {
    if (!selectedHospitalization) return;

    try {
      await api.post(`/hospitalizations/${selectedHospitalization.id}/medications`, newMedication);
      setSnackbar({
        open: true,
        message: 'Medicamento agregado exitosamente',
        severity: 'success'
      });
      setOpenMedicationDialog(false);
      loadHospitalizationDetails(selectedHospitalization.id);
      setNewMedication({
        medicineId: '',
        medicationName: '',
        dosage: '',
        frequency: '',
        route: 'Oral',
        unitPrice: 0
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al agregar medicamento',
        severity: 'error'
      });
    }
  };

  const handleAddNote = async () => {
    if (!selectedHospitalization) return;

    const vitalSigns = {
      temperature: newNote.temperature || null,
      heartRate: newNote.heartRate || null,
      respiratoryRate: newNote.respiratoryRate || null,
      bloodPressure: newNote.bloodPressure || null
    };

    try {
      await api.post(`/hospitalizations/${selectedHospitalization.id}/notes`, {
        note: newNote.note,
        vitalSigns
      });
      setSnackbar({
        open: true,
        message: 'Nota agregada exitosamente',
        severity: 'success'
      });
      setOpenNoteDialog(false);
      loadHospitalizationDetails(selectedHospitalization.id);
      setNewNote({
        note: '',
        temperature: '',
        heartRate: '',
        respiratoryRate: '',
        bloodPressure: ''
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al agregar nota',
        severity: 'error'
      });
    }
  };

  const handleAdministerMedication = async (medicationId: string) => {
    try {
      await api.post(`/hospitalizations/medications/${medicationId}/administer`, {
        administeredBy: 'current_user',
        notes: 'Administrado correctamente'
      });
      setSnackbar({
        open: true,
        message: 'Medicamento administrado',
        severity: 'success'
      });
      if (selectedHospitalization) {
        loadHospitalizationDetails(selectedHospitalization.id);
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al administrar medicamento',
        severity: 'error'
      });
    }
  };

  const handleDischarge = async () => {
    if (!selectedHospitalization) return;

    try {
      await api.post(`/hospitalizations/${selectedHospitalization.id}/discharge`, dischargeData);
      setSnackbar({
        open: true,
        message: 'Alta médica registrada exitosamente',
        severity: 'success'
      });
      setOpenDischargeDialog(false);
      setOpenDetailsDialog(false);
      loadHospitalizations();
      setDischargeData({
        dischargeType: 'normal',
        dischargeNotes: ''
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al dar de alta',
        severity: 'error'
      });
    }
  };

  const loadHospitalizationDetails = async (id: string) => {
    try {
      const response = await api.get(`/hospitalizations/${id}`);
      setSelectedHospitalization(response.data.hospitalization);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al cargar detalles',
        severity: 'error'
      });
    }
  };

  const handleViewDetails = (hospitalization: Hospitalization) => {
    loadHospitalizationDetails(hospitalization.id);
    setOpenDetailsDialog(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (nextDue?: string) => {
    if (!nextDue) return false;
    return new Date(nextDue) < new Date();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          <HospitalIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Hospitalizaciones
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenNewDialog(true)}
        >
          Nueva Hospitalización
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mascota</TableCell>
              <TableCell>Propietario</TableCell>
              <TableCell>Fecha Ingreso</TableCell>
              <TableCell>Diagnóstico</TableCell>
              <TableCell>Veterinario</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hospitalizations.map((hosp) => (
              <TableRow key={hosp.id}>
                <TableCell>{hosp.pet.name}</TableCell>
                <TableCell>
                  {hosp.pet.owner 
                    ? `${hosp.pet.owner.firstName} ${hosp.pet.owner.lastName}`
                    : 'No asignado'}
                </TableCell>
                <TableCell>{formatDate(hosp.admissionDate)}</TableCell>
                <TableCell>{hosp.diagnosis}</TableCell>
                <TableCell>
                  Dr. {hosp.veterinarian.firstName} {hosp.veterinarian.lastName}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={hosp.isActive ? 'Activo' : 'Alta'}
                    color={hosp.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Ver detalles">
                    <IconButton onClick={() => handleViewDetails(hosp)}>
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Nueva Hospitalización */}
      <Dialog open={openNewDialog} onClose={() => setOpenNewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Hospitalización</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Mascota</InputLabel>
            <Select
              value={newHospitalization.petId}
              onChange={(e) => setNewHospitalization({...newHospitalization, petId: e.target.value})}
              label="Mascota"
            >
              {pets.map(pet => (
                <MenuItem key={pet.id} value={pet.id}>
                  {pet.name} - {pet.species}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="Fecha de Ingreso"
            type="date"
            value={newHospitalization.admissionDate}
            onChange={(e) => setNewHospitalization({...newHospitalization, admissionDate: e.target.value})}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Diagnóstico"
            value={newHospitalization.diagnosis}
            onChange={(e) => setNewHospitalization({...newHospitalization, diagnosis: e.target.value})}
            multiline
            rows={2}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Motivo de Ingreso"
            value={newHospitalization.reasonForAdmission}
            onChange={(e) => setNewHospitalization({...newHospitalization, reasonForAdmission: e.target.value})}
            multiline
            rows={2}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Plan de Tratamiento"
            value={newHospitalization.treatmentPlan}
            onChange={(e) => setNewHospitalization({...newHospitalization, treatmentPlan: e.target.value})}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateHospitalization} variant="contained">Crear</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Detalles */}
      <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Detalles de Hospitalización - {selectedHospitalization?.pet.name}
          {selectedHospitalization?.isActive && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DischargeIcon />}
              onClick={() => setOpenDischargeDialog(true)}
              sx={{ float: 'right' }}
            >
              Dar de Alta
            </Button>
          )}
        </DialogTitle>
        <DialogContent>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="Información General" />
            <Tab label="Medicamentos" />
            <Tab label="Notas de Evolución" />
          </Tabs>

          {tabValue === 0 && selectedHospitalization && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Fecha de Ingreso:</Typography>
                  <Typography>{formatDate(selectedHospitalization.admissionDate)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Veterinario:</Typography>
                  <Typography>
                    Dr. {selectedHospitalization.veterinarian.firstName} {selectedHospitalization.veterinarian.lastName}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Diagnóstico:</Typography>
                  <Typography>{selectedHospitalization.diagnosis}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Motivo de Ingreso:</Typography>
                  <Typography>{selectedHospitalization.reasonForAdmission || 'No especificado'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Plan de Tratamiento:</Typography>
                  <Typography>{selectedHospitalization.treatmentPlan || 'No especificado'}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}

          {tabValue === 1 && selectedHospitalization && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<MedicationIcon />}
                onClick={() => setOpenMedicationDialog(true)}
                sx={{ mb: 2 }}
              >
                Agregar Medicamento
              </Button>
              <List>
                {selectedHospitalization.medications?.map((med) => (
                  <Card key={med.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={8}>
                          <Typography variant="h6">{med.medicationName}</Typography>
                          <Typography>Dosis: {med.dosage}</Typography>
                          <Typography>Frecuencia: {med.frequency}</Typography>
                          <Typography>Vía: {med.route || 'No especificada'}</Typography>
                          {med.lastAdministered && (
                            <Typography variant="body2" color="text.secondary">
                              Última administración: {formatDate(med.lastAdministered)}
                            </Typography>
                          )}
                          {med.nextDue && (
                            <Typography 
                              variant="body2" 
                              color={isOverdue(med.nextDue) ? 'error' : 'text.secondary'}
                            >
                              Próxima dosis: {formatDate(med.nextDue)}
                            </Typography>
                          )}
                        </Grid>
                        <Grid item xs={4} sx={{ textAlign: 'right' }}>
                          {med.isActive && (
                            <Button
                              variant="contained"
                              color={isOverdue(med.nextDue) ? 'error' : 'primary'}
                              startIcon={<CheckIcon />}
                              onClick={() => handleAdministerMedication(med.id)}
                            >
                              Administrar
                            </Button>
                          )}
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </List>
            </Box>
          )}

          {tabValue === 2 && selectedHospitalization && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<NoteIcon />}
                onClick={() => setOpenNoteDialog(true)}
                sx={{ mb: 2 }}
              >
                Agregar Nota
              </Button>
              <List>
                {selectedHospitalization.notes?.map((note) => (
                  <Card key={note.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(note.createdAt)} - {note.author.firstName} {note.author.lastName}
                      </Typography>
                      <Typography sx={{ mt: 1 }}>{note.note}</Typography>
                      {note.vitalSigns && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="subtitle2">Signos Vitales:</Typography>
                          {note.vitalSigns.temperature && (
                            <Typography variant="body2">Temperatura: {note.vitalSigns.temperature}°C</Typography>
                          )}
                          {note.vitalSigns.heartRate && (
                            <Typography variant="body2">FC: {note.vitalSigns.heartRate} lpm</Typography>
                          )}
                          {note.vitalSigns.respiratoryRate && (
                            <Typography variant="body2">FR: {note.vitalSigns.respiratoryRate} rpm</Typography>
                          )}
                          {note.vitalSigns.bloodPressure && (
                            <Typography variant="body2">PA: {note.vitalSigns.bloodPressure}</Typography>
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Agregar Medicamento */}
      <Dialog open={openMedicationDialog} onClose={() => setOpenMedicationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Medicamento</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Medicamento</InputLabel>
            <Select
              value={newMedication.medicineId}
              onChange={(e) => {
                const medicine = medicines.find(m => m.id === e.target.value);
                if (medicine) {
                  setNewMedication({
                    ...newMedication,
                    medicineId: medicine.id,
                    medicationName: medicine.name,
                    unitPrice: medicine.unitPrice
                  });
                }
              }}
              label="Medicamento"
            >
              {medicines.map((medicine) => (
                <MenuItem key={medicine.id} value={medicine.id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Typography variant="body2">
                      {medicine.name} - {medicine.presentation} {medicine.concentration}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Stock: {medicine.currentStock} | ${medicine.unitPrice}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="Dosis"
            value={newMedication.dosage}
            onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Frecuencia"
            value={newMedication.frequency}
            onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
            placeholder="Ej: Cada 8 horas"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Vía de Administración</InputLabel>
            <Select
              value={newMedication.route}
              onChange={(e) => setNewMedication({...newMedication, route: e.target.value})}
              label="Vía de Administración"
            >
              <MenuItem value="Oral">Oral</MenuItem>
              <MenuItem value="Intravenosa">Intravenosa</MenuItem>
              <MenuItem value="Intramuscular">Intramuscular</MenuItem>
              <MenuItem value="Subcutánea">Subcutánea</MenuItem>
              <MenuItem value="Tópica">Tópica</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMedicationDialog(false)}>Cancelar</Button>
          <Button onClick={handleAddMedication} variant="contained">Agregar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Agregar Nota */}
      <Dialog open={openNoteDialog} onClose={() => setOpenNoteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Nota de Evolución</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Nota"
            value={newNote.note}
            onChange={(e) => setNewNote({...newNote, note: e.target.value})}
            multiline
            rows={4}
          />
          <Typography variant="subtitle2" sx={{ mt: 2 }}>Signos Vitales (opcional)</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Temperatura (°C)"
                value={newNote.temperature}
                onChange={(e) => setNewNote({...newNote, temperature: e.target.value})}
                type="number"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                margin="normal"
                label="FC (lpm)"
                value={newNote.heartRate}
                onChange={(e) => setNewNote({...newNote, heartRate: e.target.value})}
                type="number"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                margin="normal"
                label="FR (rpm)"
                value={newNote.respiratoryRate}
                onChange={(e) => setNewNote({...newNote, respiratoryRate: e.target.value})}
                type="number"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                margin="normal"
                label="PA"
                value={newNote.bloodPressure}
                onChange={(e) => setNewNote({...newNote, bloodPressure: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNoteDialog(false)}>Cancelar</Button>
          <Button onClick={handleAddNote} variant="contained">Agregar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Alta Médica */}
      <Dialog open={openDischargeDialog} onClose={() => setOpenDischargeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dar de Alta</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo de Alta</InputLabel>
            <Select
              value={dischargeData.dischargeType}
              onChange={(e) => setDischargeData({...dischargeData, dischargeType: e.target.value})}
              label="Tipo de Alta"
            >
              <MenuItem value="normal">Alta Médica</MenuItem>
              <MenuItem value="voluntary">Alta Voluntaria</MenuItem>
              <MenuItem value="transfer">Transferencia</MenuItem>
              <MenuItem value="death">Defunción</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="Notas de Alta"
            value={dischargeData.dischargeNotes}
            onChange={(e) => setDischargeData({...dischargeData, dischargeNotes: e.target.value})}
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDischargeDialog(false)}>Cancelar</Button>
          <Button onClick={handleDischarge} variant="contained" color="error">Dar de Alta</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert onClose={() => setSnackbar({...snackbar, open: false})} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}