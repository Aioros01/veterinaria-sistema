import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Collapse
} from '@mui/material';
import {
  People,
  Pets,
  Inventory,
  CalendarMonth,
  AttachMoney,
  ExpandMore,
  ExpandLess,
  Refresh,
  MedicalServices
} from '@mui/icons-material';
import api from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface StatsData {
  users?: {
    total: number;
    admins: number;
    vets: number;
    clients: number;
  };
  pets?: {
    total: number;
    dogs: number;
    cats: number;
    others: number;
  };
  appointments?: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
  inventory?: {
    totalMedications: number;
    lowStock: number;
  };
  prescriptions?: {
    total: number;
  };
  sales?: {
    total: number;
    revenue: number;
  };
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

interface PetData {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age: number;
  weight?: number;
  birthDate?: string;
  color?: string;
  gender?: string;
  medicalNotes?: string;
  createdAt: string;
  owner?: {
    firstName: string;
    lastName: string;
  };
}

interface AppointmentData {
  id: string;
  appointmentDate: string;
  startTime: string;
  endTime?: string;
  reason: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  pet?: {
    name: string;
    owner?: {
      firstName: string;
      lastName: string;
    };
  };
  veterinarian?: {
    firstName: string;
    lastName: string;
  };
}

interface MedicationData {
  id: string;
  name: string;
  description?: string;
  unitPrice: string | number;
  currentStock: number;
  presentation?: string;
  expirationDate?: string;
}

interface PrescriptionData {
  id: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  startDate?: string;
  medicalHistory?: {
    pet?: {
      name: string;
    };
    veterinarian?: {
      firstName: string;
      lastName: string;
    };
  };
  medicine?: {
    name: string;
  };
}

interface SaleItemData {
  id: string;
  quantity: number;
  unitPrice: string | number;
  total: string | number;
  medication?: {
    name: string;
  };
}

interface SaleData {
  id: string;
  saleDate: string;
  finalPrice: string | number;
  totalPrice?: string | number;
  status?: string;
  paymentMethod?: string;
  notes?: string;
  client?: {
    firstName: string;
    lastName: string;
  };
  medicine?: {
    name: string;
  };
  saleItems?: SaleItemData[];
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminPanel: React.FC = () => {
  const [tabValue, setTabValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const [stats, setStats] = useState<StatsData>({});
  const [users, setUsers] = useState<UserData[]>([]);
  const [pets, setPets] = useState<PetData[]>([]);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [medications, setMedications] = useState<MedicationData[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>([]);
  const [sales, setSales] = useState<SaleData[]>([]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        statsRes,
        usersRes,
        petsRes,
        appointmentsRes,
        medicationsRes,
        prescriptionsRes,
        salesRes
      ] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/all-users'),
        api.get('/admin/all-pets'),
        api.get('/admin/all-appointments'),
        api.get('/admin/all-medications'),
        api.get('/admin/all-prescriptions'),
        api.get('/admin/all-sales')
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setPets(petsRes.data);
      setAppointments(appointmentsRes.data);
      setMedications(medicationsRes.data);
      setPrescriptions(prescriptionsRes.data);
      setSales(salesRes.data);

    } catch (err: any) {
      setError(String(err.response?.data?.message || 'Error al cargar los datos'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, mt: 2 }}>
        <Typography variant="h4" gutterBottom>
          Panel de Administración
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Vista completa de todos los datos del sistema
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={fetchAllData}
          variant="contained"
          sx={{ mt: 2 }}
        >
          Actualizar Datos
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tarjetas de estadísticas usando Box con flexbox */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 200 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Usuarios
                  </Typography>
                  <Typography variant="h5">
                    {Number(stats.users?.total || 0)}
                  </Typography>
                  <Typography variant="caption">
                    {Number(stats.users?.admins || 0)} admin, {Number(stats.users?.vets || 0)} vet, {Number(stats.users?.clients || 0)} clientes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: 200 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Pets color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Mascotas
                  </Typography>
                  <Typography variant="h5">
                    {Number(stats.pets?.total || 0)}
                  </Typography>
                  <Typography variant="caption">
                    {Number(stats.pets?.dogs || 0)} perros, {Number(stats.pets?.cats || 0)} gatos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: 200 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CalendarMonth color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Citas
                  </Typography>
                  <Typography variant="h5">
                    {Number(stats.appointments?.total || 0)}
                  </Typography>
                  <Chip
                    label={`${Number(stats.appointments?.pending || 0)} pendientes`}
                    size="small"
                    color="warning"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: 200 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Inventory color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Medicamentos
                  </Typography>
                  <Typography variant="h5">
                    {Number(stats.inventory?.totalMedications || 0)}
                  </Typography>
                  {Number(stats.inventory?.lowStock || 0) > 0 && (
                    <Chip
                      label={`${Number(stats.inventory?.lowStock || 0)} bajo stock`}
                      size="small"
                      color="error"
                    />
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: 200 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <MedicalServices color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Prescripciones
                  </Typography>
                  <Typography variant="h5">
                    {Number(stats.prescriptions?.total || 0)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: 200 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AttachMoney color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Ventas Total
                  </Typography>
                  <Typography variant="h5">
                    ${Number(stats.sales?.revenue || 0).toFixed(2)}
                  </Typography>
                  <Typography variant="caption">
                    {Number(stats.sales?.total || 0)} ventas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Tabs para las diferentes secciones */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label={`Usuarios (${users.length})`} />
          <Tab label={`Mascotas (${pets.length})`} />
          <Tab label={`Citas (${appointments.length})`} />
          <Tab label={`Medicamentos (${medications.length})`} />
          <Tab label={`Prescripciones (${prescriptions.length})`} />
          <Tab label={`Ventas (${sales.length})`} />
        </Tabs>

        {/* Panel de Usuarios */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Creado</TableCell>
                  <TableCell>Detalles</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user: UserData) => (
                  <React.Fragment key={String(user.id)}>
                    <TableRow>
                      <TableCell>{String(user.id)}</TableCell>
                      <TableCell>{String(`${user.firstName || ''} ${user.lastName || ''}`.trim())}</TableCell>
                      <TableCell>{String(user.email)}</TableCell>
                      <TableCell>
                        <Chip
                          label={String(user.role)}
                          color={user.role === 'admin' ? 'error' : user.role === 'veterinarian' ? 'warning' : 'primary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{String(user.phone || 'N/A')}</TableCell>
                      <TableCell>
                        {new Date(String(user.createdAt)).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => toggleRowExpansion(`user-${String(user.id)}`)}>
                          {expandedRows.has(`user-${String(user.id)}`) ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={7} style={{ paddingBottom: 0, paddingTop: 0 }}>
                        <Collapse in={expandedRows.has(`user-${String(user.id)}`)} timeout="auto">
                          <Box sx={{ margin: 2 }}>
                            <Typography variant="h6" gutterBottom>
                              Información adicional
                            </Typography>
                            <Typography>Dirección: {String(user.address || 'No especificada')}</Typography>
                            <Typography>Última actualización: {new Date(String(user.updatedAt)).toLocaleString()}</Typography>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Panel de Mascotas */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Especie</TableCell>
                  <TableCell>Raza</TableCell>
                  <TableCell>Edad</TableCell>
                  <TableCell>Dueño</TableCell>
                  <TableCell>Peso</TableCell>
                  <TableCell>Detalles</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pets.map((pet: PetData) => (
                  <React.Fragment key={String(pet.id)}>
                    <TableRow>
                      <TableCell>{String(pet.id)}</TableCell>
                      <TableCell>{String(pet.name)}</TableCell>
                      <TableCell>{String(pet.species)}</TableCell>
                      <TableCell>{String(pet.breed || 'N/A')}</TableCell>
                      <TableCell>{Number(pet.age)} años</TableCell>
                      <TableCell>{String(pet.owner ? `${pet.owner.firstName || ''} ${pet.owner.lastName || ''}`.trim() : 'N/A')}</TableCell>
                      <TableCell>{pet.weight ? `${Number(pet.weight)} kg` : 'N/A'}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => toggleRowExpansion(`pet-${String(pet.id)}`)}>
                          {expandedRows.has(`pet-${String(pet.id)}`) ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={8} style={{ paddingBottom: 0, paddingTop: 0 }}>
                        <Collapse in={expandedRows.has(`pet-${String(pet.id)}`)} timeout="auto">
                          <Box sx={{ margin: 2 }}>
                            <Typography variant="h6" gutterBottom>
                              Información adicional
                            </Typography>
                            <Typography>Fecha de nacimiento: {pet.birthDate ? new Date(String(pet.birthDate)).toLocaleDateString() : 'N/A'}</Typography>
                            <Typography>Color: {String(pet.color || 'No especificado')}</Typography>
                            <Typography>Género: {String(pet.gender || 'No especificado')}</Typography>
                            <Typography>Notas médicas: {String(pet.medicalNotes || 'Sin notas')}</Typography>
                            <Typography>Registrado: {new Date(String(pet.createdAt)).toLocaleDateString()}</Typography>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Panel de Citas */}
        <TabPanel value={tabValue} index={2}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Fecha/Hora</TableCell>
                  <TableCell>Mascota</TableCell>
                  <TableCell>Dueño</TableCell>
                  <TableCell>Veterinario</TableCell>
                  <TableCell>Motivo</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Detalles</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((apt: AppointmentData) => (
                  <React.Fragment key={String(apt.id)}>
                    <TableRow>
                      <TableCell>{String(apt.id)}</TableCell>
                      <TableCell>
                        {new Date(String(apt.appointmentDate)).toLocaleDateString()} {String(apt.startTime)}
                      </TableCell>
                      <TableCell>{String(apt.pet?.name || 'N/A')}</TableCell>
                      <TableCell>{String(apt.pet?.owner ? `${apt.pet.owner.firstName || ''} ${apt.pet.owner.lastName || ''}`.trim() : 'N/A')}</TableCell>
                      <TableCell>{String(apt.veterinarian ? `${apt.veterinarian.firstName || ''} ${apt.veterinarian.lastName || ''}`.trim() : 'N/A')}</TableCell>
                      <TableCell>{String(apt.reason)}</TableCell>
                      <TableCell>
                        <Chip
                          label={String(apt.status)}
                          color={
                            apt.status === 'completed' ? 'success' :
                            apt.status === 'cancelled' ? 'error' :
                            'warning'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => toggleRowExpansion(`apt-${String(apt.id)}`)}>
                          {expandedRows.has(`apt-${String(apt.id)}`) ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={8} style={{ paddingBottom: 0, paddingTop: 0 }}>
                        <Collapse in={expandedRows.has(`apt-${String(apt.id)}`)} timeout="auto">
                          <Box sx={{ margin: 2 }}>
                            <Typography variant="h6" gutterBottom>
                              Información adicional
                            </Typography>
                            <Typography>Notas: {String(apt.notes || 'Sin notas')}</Typography>
                            <Typography>Creada: {new Date(String(apt.createdAt)).toLocaleString()}</Typography>
                            <Typography>Actualizada: {new Date(String(apt.updatedAt)).toLocaleString()}</Typography>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Panel de Medicamentos */}
        <TabPanel value={tabValue} index={3}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Precio</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Unidad</TableCell>
                  <TableCell>Caducidad</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {medications.map((med: MedicationData) => (
                  <TableRow key={String(med.id)}>
                    <TableCell>{String(med.id)}</TableCell>
                    <TableCell>{String(med.name)}</TableCell>
                    <TableCell>{String(med.description || 'N/A')}</TableCell>
                    <TableCell>${Number(med.unitPrice || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={String(med.currentStock)}
                        color={Number(med.currentStock) < 10 ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{String(med.presentation || 'unidad')}</TableCell>
                    <TableCell>
                      {med.expirationDate ? new Date(String(med.expirationDate)).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={Number(med.currentStock) > 0 ? 'Disponible' : 'Agotado'}
                        color={Number(med.currentStock) > 0 ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Panel de Prescripciones */}
        <TabPanel value={tabValue} index={4}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Mascota</TableCell>
                  <TableCell>Veterinario</TableCell>
                  <TableCell>Medicamento</TableCell>
                  <TableCell>Dosis</TableCell>
                  <TableCell>Frecuencia</TableCell>
                  <TableCell>Duración</TableCell>
                  <TableCell>Fecha</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {prescriptions.map((presc: PrescriptionData) => (
                  <TableRow key={String(presc.id)}>
                    <TableCell>{String(presc.id)}</TableCell>
                    <TableCell>{String(presc.medicalHistory?.pet?.name || 'N/A')}</TableCell>
                    <TableCell>{String(presc.medicalHistory?.veterinarian ? `${presc.medicalHistory.veterinarian.firstName || ''} ${presc.medicalHistory.veterinarian.lastName || ''}`.trim() : 'N/A')}</TableCell>
                    <TableCell>{String(presc.medicine?.name || 'N/A')}</TableCell>
                    <TableCell>{String(presc.dosage || 'N/A')}</TableCell>
                    <TableCell>{String(presc.frequency || 'N/A')}</TableCell>
                    <TableCell>{String(presc.duration || 'N/A')}</TableCell>
                    <TableCell>
                      {presc.startDate ? new Date(String(presc.startDate)).toLocaleDateString() : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Panel de Ventas */}
        <TabPanel value={tabValue} index={5}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Método de Pago</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Detalles</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sales.map((sale: SaleData) => (
                  <React.Fragment key={String(sale.id)}>
                    <TableRow>
                      <TableCell>{String(sale.id)}</TableCell>
                      <TableCell>{String(sale.client ? `${sale.client.firstName || ''} ${sale.client.lastName || ''}`.trim() : 'N/A')}</TableCell>
                      <TableCell>
                        {new Date(String(sale.saleDate)).toLocaleDateString()}
                      </TableCell>
                      <TableCell>${Number(sale.finalPrice || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip
                          label={String(sale.status || 'Completada')}
                          color="success"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{String(sale.paymentMethod || 'Efectivo')}</TableCell>
                      <TableCell>{Number(sale.saleItems?.length || 0)} items</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => toggleRowExpansion(`sale-${String(sale.id)}`)}>
                          {expandedRows.has(`sale-${String(sale.id)}`) ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={8} style={{ paddingBottom: 0, paddingTop: 0 }}>
                        <Collapse in={expandedRows.has(`sale-${String(sale.id)}`)} timeout="auto">
                          <Box sx={{ margin: 2 }}>
                            <Typography variant="h6" gutterBottom>
                              Detalles de la venta
                            </Typography>
                            {sale.saleItems && sale.saleItems.map((item: SaleItemData) => (
                              <Box key={String(item.id)} sx={{ mb: 1 }}>
                                <Typography>
                                  • {String(item.medication?.name || 'Producto')} -
                                  Cantidad: {Number(item.quantity)} -
                                  Precio unitario: ${Number(item.unitPrice || 0).toFixed(2)} -
                                  Subtotal: ${Number(item.total || 0).toFixed(2)}
                                </Typography>
                              </Box>
                            ))}
                            <Typography sx={{ mt: 2 }}>
                              Notas: {String(sale.notes || 'Sin notas')}
                            </Typography>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default AdminPanel;