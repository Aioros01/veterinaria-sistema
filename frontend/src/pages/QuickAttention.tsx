import React, { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Pets as PetsIcon,
  EventNote as EventNoteIcon,
  LocalHospital as HospitalIcon,
  Check as CheckIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { userService, petService } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType?: string;
  documentNumber?: string;
  address?: string;
}

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  gender: string;
  weight?: number;
  birthDate?: string;
}

const QuickAttention: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [searchType, setSearchType] = useState<'cedula' | 'name'>('cedula');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<Client | null>(null);
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [isNewClient, setIsNewClient] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [attentionType, setAttentionType] = useState<'checkup' | 'appointment' | 'emergency'>('checkup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Datos del nuevo cliente
  const [newClient, setNewClient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    documentType: 'cedula',
    documentNumber: '',
    address: '',
    password: 'temporal123' // Password temporal
  });

  // Datos de la nueva mascota
  const [newPet, setNewPet] = useState({
    name: '',
    species: 'dog',
    breed: '',
    gender: 'male',
    weight: '',
    birthDate: ''
  });

  // Dialog para agregar mascota
  const [openPetDialog, setOpenPetDialog] = useState(false);
  const [allClients, setAllClients] = useState<Client[]>([]);

  const steps = [
    'Buscar/Registrar Cliente',
    'Seleccionar Mascota',
    'Tipo de Atención',
    'Completar Atención'
  ];

  // Cargar todos los clientes al montar el componente
  useEffect(() => {
    loadAllClients();
  }, []);

  // Función para cargar mascotas del cliente
  const loadClientPets = React.useCallback(async (clientId: string) => {
    try {
      const response = await petService.getByOwner(clientId);
      const data = response.data || response;
      setPets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading pets:', err);
      setPets([]);
    }
  }, []);

  // Función para seleccionar un cliente
  const selectClient = React.useCallback((client: Client) => {
    setSearchResult(client);
    setIsNewClient(false);
    loadClientPets(client.id);
  }, [loadClientPets]);

  // Búsqueda en tiempo real
  const performSearch = React.useCallback(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    let filtered: Client[] = [];

    if (searchType === 'cedula') {
      filtered = allClients.filter((client: any) =>
        client.documentNumber?.toLowerCase().includes(searchLower)
      );
    } else {
      filtered = allClients.filter((client: any) => {
        const fullName = `${client.firstName || ''} ${client.lastName || ''}`.toLowerCase();
        return fullName.includes(searchLower);
      });
    }

    setSearchResults(filtered);

    // Si hay exactamente un resultado, seleccionarlo automáticamente
    if (filtered.length === 1) {
      selectClient(filtered[0]);
    } else if (filtered.length === 0) {
      setIsNewClient(true);
      if (searchType === 'cedula') {
        setNewClient(prev => ({ ...prev, documentNumber: searchTerm }));
      }
    }
  }, [searchTerm, searchType, allClients, selectClient]);

  useEffect(() => {
    if (searchTerm.length > 0) {
      performSearch();
    } else {
      setSearchResults([]);
      setSearchResult(null);
      setIsNewClient(false);
    }
  }, [searchTerm, searchType, performSearch]);

  const loadAllClients = async () => {
    try {
      const response = await userService.getAll();
      const data = response.data || response;

      let users = [];
      if (Array.isArray(data)) {
        users = data;
      } else if (data.users && Array.isArray(data.users)) {
        users = data.users;
      }

      const clients = users.filter((u: any) => u.role === 'client' || u.role === 'CLIENT');
      setAllClients(clients);
    } catch (err) {
      console.error('Error loading clients:', err);
    }
  };



  const searchClient = async () => {
    setLoading(true);
    setError('');
    setSearchResult(null);

    try {
      const response = await userService.getAll();
      const data = response.data || response;

      // Manejar diferentes estructuras de respuesta
      let users = [];
      if (Array.isArray(data)) {
        users = data;
      } else if (data.users && Array.isArray(data.users)) {
        users = data.users;
      } else if (data.data && Array.isArray(data.data)) {
        users = data.data;
      }

      let found = null;
      if (searchType === 'cedula') {
        found = users.find((u: any) => u.documentNumber === searchTerm && u.role === 'client');
      } else {
        const searchLower = searchTerm.toLowerCase();
        found = users.find((u: any) =>
          u.role === 'client' &&
          (`${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(searchLower))
        );
      }

      if (found) {
        setSearchResult(found);
        setIsNewClient(false);
        // Cargar mascotas del cliente
        loadClientPets(found.id);
      } else {
        setIsNewClient(true);
        if (searchType === 'cedula') {
          setNewClient(prev => ({ ...prev, documentNumber: searchTerm }));
        }
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('No autorizado. Por favor inicie sesión como administrador o veterinario');
      } else {
        setError('Error al buscar cliente');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const createClient = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await userService.create({
        ...newClient,
        role: 'client'
      });

      setSearchResult(response.data);
      setIsNewClient(false);
      setActiveStep(1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear cliente');
    } finally {
      setLoading(false);
    }
  };

  const createPet = async () => {
    if (!searchResult) return;

    setLoading(true);
    setError('');

    try {
      const response = await petService.createPet({
        ...newPet,
        ownerId: searchResult.id,
        weight: newPet.weight ? Number(newPet.weight) : undefined
      });

      const createdPet = response.data.pet;
      setPets([...pets, createdPet]);
      setSelectedPet(createdPet);
      setOpenPetDialog(false);

      // Reset form
      setNewPet({
        name: '',
        species: 'dog',
        breed: '',
        gender: 'male',
        weight: '',
        birthDate: ''
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear mascota');
    } finally {
      setLoading(false);
    }
  };

  const proceedToAttention = () => {
    if (!selectedPet) {
      setError('Por favor selecciona una mascota');
      return;
    }

    setActiveStep(2);
  };

  const handleAttentionType = () => {
    if (!selectedPet) return;

    switch (attentionType) {
      case 'checkup':
        // Ir directamente a historial médico para registrar consulta
        navigate(`/medical-history/${selectedPet.id}`);
        break;
      case 'appointment':
        // Ir a agendar cita
        navigate('/appointments', {
          state: {
            preselectedPet: selectedPet,
            client: searchResult
          }
        });
        break;
      case 'emergency':
        // Ir a hospitalización
        navigate('/hospitalizations', {
          state: {
            preselectedPet: selectedPet,
            client: searchResult,
            isEmergency: true
          }
        });
        break;
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (isNewClient) {
        createClient();
      } else if (searchResult) {
        setActiveStep(1);
      }
    } else if (activeStep === 1) {
      proceedToAttention();
    } else if (activeStep === 2) {
      handleAttentionType();
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Atención Rápida
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Flujo completo de atención veterinaria
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
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

        {/* Step 0: Buscar/Registrar Cliente */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              <PersonIcon sx={{ verticalAlign: 'bottom', mr: 1 }} />
              Buscar o Registrar Cliente
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Buscar por</InputLabel>
                <Select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as any)}
                  label="Buscar por"
                >
                  <MenuItem value="cedula">Cédula</MenuItem>
                  <MenuItem value="name">Nombre</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                placeholder={searchType === 'cedula' ? 'Ingrese cédula...' : 'Ingrese nombre...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Mostrar resultados de búsqueda en tiempo real */}
            {searchResults.length > 1 && (
              <Card sx={{ mb: 3, maxHeight: 300, overflow: 'auto' }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    {searchResults.length} clientes encontrados:
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  {searchResults.map((client) => (
                    <Box
                      key={client.id}
                      sx={{
                        p: 1,
                        mb: 1,
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                      onClick={() => selectClient(client)}
                    >
                      <Typography variant="body2">
                        <strong>{client.firstName} {client.lastName}</strong>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {client.documentType === 'pasaporte' ? 'Pasaporte' : 'Cédula'}: {client.documentNumber} | {client.email}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}

            {searchResult && !isNewClient && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Cliente Encontrado
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography><strong>Nombre:</strong> {searchResult.firstName} {searchResult.lastName}</Typography>
                  <Typography><strong>{searchResult.documentType === 'pasaporte' ? 'Pasaporte' : 'Cédula'}:</strong> {searchResult.documentNumber}</Typography>
                  <Typography><strong>Email:</strong> {searchResult.email}</Typography>
                  <Typography><strong>Teléfono:</strong> {searchResult.phone}</Typography>
                  {searchResult.address && (
                    <Typography><strong>Dirección:</strong> {searchResult.address}</Typography>
                  )}
                </CardContent>
              </Card>
            )}

            {isNewClient && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Registrar Nuevo Cliente
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        label="Nombre"
                        value={newClient.firstName}
                        onChange={(e) => setNewClient({...newClient, firstName: e.target.value})}
                        fullWidth
                        required
                      />
                      <TextField
                        label="Apellido"
                        value={newClient.lastName}
                        onChange={(e) => setNewClient({...newClient, lastName: e.target.value})}
                        fullWidth
                        required
                      />
                    </Box>
                    <TextField
                      label="Cédula"
                      value={newClient.documentNumber}
                      onChange={(e) => setNewClient({...newClient, documentNumber: e.target.value})}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Email"
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Teléfono"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Dirección"
                      value={newClient.address}
                      onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                      fullWidth
                      multiline
                      rows={2}
                    />
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        )}

        {/* Step 1: Seleccionar Mascota */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              <PetsIcon sx={{ verticalAlign: 'bottom', mr: 1 }} />
              Seleccionar o Registrar Mascota
            </Typography>

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setOpenPetDialog(true)}
              sx={{ mb: 2 }}
            >
              Agregar Nueva Mascota
            </Button>

            {pets.length === 0 ? (
              <Alert severity="info">
                Este cliente no tiene mascotas registradas. Por favor agregue una nueva mascota.
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {pets.map((pet) => (
                  <Card
                    key={pet.id}
                    sx={{
                      minWidth: 250,
                      cursor: 'pointer',
                      border: selectedPet?.id === pet.id ? 2 : 1,
                      borderColor: selectedPet?.id === pet.id ? 'primary.main' : 'divider'
                    }}
                    onClick={() => setSelectedPet(pet)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Typography variant="h6">{pet.name}</Typography>
                        {selectedPet?.id === pet.id && (
                          <CheckIcon color="primary" />
                        )}
                      </Box>
                      <Typography color="text.secondary">
                        {pet.species} - {pet.breed}
                      </Typography>
                      <Typography variant="body2">
                        {pet.gender === 'male' ? 'Macho' : 'Hembra'}
                      </Typography>
                      {pet.weight && (
                        <Typography variant="body2">
                          Peso: {pet.weight} kg
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Step 2: Tipo de Atención */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              <EventNoteIcon sx={{ verticalAlign: 'bottom', mr: 1 }} />
              Tipo de Atención
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Card
                sx={{
                  flex: 1,
                  minWidth: 200,
                  cursor: 'pointer',
                  border: attentionType === 'checkup' ? 2 : 1,
                  borderColor: attentionType === 'checkup' ? 'primary.main' : 'divider'
                }}
                onClick={() => setAttentionType('checkup')}
              >
                <CardContent>
                  <EventNoteIcon color="primary" sx={{ fontSize: 40 }} />
                  <Typography variant="h6">Consulta/Chequeo</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Atención inmediata y registro en historial médico
                  </Typography>
                </CardContent>
              </Card>

              <Card
                sx={{
                  flex: 1,
                  minWidth: 200,
                  cursor: 'pointer',
                  border: attentionType === 'appointment' ? 2 : 1,
                  borderColor: attentionType === 'appointment' ? 'primary.main' : 'divider'
                }}
                onClick={() => setAttentionType('appointment')}
              >
                <CardContent>
                  <EventNoteIcon color="secondary" sx={{ fontSize: 40 }} />
                  <Typography variant="h6">Agendar Cita</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Programar cita para fecha futura
                  </Typography>
                </CardContent>
              </Card>

              <Card
                sx={{
                  flex: 1,
                  minWidth: 200,
                  cursor: 'pointer',
                  border: attentionType === 'emergency' ? 2 : 1,
                  borderColor: attentionType === 'emergency' ? 'primary.main' : 'divider'
                }}
                onClick={() => setAttentionType('emergency')}
              >
                <CardContent>
                  <HospitalIcon color="error" sx={{ fontSize: 40 }} />
                  <Typography variant="h6">Hospitalización</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Requiere hospitalización inmediata
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {selectedPet && searchResult && (
              <Card sx={{ mt: 3, bgcolor: 'grey.50' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Resumen de Atención
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography><strong>Cliente:</strong> {searchResult.firstName} {searchResult.lastName}</Typography>
                  <Typography><strong>Mascota:</strong> {selectedPet.name} ({selectedPet.species})</Typography>
                  <Typography><strong>Tipo de Atención:</strong> {
                    attentionType === 'checkup' ? 'Consulta/Chequeo' :
                    attentionType === 'appointment' ? 'Agendar Cita' :
                    'Hospitalización'
                  }</Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        )}

        {/* Botones de navegación */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Atrás
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={
              (activeStep === 0 && !searchTerm) ||
              (activeStep === 1 && !selectedPet) ||
              loading
            }
          >
            {activeStep === steps.length - 2 ? 'Proceder' : 'Siguiente'}
          </Button>
        </Box>
      </Paper>

      {/* Dialog para agregar mascota */}
      <Dialog open={openPetDialog} onClose={() => setOpenPetDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Nueva Mascota</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Nombre"
              value={newPet.name}
              onChange={(e) => setNewPet({...newPet, name: e.target.value})}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Especie</InputLabel>
              <Select
                value={newPet.species}
                onChange={(e) => setNewPet({...newPet, species: e.target.value})}
                label="Especie"
              >
                <MenuItem value="dog">Perro</MenuItem>
                <MenuItem value="cat">Gato</MenuItem>
                <MenuItem value="bird">Ave</MenuItem>
                <MenuItem value="rabbit">Conejo</MenuItem>
                <MenuItem value="other">Otro</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Raza"
              value={newPet.breed}
              onChange={(e) => setNewPet({...newPet, breed: e.target.value})}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Género</InputLabel>
              <Select
                value={newPet.gender}
                onChange={(e) => setNewPet({...newPet, gender: e.target.value})}
                label="Género"
              >
                <MenuItem value="male">Macho</MenuItem>
                <MenuItem value="female">Hembra</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Peso (kg)"
              type="number"
              value={newPet.weight}
              onChange={(e) => setNewPet({...newPet, weight: e.target.value})}
              fullWidth
            />
            <TextField
              label="Fecha de Nacimiento"
              type="date"
              value={newPet.birthDate}
              onChange={(e) => setNewPet({...newPet, birthDate: e.target.value})}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPetDialog(false)}>Cancelar</Button>
          <Button
            onClick={createPet}
            variant="contained"
            disabled={!newPet.name || loading}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuickAttention;