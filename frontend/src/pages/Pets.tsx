import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Fab,
  InputAdornment,
  Chip,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MedicalServices,
  Search as SearchIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import Grid from '../components/GridCompat';
import { useNavigate } from 'react-router-dom';
import { petService } from '../services/api';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  birthDate: string;
  gender: string;
  weight: number;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    documentType?: string;
    documentNumber?: string;
  };
}

const Pets: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'pet' | 'owner' | 'cedula'>('pet');
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    birthDate: '',
    gender: 'male',
    weight: '',
  });
  
  const navigate = useNavigate();
  // Obtener el rol del usuario correctamente desde el objeto user
  const userStr = localStorage.getItem('user');
  const userObj = userStr ? JSON.parse(userStr) : null;
  const userRole = userObj?.role;

  useEffect(() => {
    loadPets();
  }, []);

  useEffect(() => {
    filterPets();
  }, [searchTerm, searchType, pets]);

  const filterPets = () => {
    if (!searchTerm) {
      setFilteredPets(pets);
      return;
    }

    const filtered = pets.filter(pet => {
      const searchLower = searchTerm.toLowerCase();

      if (searchType === 'pet') {
        return pet.name.toLowerCase().includes(searchLower);
      } else if (searchType === 'owner') {
        const ownerName = `${pet.owner?.firstName || ''} ${pet.owner?.lastName || ''}`.toLowerCase();
        return ownerName.includes(searchLower);
      } else if (searchType === 'cedula') {
        return pet.owner?.documentNumber?.toLowerCase().includes(searchLower);
      }
      return false;
    });

    setFilteredPets(filtered);
  };

  const loadPets = async () => {
    try {
      const response = await petService.getMyPets();
      const petsData = response.data.pets || [];
      setPets(petsData);
      setFilteredPets(petsData);
    } catch (error) {
      console.error('Error loading pets:', error);
      setPets([]);
      setFilteredPets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (pet?: Pet) => {
    if (pet) {
      setEditingPet(pet);
      setFormData({
        name: pet.name,
        species: pet.species,
        breed: pet.breed || '',
        birthDate: pet.birthDate || '',
        gender: pet.gender || 'male',
        weight: pet.weight?.toString() || '',
      });
    } else {
      setEditingPet(null);
      setFormData({
        name: '',
        species: 'dog',
        breed: '',
        birthDate: '',
        gender: 'male',
        weight: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPet(null);
  };

  const handleSubmit = async () => {
    try {
      const petData = {
        ...formData,
        weight: formData.weight ? parseFloat(formData.weight) : null,
      };

      if (editingPet) {
        await petService.updatePet(editingPet.id, petData);
      } else {
        await petService.createPet(petData);
      }
      
      handleCloseDialog();
      loadPets();
    } catch (error) {
      console.error('Error saving pet:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar esta mascota?')) {
      try {
        await petService.deletePet(id);
        loadPets();
      } catch (error) {
        console.error('Error deleting pet:', error);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
        <Typography variant="h4">
          {userRole === 'cliente' ? 'Mis Mascotas' : 'Gestión de Mascotas'}
        </Typography>
        {userRole !== 'cliente' && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Agregar Mascota
          </Button>
        )}
      </Box>

      {/* Barra de búsqueda */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          select
          label="Buscar por"
          value={searchType}
          onChange={(e) => setSearchType(e.target.value as any)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="pet">Nombre Mascota</MenuItem>
          <MenuItem value="owner">Nombre Dueño</MenuItem>
          <MenuItem value="cedula">Cédula Dueño</MenuItem>
        </TextField>
        <TextField
          fullWidth
          placeholder={
            searchType === 'pet' ? 'Buscar por nombre de mascota...' :
            searchType === 'owner' ? 'Buscar por nombre del dueño...' :
            'Buscar por cédula del dueño...'
          }
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

      {filteredPets.length === 0 && searchTerm && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No se encontraron mascotas con los criterios de búsqueda
        </Alert>
      )}

      <Grid container spacing={3}>
        {filteredPets.length === 0 && !searchTerm ? (
          <Grid item xs={12}>
            <Typography variant="h6" color="textSecondary" align="center">
              No hay mascotas registradas
            </Typography>
          </Grid>
        ) : (
          filteredPets.map((pet) => (
            <Grid item xs={12} sm={6} md={4} key={pet.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="h5" component="div">
                      {pet.name}
                    </Typography>
                    <Chip
                      label={pet.species}
                      size="small"
                      color={pet.species === 'dog' ? 'primary' : 'secondary'}
                    />
                  </Box>

                  {/* Información del dueño */}
                  {pet.owner && (
                    <Box sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1, mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PersonIcon fontSize="small" />
                        <Typography variant="body2" fontWeight="bold">
                          {pet.owner.firstName} {pet.owner.lastName}
                        </Typography>
                      </Box>
                      {pet.owner.documentNumber && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <BadgeIcon fontSize="small" />
                          <Typography variant="caption">
                            {pet.owner.documentType === 'pasaporte' ? 'Pasaporte' : 'Cédula'}: {pet.owner.documentNumber}
                          </Typography>
                        </Box>
                      )}
                      {pet.owner.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PhoneIcon fontSize="small" />
                          <Typography variant="caption">
                            {pet.owner.phone}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <EmailIcon fontSize="small" />
                        <Typography variant="caption">
                          {pet.owner.email}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <Typography sx={{ mb: 0.5 }} color="text.secondary">
                    Raza: {pet.breed || 'No especificada'}
                  </Typography>
                  <Typography variant="body2">
                    Género: {pet.gender === 'male' ? 'Macho' : 'Hembra'}
                  </Typography>
                  {pet.weight && (
                    <Typography variant="body2">
                      Peso: {pet.weight} kg
                    </Typography>
                  )}
                  {pet.birthDate && (
                    <Typography variant="body2">
                      Edad: {new Date().getFullYear() - new Date(pet.birthDate).getFullYear()} años
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  {userRole !== 'cliente' && (
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleOpenDialog(pet)}
                    >
                      Editar
                    </Button>
                  )}
                  <Button
                    size="small"
                    startIcon={<MedicalServices />}
                    onClick={() => navigate(`/medical-history/${pet.id}`)}
                  >
                    Ver Historial
                  </Button>
                  {userRole !== 'cliente' && (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDelete(pet.id)}
                    >
                      Eliminar
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPet ? 'Editar Mascota' : 'Agregar Mascota'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Nombre"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextField
            select
            margin="dense"
            name="species"
            label="Especie"
            fullWidth
            variant="outlined"
            value={formData.species}
            onChange={handleChange}
          >
            <MenuItem value="dog">Perro</MenuItem>
            <MenuItem value="cat">Gato</MenuItem>
            <MenuItem value="bird">Ave</MenuItem>
            <MenuItem value="rabbit">Conejo</MenuItem>
            <MenuItem value="other">Otro</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            name="breed"
            label="Raza"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.breed}
            onChange={handleChange}
          />
          <TextField
            select
            margin="dense"
            name="gender"
            label="Género"
            fullWidth
            variant="outlined"
            value={formData.gender}
            onChange={handleChange}
          >
            <MenuItem value="male">Macho</MenuItem>
            <MenuItem value="female">Hembra</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            name="birthDate"
            label="Fecha de Nacimiento"
            type="date"
            fullWidth
            variant="outlined"
            value={formData.birthDate}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="dense"
            name="weight"
            label="Peso (kg)"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.weight}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPet ? 'Actualizar' : 'Agregar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Pets;