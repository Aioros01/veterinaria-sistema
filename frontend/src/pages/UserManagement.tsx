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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  LockReset as ResetPasswordIcon,
  Block as BlockIcon,
  CheckCircle as ActivateIcon,
  People as PeopleIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import api from '../services/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  documentType?: string;
  documentNumber?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchDocument, setSearchDocument] = useState('');
  const [searchName, setSearchName] = useState('');
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'client',
    documentType: 'cedula',
    documentNumber: ''
  });

  const [editUser, setEditUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    documentType: '',
    documentNumber: ''
  });

  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const filterUsers = React.useCallback(() => {
    let filtered = [...users];

    if (searchDocument.trim() !== '') {
      filtered = filtered.filter(user =>
        user.documentNumber?.toLowerCase().includes(searchDocument.toLowerCase())
      );
    }

    if (searchName.trim() !== '') {
      filtered = filtered.filter(user =>
        (`${user.firstName} ${user.lastName}`).toLowerCase().includes(searchName.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchDocument, searchName]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.users || []);
      setFilteredUsers(response.data.users || []);
    } catch (error: any) {
      console.error('Error loading users:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al cargar usuarios',
        severity: 'error'
      });
    }
  };


  const handleSearchByDocument = async () => {
    if (!searchDocument) {
      filterUsers();
      return;
    }

    try {
      const response = await api.get(`/users/document/${searchDocument}`);
      setFilteredUsers([response.data.user]);
    } catch (error: any) {
      console.error('Error searching user:', error);
      if (error.response?.status === 404) {
        setFilteredUsers([]);
        setSnackbar({
          open: true,
          message: 'No se encontró un usuario con ese documento',
          severity: 'warning'
        });
      } else {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Error al buscar usuario',
          severity: 'error'
        });
      }
    }
  };

  const handleCreateUser = async () => {
    try {
      await api.post('/users/admin-create', newUser);
      setSnackbar({
        open: true,
        message: 'Usuario creado exitosamente',
        severity: 'success'
      });
      setOpenNewDialog(false);
      loadUsers();
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        role: 'client',
        documentType: 'cedula',
        documentNumber: ''
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al crear usuario',
        severity: 'error'
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      await api.put(`/users/${selectedUser.id}`, editUser);
      setSnackbar({
        open: true,
        message: 'Usuario actualizado exitosamente',
        severity: 'success'
      });
      setOpenEditDialog(false);
      loadUsers();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al actualizar usuario',
        severity: 'error'
      });
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    try {
      await api.post(`/users/${selectedUser.id}/reset-password`, {
        newPassword
      });
      setSnackbar({
        open: true,
        message: `Nueva contraseña para ${selectedUser.email}: ${newPassword}`,
        severity: 'success'
      });
      setOpenResetDialog(false);
      setNewPassword('');
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al restablecer contraseña',
        severity: 'error'
      });
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await api.patch(`/users/${user.id}/toggle-active`);
      setSnackbar({
        open: true,
        message: user.isActive ? 'Usuario desactivado' : 'Usuario activado',
        severity: 'success'
      });
      loadUsers();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al cambiar estado',
        severity: 'error'
      });
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleGeneratePassword = (field: 'new' | 'reset') => {
    const password = generatePassword();
    if (field === 'new') {
      setNewUser({...newUser, password});
    } else {
      setNewPassword(password);
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      documentType: user.documentType || 'cedula',
      documentNumber: user.documentNumber || ''
    });
    setOpenEditDialog(true);
  };

  const handleResetClick = (user: User) => {
    setSelectedUser(user);
    setNewPassword('');
    setOpenResetDialog(true);
  };

  const getRoleLabel = (role: string) => {
    switch(role) {
      case 'admin': return 'Administrador';
      case 'veterinarian': return 'Veterinario';
      case 'receptionist': return 'Recepcionista';
      case 'client': return 'Cliente';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'admin': return 'error';
      case 'veterinarian': return 'primary';
      case 'receptionist': return 'warning';
      case 'client': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Gestión de Usuarios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenNewDialog(true)}
        >
          Nuevo Usuario
        </Button>
      </Box>

      {/* Sección de Búsqueda */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Búsqueda de Usuarios
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Buscar por Cédula/Pasaporte"
            value={searchDocument}
            onChange={(e) => setSearchDocument(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearchByDocument();
              }
            }}
            sx={{ minWidth: 250 }}
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleSearchByDocument} size="small">
                  <SearchIcon />
                </IconButton>
              )
            }}
          />
          <TextField
            label="Buscar por Nombre"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            sx={{ minWidth: 250 }}
          />
          <Button
            variant="outlined"
            onClick={() => {
              setSearchDocument('');
              setSearchName('');
              loadUsers();
            }}
          >
            Limpiar Búsqueda
          </Button>
        </Box>
        {filteredUsers.length !== users.length && (
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            Mostrando {filteredUsers.length} de {users.length} usuarios
          </Typography>
        )}
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Documento</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha Registro</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.firstName} {user.lastName}</TableCell>
                <TableCell>
                  {user.documentNumber ? (
                    <>
                      <Typography variant="body2">
                        {user.documentType === 'cedula' ? 'C.I.' : 'Pasaporte'}: {user.documentNumber}
                      </Typography>
                    </>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone || '-'}</TableCell>
                <TableCell>
                  <Chip 
                    label={getRoleLabel(user.role)}
                    color={getRoleColor(user.role) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.isActive ? 'Activo' : 'Inactivo'}
                    color={user.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString('es-ES')}
                </TableCell>
                <TableCell>
                  <Tooltip title="Editar">
                    <IconButton onClick={() => handleEditClick(user)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Restablecer contraseña">
                    <IconButton onClick={() => handleResetClick(user)}>
                      <ResetPasswordIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={user.isActive ? 'Desactivar' : 'Activar'}>
                    <IconButton onClick={() => handleToggleActive(user)}>
                      {user.isActive ? <BlockIcon /> : <ActivateIcon />}
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Nuevo Usuario */}
      <Dialog open={openNewDialog} onClose={() => setOpenNewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Usuario</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Nombre"
            value={newUser.firstName}
            onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Apellido"
            value={newUser.lastName}
            onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
          />
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              margin="normal"
              label="Contraseña"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
            />
            <Button onClick={() => handleGeneratePassword('new')}>
              Generar
            </Button>
          </Box>
          <TextField
            fullWidth
            margin="normal"
            label="Teléfono (opcional)"
            value={newUser.phone}
            onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl sx={{ minWidth: 120 }} margin="normal">
              <InputLabel>Tipo Doc</InputLabel>
              <Select
                value={newUser.documentType}
                onChange={(e) => setNewUser({...newUser, documentType: e.target.value})}
                label="Tipo Doc"
              >
                <MenuItem value="cedula">Cédula</MenuItem>
                <MenuItem value="pasaporte">Pasaporte</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              margin="normal"
              label="Número de Documento"
              value={newUser.documentNumber}
              onChange={(e) => setNewUser({...newUser, documentNumber: e.target.value})}
            />
          </Box>
          <FormControl fullWidth margin="normal">
            <InputLabel>Rol</InputLabel>
            <Select
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              label="Rol"
            >
              <MenuItem value="client">Cliente</MenuItem>
              <MenuItem value="receptionist">Recepcionista</MenuItem>
              <MenuItem value="veterinarian">Veterinario</MenuItem>
              <MenuItem value="admin">Administrador</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateUser} variant="contained">Crear</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Editar Usuario */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Nombre"
            value={editUser.firstName}
            onChange={(e) => setEditUser({...editUser, firstName: e.target.value})}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Apellido"
            value={editUser.lastName}
            onChange={(e) => setEditUser({...editUser, lastName: e.target.value})}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            type="email"
            value={editUser.email}
            onChange={(e) => setEditUser({...editUser, email: e.target.value})}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Teléfono"
            value={editUser.phone}
            onChange={(e) => setEditUser({...editUser, phone: e.target.value})}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl sx={{ minWidth: 120 }} margin="normal">
              <InputLabel>Tipo Doc</InputLabel>
              <Select
                value={editUser.documentType}
                onChange={(e) => setEditUser({...editUser, documentType: e.target.value})}
                label="Tipo Doc"
              >
                <MenuItem value="cedula">Cédula</MenuItem>
                <MenuItem value="pasaporte">Pasaporte</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              margin="normal"
              label="Número de Documento"
              value={editUser.documentNumber}
              onChange={(e) => setEditUser({...editUser, documentNumber: e.target.value})}
            />
          </Box>
          <FormControl fullWidth margin="normal">
            <InputLabel>Rol</InputLabel>
            <Select
              value={editUser.role}
              onChange={(e) => setEditUser({...editUser, role: e.target.value})}
              label="Rol"
            >
              <MenuItem value="client">Cliente</MenuItem>
              <MenuItem value="receptionist">Recepcionista</MenuItem>
              <MenuItem value="veterinarian">Veterinario</MenuItem>
              <MenuItem value="admin">Administrador</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
          <Button onClick={handleUpdateUser} variant="contained">Actualizar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Restablecer Contraseña */}
      <Dialog open={openResetDialog} onClose={() => setOpenResetDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Restablecer Contraseña</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Typography variant="body1" sx={{ mb: 2 }}>
              Usuario: {selectedUser.email}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              margin="normal"
              label="Nueva Contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button onClick={() => handleGeneratePassword('reset')}>
              Generar
            </Button>
          </Box>
          <Alert severity="info" sx={{ mt: 2 }}>
            La nueva contraseña se mostrará en pantalla. Asegúrese de copiarla y entregarla al usuario de forma segura.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResetDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleResetPassword} 
            variant="contained"
            disabled={!newPassword}
          >
            Restablecer
          </Button>
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