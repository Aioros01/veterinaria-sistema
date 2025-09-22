import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { appointmentService, petService } from '../services/api';

interface Appointment {
  id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  type: string;
  status: string;
  reason: string;
  notes?: string;
  pet: {
    name: string;
    owner?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  veterinarian: {
    firstName: string;
    lastName: string;
  };
}

interface Pet {
  id: string;
  name: string;
  species: string;
}

const Appointments: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });
  const [formData, setFormData] = useState({
    petId: '',
    appointmentDate: '',
    startTime: '',
    type: 'checkup',
    reason: '',
  });
  // Obtener el rol correctamente desde el objeto user
  const userStr = localStorage.getItem('user');
  const userObj = userStr ? JSON.parse(userStr) : null;
  const userRole = userObj?.role;

  useEffect(() => {
    loadAppointments();
    loadPets();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await appointmentService.getMyAppointments();
      setAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPets = async () => {
    try {
      const response = await petService.getMyPets();
      setPets(response.data.pets);
    } catch (error) {
      console.error('Error loading pets:', error);
    }
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({
      petId: '',
      appointmentDate: '',
      startTime: '',
      type: 'checkup',
      reason: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.petId) {
      setSnackbar({
        open: true,
        message: 'Por favor selecciona una mascota',
        severity: 'warning'
      });
      return;
    }
    
    if (!formData.appointmentDate) {
      setSnackbar({
        open: true,
        message: 'Por favor selecciona una fecha',
        severity: 'warning'
      });
      return;
    }
    
    if (!formData.startTime) {
      setSnackbar({
        open: true,
        message: 'Por favor selecciona una hora',
        severity: 'warning'
      });
      return;
    }
    
    if (!formData.reason) {
      setSnackbar({
        open: true,
        message: 'Por favor ingresa el motivo de la consulta',
        severity: 'warning'
      });
      return;
    }
    
    try {
      await appointmentService.createAppointment(formData);
      setSnackbar({
        open: true,
        message: '¡Cita agendada exitosamente!',
        severity: 'success'
      });
      handleCloseDialog();
      loadAppointments();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Error al agendar la cita. Por favor intenta nuevamente.';
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      console.error('Error creating appointment:', error);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      return;
    }
    
    try {
      await appointmentService.updateStatus(appointmentId, 'cancelled');
      setSnackbar({
        open: true,
        message: 'Cita cancelada exitosamente',
        severity: 'success'
      });
      loadAppointments();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al cancelar la cita',
        severity: 'error'
      });
      console.error('Error cancelling appointment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'confirmed': return 'success';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programada';
      case 'confirmed': return 'Confirmada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Mis Citas</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
          Agendar Cita
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Hora</TableCell>
              <TableCell>Mascota</TableCell>
              {user?.role === 'admin' && <TableCell>Dueño</TableCell>}
              <TableCell>Tipo</TableCell>
              <TableCell>Veterinario</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Motivo</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={user?.role === 'admin' ? 9 : 8} align="center">
                  No tienes citas programadas
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    {new Date(appointment.appointmentDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{appointment.startTime}</TableCell>
                  <TableCell>{appointment.pet?.name}</TableCell>
                  {user?.role === 'admin' && (
                    <TableCell>
                      {appointment.pet?.owner ? 
                        `${appointment.pet.owner.firstName} ${appointment.pet.owner.lastName}` : 
                        '-'}
                    </TableCell>
                  )}
                  <TableCell>{appointment.type}</TableCell>
                  <TableCell>
                    {appointment.veterinarian?.firstName} {appointment.veterinarian?.lastName}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(appointment.status)}
                      color={getStatusColor(appointment.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{appointment.reason || '-'}</TableCell>
                  <TableCell>
                    <Button 
                      size="small"
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setViewDialogOpen(true);
                      }}
                    >
                      Ver
                    </Button>
                    {userRole !== 'cliente' && appointment.status === 'scheduled' && (
                      <Button 
                        size="small"
                        color="error"
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        Cancelar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Agendar Nueva Cita</DialogTitle>
        <DialogContent>
          <TextField
            select
            margin="dense"
            name="petId"
            label="Mascota"
            fullWidth
            variant="outlined"
            value={formData.petId}
            onChange={handleChange}
            required
          >
            {pets.map((pet) => (
              <MenuItem key={pet.id} value={pet.id}>
                {pet.name} ({pet.species === 'dog' ? 'Perro' : pet.species === 'cat' ? 'Gato' : pet.species})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            name="appointmentDate"
            label="Fecha"
            type="date"
            fullWidth
            variant="outlined"
            value={formData.appointmentDate}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
          <TextField
            margin="dense"
            name="startTime"
            label="Hora"
            type="time"
            fullWidth
            variant="outlined"
            value={formData.startTime}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
          <TextField
            select
            margin="dense"
            name="type"
            label="Tipo de Cita"
            fullWidth
            variant="outlined"
            value={formData.type}
            onChange={handleChange}
          >
            <MenuItem value="checkup">Chequeo General</MenuItem>
            <MenuItem value="vaccination">Vacunación</MenuItem>
            <MenuItem value="emergency">Emergencia</MenuItem>
            <MenuItem value="surgery">Cirugía</MenuItem>
            <MenuItem value="grooming">Estética</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            name="reason"
            label="Motivo de la Consulta"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.reason}
            onChange={handleChange}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            Agendar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para ver detalles de la cita */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalles de la Cita</DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Información de la Cita
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography><strong>Fecha:</strong> {new Date(selectedAppointment.appointmentDate).toLocaleDateString('es-ES')}</Typography>
                <Typography><strong>Hora:</strong> {selectedAppointment.startTime} - {selectedAppointment.endTime || 'Por definir'}</Typography>
                <Typography><strong>Mascota:</strong> {selectedAppointment.pet?.name}</Typography>
                <Typography><strong>Tipo:</strong> {selectedAppointment.type}</Typography>
                <Typography><strong>Estado:</strong> {getStatusLabel(selectedAppointment.status)}</Typography>
                <Typography><strong>Veterinario:</strong> Dr. {selectedAppointment.veterinarian?.firstName} {selectedAppointment.veterinarian?.lastName}</Typography>
                <Typography sx={{ mt: 2 }}><strong>Motivo de consulta:</strong></Typography>
                <Typography>{selectedAppointment.reason || 'No especificado'}</Typography>
                {selectedAppointment.notes && (
                  <>
                    <Typography sx={{ mt: 2 }}><strong>Notas:</strong></Typography>
                    <Typography>{selectedAppointment.notes}</Typography>
                  </>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Appointments;