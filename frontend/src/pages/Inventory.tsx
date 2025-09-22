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
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import { 
  Warning, 
  Add, 
  Edit, 
  Delete,
  Search
} from '@mui/icons-material';
import { medicineService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Medicine {
  id: string;
  name: string;
  activeIngredient?: string;
  presentation?: string;
  concentration?: string;
  laboratoryName?: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  unitPrice: number;
  expirationDate?: string;
  manufacturer?: string;
  requiresPrescription?: boolean;
  storageConditions?: string;
}

const Inventory: React.FC = () => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [lowStockMedicines, setLowStockMedicines] = useState<Medicine[]>([]);
  const [expiringMedicines, setExpiringMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning'
  });
  
  const [formData, setFormData] = useState({
    name: '',
    activeIngredient: '',
    presentation: '',
    concentration: '',
    laboratoryName: '',
    category: 'antibiotic',
    minimumStock: 10,
    currentStock: 0,
    unitPrice: 0,
    requiresPrescription: false,
    storageConditions: '',
    expirationDate: ''
  });

  // Obtener el rol del usuario desde el objeto user en localStorage
  const userStr = localStorage.getItem('user');
  const userObj = userStr ? JSON.parse(userStr) : null;
  const userRole = userObj?.role;
  const canEdit = userRole === 'admin' || userRole === 'veterinarian' || userRole === 'veterinario';

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    // Filtrar medicamentos cuando cambie el término de búsqueda
    if (searchTerm) {
      const filtered = medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (medicine.activeIngredient && medicine.activeIngredient.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (medicine.laboratoryName && medicine.laboratoryName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredMedicines(filtered);
    } else {
      setFilteredMedicines(medicines);
    }
  }, [searchTerm, medicines]);

  const loadInventory = async () => {
    try {
      const [allResponse, lowStockResponse, expiringResponse] = await Promise.all([
        medicineService.getAll(),
        medicineService.getLowStock(),
        medicineService.getExpiring(),
      ]);
      
      setMedicines(allResponse.data.medicines || []);
      setFilteredMedicines(allResponse.data.medicines || []);
      setLowStockMedicines(lowStockResponse.data.medicines || []);
      setExpiringMedicines(expiringResponse.data.medicines || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar el inventario',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSearchTerm(''); // Limpiar búsqueda al cambiar de tab
  };

  const handleOpenDialog = (medicine?: Medicine) => {
    if (medicine) {
      setEditingMedicine(medicine);
      setFormData({
        name: medicine.name,
        activeIngredient: medicine.activeIngredient || '',
        presentation: medicine.presentation || '',
        concentration: medicine.concentration || '',
        laboratoryName: medicine.laboratoryName || '',
        category: medicine.category,
        minimumStock: medicine.minimumStock,
        currentStock: medicine.currentStock,
        unitPrice: medicine.unitPrice,
        requiresPrescription: medicine.requiresPrescription || false,
        storageConditions: medicine.storageConditions || '',
        expirationDate: medicine.expirationDate || ''
      });
    } else {
      setEditingMedicine(null);
      setFormData({
        name: '',
        activeIngredient: '',
        presentation: '',
        concentration: '',
        laboratoryName: '',
        category: 'antibiotic',
        minimumStock: 10,
        currentStock: 0,
        unitPrice: 0,
        requiresPrescription: false,
        storageConditions: '',
        expirationDate: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMedicine(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async () => {
    try {
      const medicineData = {
        ...formData,
        minimumStock: Number(formData.minimumStock),
        currentStock: Number(formData.currentStock),
        unitPrice: Number(formData.unitPrice)
      };

      if (editingMedicine) {
        await medicineService.updateMedicine(editingMedicine.id, medicineData);
        setSnackbar({
          open: true,
          message: 'Medicamento actualizado exitosamente',
          severity: 'success'
        });
      } else {
        await medicineService.createMedicine(medicineData);
        setSnackbar({
          open: true,
          message: 'Medicamento creado exitosamente',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      loadInventory();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al guardar el medicamento',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este medicamento?')) {
      try {
        await medicineService.deleteMedicine(id);
        setSnackbar({
          open: true,
          message: 'Medicamento eliminado exitosamente',
          severity: 'success'
        });
        loadInventory();
      } catch (error: any) {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Error al eliminar el medicamento',
          severity: 'error'
        });
      }
    }
  };

  const handleUpdateStock = async (id: string, newStock: number) => {
    try {
      await medicineService.updateStock(id, { quantity: newStock });
      setSnackbar({
        open: true,
        message: 'Stock actualizado exitosamente',
        severity: 'success'
      });
      loadInventory();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al actualizar el stock',
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const getCurrentMedicineList = () => {
    if (tabValue === 0) return searchTerm ? filteredMedicines : medicines;
    if (tabValue === 1) return lowStockMedicines;
    if (tabValue === 2) return expiringMedicines;
    return [];
  };

  const renderMedicineTable = (medicineList: Medicine[], showWarnings: boolean = false) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Categoría</TableCell>
            <TableCell>Stock Actual</TableCell>
            <TableCell>Stock Mínimo</TableCell>
            <TableCell>Precio Unitario</TableCell>
            <TableCell>Vencimiento</TableCell>
            <TableCell>Laboratorio</TableCell>
            {showWarnings && <TableCell>Alerta</TableCell>}
            {canEdit && <TableCell>Acciones</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {medicineList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={canEdit ? 9 : 8} align="center">
                {searchTerm ? 'No se encontraron medicamentos que coincidan con la búsqueda' : 'No hay medicamentos en esta categoría'}
              </TableCell>
            </TableRow>
          ) : (
            medicineList.map((medicine) => {
              const isLowStock = medicine.currentStock <= medicine.minimumStock;
              const expirationDate = medicine.expirationDate ? new Date(medicine.expirationDate) : null;
              const daysUntilExpiration = expirationDate ? 
                Math.ceil((expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
              const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= 30 && daysUntilExpiration > 0;
              const isExpired = daysUntilExpiration !== null && daysUntilExpiration <= 0;

              return (
                <TableRow key={medicine.id}>
                  <TableCell>{medicine.name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={medicine.category} 
                      size="small"
                      color={
                        medicine.category === 'antibiotic' ? 'primary' :
                        medicine.category === 'antiinflammatory' ? 'secondary' :
                        medicine.category === 'antiparasitic' ? 'success' :
                        'default'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {medicine.currentStock}
                      {isLowStock && <Warning color="warning" fontSize="small" />}
                    </Box>
                  </TableCell>
                  <TableCell>{medicine.minimumStock}</TableCell>
                  <TableCell>${medicine.unitPrice ? Number(medicine.unitPrice).toFixed(2) : '0.00'}</TableCell>
                  <TableCell>
                    {expirationDate ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        {expirationDate.toLocaleDateString()}
                        {(isExpiringSoon || isExpired) && (
                          <Warning color={isExpired ? "error" : "warning"} fontSize="small" />
                        )}
                      </Box>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{medicine.laboratoryName || medicine.manufacturer || '-'}</TableCell>
                  {showWarnings && (
                    <TableCell>
                      {isLowStock && (
                        <Chip label="Stock Bajo" color="warning" size="small" sx={{ mb: 0.5 }} />
                      )}
                      {isExpiringSoon && (
                        <Chip label="Por Vencer" color="warning" size="small" sx={{ mb: 0.5 }} />
                      )}
                      {isExpired && (
                        <Chip label="Vencido" color="error" size="small" />
                      )}
                    </TableCell>
                  )}
                  {canEdit && (
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(medicine)}
                        title="Editar"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(medicine.id)}
                        title="Eliminar"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Inventario de Medicamentos
        </Typography>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Agregar Medicamento
          </Button>
        )}
      </Box>

      {/* Barra de búsqueda */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por nombre, categoría, principio activo o laboratorio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={`Todos (${medicines.length})`} />
          <Tab label={`Stock Bajo (${lowStockMedicines.length})`} />
          <Tab label={`Por Vencer (${expiringMedicines.length})`} />
        </Tabs>
      </Paper>

      {renderMedicineTable(getCurrentMedicineList(), tabValue !== 0)}

      {/* Dialog para crear/editar medicamento */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingMedicine ? 'Editar Medicamento' : 'Agregar Medicamento'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              name="name"
              label="Nombre del Medicamento"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              name="activeIngredient"
              label="Principio Activo"
              value={formData.activeIngredient}
              onChange={handleChange}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                name="presentation"
                label="Presentación"
                value={formData.presentation}
                onChange={handleChange}
                fullWidth
                placeholder="Ej: Tabletas, Jarabe, Inyectable"
              />
              <TextField
                name="concentration"
                label="Concentración"
                value={formData.concentration}
                onChange={handleChange}
                fullWidth
                placeholder="Ej: 500mg, 10ml"
              />
            </Box>
            <TextField
              name="laboratoryName"
              label="Laboratorio"
              value={formData.laboratoryName}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              select
              name="category"
              label="Categoría"
              value={formData.category}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="antibiotic">Antibiótico</MenuItem>
              <MenuItem value="antiinflammatory">Antiinflamatorio</MenuItem>
              <MenuItem value="antiparasitic">Antiparasitario</MenuItem>
              <MenuItem value="vitamin">Vitamina</MenuItem>
              <MenuItem value="vaccine">Vacuna</MenuItem>
              <MenuItem value="other">Otro</MenuItem>
            </TextField>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                name="currentStock"
                label="Stock Actual"
                type="number"
                value={formData.currentStock}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                name="minimumStock"
                label="Stock Mínimo"
                type="number"
                value={formData.minimumStock}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                name="unitPrice"
                label="Precio Unitario"
                type="number"
                value={formData.unitPrice}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ step: 0.01 }}
              />
            </Box>
            <TextField
              name="expirationDate"
              label="Fecha de Vencimiento"
              type="date"
              value={formData.expirationDate}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              name="storageConditions"
              label="Condiciones de Almacenamiento"
              value={formData.storageConditions}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              placeholder="Ej: Mantener en lugar fresco y seco, refrigerado, etc."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingMedicine ? 'Actualizar' : 'Agregar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Inventory;