import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { petService, appointmentService } from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [petsRes, appointmentsRes] = await Promise.all([
        petService.getMyPets(),
        appointmentService.getMyAppointments()
      ]);
      
      setPets(petsRes.data.pets);
      setAppointments(appointmentsRes.data.appointments);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (user?.role !== 'admin') {
    return (
      <Box>
        <Typography variant="h5">Acceso denegado</Typography>
        <Typography>Esta página es solo para administradores</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Panel de Administración - Auditoría del Sistema
      </Typography>
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={`Mascotas (${pets.length})`} />
          <Tab label={`Citas (${appointments.length})`} />
          <Tab label="Actividad Reciente" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          Todas las Mascotas del Sistema
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Especie</TableCell>
                <TableCell>Dueño</TableCell>
                <TableCell>Registrado por</TableCell>
                <TableCell>Fecha Registro</TableCell>
                <TableCell>Última Modificación</TableCell>
                <TableCell>Modificado por</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pets.map((pet) => (
                <TableRow key={pet.id}>
                  <TableCell>{pet.name}</TableCell>
                  <TableCell>{pet.species}</TableCell>
                  <TableCell>
                    {pet.owner ? `${pet.owner.firstName} ${pet.owner.lastName}` : '-'}
                  </TableCell>
                  <TableCell>
                    {pet.createdBy || 'Sistema'}
                  </TableCell>
                  <TableCell>
                    {new Date(pet.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(pet.updatedAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {pet.updatedBy || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Todas las Citas del Sistema
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Hora</TableCell>
                <TableCell>Mascota</TableCell>
                <TableCell>Dueño</TableCell>
                <TableCell>Veterinario</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Creado por</TableCell>
                <TableCell>Fecha Creación</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    {new Date(appointment.appointmentDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{appointment.startTime}</TableCell>
                  <TableCell>{appointment.pet?.name}</TableCell>
                  <TableCell>
                    {appointment.pet?.owner ? 
                      `${appointment.pet.owner.firstName} ${appointment.pet.owner.lastName}` : 
                      '-'}
                  </TableCell>
                  <TableCell>
                    {appointment.veterinarian ? 
                      `${appointment.veterinarian.firstName} ${appointment.veterinarian.lastName}` : 
                      '-'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={appointment.status} 
                      size="small" 
                      color={appointment.status === 'scheduled' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{appointment.createdBy || 'Sistema'}</TableCell>
                  <TableCell>
                    {new Date(appointment.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Actividad Reciente del Sistema
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha/Hora</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Acción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Combinar y ordenar todas las actividades por fecha */}
              {[
                ...pets.map(p => ({
                  date: p.createdAt,
                  type: 'Mascota',
                  description: `Mascota ${p.name} registrada`,
                  user: p.createdBy || 'Sistema',
                  action: 'Crear'
                })),
                ...appointments.map(a => ({
                  date: a.createdAt,
                  type: 'Cita',
                  description: `Cita para ${a.pet?.name}`,
                  user: a.createdBy || 'Sistema',
                  action: 'Agendar'
                }))
              ]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 20)
              .map((activity, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(activity.date).toLocaleString()}</TableCell>
                  <TableCell>{activity.type}</TableCell>
                  <TableCell>{activity.description}</TableCell>
                  <TableCell>{activity.user}</TableCell>
                  <TableCell>
                    <Chip label={activity.action} size="small" variant="outlined" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
    </Box>
  );
};

export default AdminDashboard;