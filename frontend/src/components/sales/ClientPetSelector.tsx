import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Pets as PetsIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { userService, petService } from '../../services/api';

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  documentType?: string;
  documentNumber?: string;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  gender: string;
  weight: number;
  birthDate: string;
  owner: Client;
}

interface ClientPetSelectorProps {
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
  selectedPet: Pet | null;
  setSelectedPet: (pet: Pet | null) => void;
}

const ClientPetSelector: React.FC<ClientPetSelectorProps> = ({
  selectedClient,
  setSelectedClient,
  selectedPet,
  setSelectedPet
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingPets, setLoadingPets] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadPetsByOwner(selectedClient.id);
    } else {
      setPets([]);
      setSelectedPet(null);
    }
  }, [selectedClient, setSelectedPet, loadPetsByOwner]);

  const loadClients = async () => {
    try {
      setLoadingClients(true);
      setError('');
      const response = await userService.getAll();
      const clientData = response.data || response;

      // Manejar diferentes estructuras de respuesta
      let allUsers = [];
      if (Array.isArray(clientData)) {
        allUsers = clientData;
      } else if (clientData.users && Array.isArray(clientData.users)) {
        allUsers = clientData.users;
      } else if (clientData.data && Array.isArray(clientData.data)) {
        allUsers = clientData.data;
      }

      // Filtrar solo usuarios con rol de cliente
      const clientUsers = allUsers.filter((user: any) =>
        user.role === 'client' || user.role === 'CLIENT'
      );

      setClients(clientUsers);

      if (clientUsers.length === 0) {
        setError('No se encontraron clientes registrados en el sistema');
      }
    } catch (error: any) {
      console.error('Error loading clients:', error);
      if (error.response?.status === 401) {
        setError('No autorizado. Por favor inicie sesión como administrador o veterinario');
      } else if (error.response?.status === 403) {
        setError('No tiene permisos para ver la lista de clientes');
      } else {
        setError('Error al cargar los clientes. Por favor intente nuevamente');
      }
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  const loadPetsByOwner = React.useCallback(async (ownerId: string) => {
    try {
      setLoadingPets(true);
      const response = await petService.getByOwner(ownerId);
      const petsData = response.data || response;
      setPets(Array.isArray(petsData) ? petsData : []);
    } catch (error) {
      console.error('Error loading pets:', error);
      setPets([]);
    } finally {
      setLoadingPets(false);
    }
  }, []);

  const filteredClients = clients.filter(client => {
    const fullName = `${client.firstName || ''} ${client.lastName || ''}`.toLowerCase();
    const email = (client.email || '').toLowerCase();
    const search = clientSearch.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const getSpeciesIcon = (species: string) => {
    const speciesLower = species.toLowerCase();
    if (speciesLower === 'perro' || speciesLower === 'dog') return '🐕';
    if (speciesLower === 'gato' || speciesLower === 'cat') return '🐈';
    if (speciesLower === 'ave' || speciesLower === 'bird') return '🦜';
    if (speciesLower === 'conejo' || speciesLower === 'rabbit') return '🐰';
    return '🐾';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonIcon /> Seleccionar Cliente
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar cliente por nombre o email..."
          value={clientSearch}
          onChange={(e) => setClientSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth>
          <InputLabel>Cliente</InputLabel>
          <Select
            value={selectedClient?.id || ''}
            onChange={(e) => {
              const client = clients.find(c => c.id === e.target.value);
              setSelectedClient(client || null);
            }}
            label="Cliente"
            disabled={loadingClients}
          >
            {loadingClients ? (
              <MenuItem disabled>
                <CircularProgress size={20} />
              </MenuItem>
            ) : filteredClients.length === 0 ? (
              <MenuItem disabled>No se encontraron clientes</MenuItem>
            ) : (
              filteredClients.map(client => (
                <MenuItem key={client.id} value={client.id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Typography>{`${client.firstName || ''} ${client.lastName || ''}`}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {client.email}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      </Box>

      {selectedClient && (
        <Card sx={{ mb: 3, bgcolor: 'background.default' }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Información del Cliente
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="body2">{`${selectedClient.firstName} ${selectedClient.lastName}`}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="body2">{selectedClient.email}</Typography>
              </Box>
              {selectedClient.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body2">{selectedClient.phone}</Typography>
                </Box>
              )}
              {selectedClient.address && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HomeIcon fontSize="small" color="action" />
                  <Typography variant="body2">{selectedClient.address}</Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {selectedClient && (
        <>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3 }}>
            <PetsIcon /> Seleccionar Mascota
          </Typography>

          <FormControl fullWidth>
            <InputLabel>Mascota</InputLabel>
            <Select
              value={selectedPet?.id || ''}
              onChange={(e) => {
                const pet = pets.find(p => p.id === e.target.value);
                setSelectedPet(pet || null);
              }}
              label="Mascota"
              disabled={loadingPets || pets.length === 0}
            >
              {loadingPets ? (
                <MenuItem disabled>
                  <CircularProgress size={20} />
                </MenuItem>
              ) : pets.length === 0 ? (
                <MenuItem disabled>Este cliente no tiene mascotas registradas</MenuItem>
              ) : (
                pets.map(pet => (
                  <MenuItem key={pet.id} value={pet.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Typography fontSize="large">{getSpeciesIcon(pet.species)}</Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography>{pet.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {pet.species} - {pet.breed} - {pet.gender === 'male' ? 'Macho' : 'Hembra'}
                        </Typography>
                      </Box>
                      {pet.birthDate && (
                        <Chip
                          label={`${calculateAge(pet.birthDate)} años`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {selectedPet && (
            <Card sx={{ mt: 2, bgcolor: 'background.default' }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Información de la Mascota
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Nombre</Typography>
                    <Typography variant="body2">{selectedPet.name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Especie</Typography>
                    <Typography variant="body2">{selectedPet.species}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Raza</Typography>
                    <Typography variant="body2">{selectedPet.breed}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Género</Typography>
                    <Typography variant="body2">
                      {selectedPet.gender === 'male' ? 'Macho' : 'Hembra'}
                    </Typography>
                  </Box>
                  {selectedPet.weight && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Peso</Typography>
                      <Typography variant="body2">{selectedPet.weight} kg</Typography>
                    </Box>
                  )}
                  {selectedPet.birthDate && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Edad</Typography>
                      <Typography variant="body2">
                        {calculateAge(selectedPet.birthDate)} años
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );
};

export default ClientPetSelector;