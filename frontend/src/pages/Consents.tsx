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
  Card,
  CardContent,
  Snackbar,
  Alert,
  Tooltip
} from '@mui/material';
import Grid from '../components/GridCompat';
import SignatureCanvas from '../components/SignatureCanvas';
import ConsentActions from '../components/ConsentActions';
import ConsentUpload from '../components/ConsentUpload';
import {
  Add as AddIcon,
  Description as DocumentIcon,
  CheckCircle as SignIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  GetApp as DownloadIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Pet {
  id: string;
  name: string;
  species: string;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  ownerId?: string;
}

interface Consent {
  id: string;
  type: string;
  status: string;
  description: string;
  risks?: string;
  alternatives?: string;
  documentUrl?: string;
  signedDate?: string;
  signedBy?: string;
  relationship?: string;
  digitalSignature?: string;
  additionalNotes?: string;
  pet: Pet;
  requestedBy: {
    firstName: string;
    lastName: string;
  };
  approvedBy?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export default function Consents() {
  const { user } = useAuth();
  const [consents, setConsents] = useState<Consent[]>([]);
  const [pendingConsents, setPendingConsents] = useState<Consent[]>([]);
  const [selectedConsent, setSelectedConsent] = useState<Consent | null>(null);
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openSignDialog, setOpenSignDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [showSignatureCanvas, setShowSignatureCanvas] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const [newConsent, setNewConsent] = useState({
    petId: '',
    type: 'surgery',
    description: '',
    risks: '',
    alternatives: ''
  });

  const [signData, setSignData] = useState({
    signedBy: '',
    relationship: 'Propietario',
    digitalSignature: ''
  });

  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadConsents();
    if (user?.role === 'cliente') {
      loadPendingConsents();
    }
    if (user?.role === 'veterinarian' || user?.role === 'admin') {
      loadPets();
    }
  }, [user]);

  const loadConsents = async () => {
    try {
      const response = await api.get('/consents');
      setConsents(response.data.consents || []);
    } catch (error: any) {
      console.error('Error loading consents:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al cargar consentimientos',
        severity: 'error'
      });
    }
  };

  const loadPendingConsents = async () => {
    try {
      const response = await api.get('/consents/pending');
      setPendingConsents(response.data.consents || []);
    } catch (error: any) {
      console.error('Error loading pending consents:', error);
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

  const handleCreateConsent = async () => {
    try {
      const formData = new FormData();
      Object.keys(newConsent).forEach(key => {
        formData.append(key, (newConsent as any)[key]);
      });

      await api.post('/consents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSnackbar({
        open: true,
        message: 'Consentimiento creado exitosamente',
        severity: 'success'
      });
      setOpenNewDialog(false);
      loadConsents();
      setNewConsent({
        petId: '',
        type: 'surgery',
        description: '',
        risks: '',
        alternatives: ''
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al crear consentimiento',
        severity: 'error'
      });
    }
  };

  const handleSign = async () => {
    if (!selectedConsent) return;

    try {
      await api.post(`/consents/${selectedConsent.id}/sign`, signData);
      setSnackbar({
        open: true,
        message: 'Consentimiento firmado exitosamente',
        severity: 'success'
      });
      setOpenSignDialog(false);
      loadConsents();
      loadPendingConsents();
      setSignData({
        signedBy: '',
        relationship: 'Propietario',
        digitalSignature: ''
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al firmar consentimiento',
        severity: 'error'
      });
    }
  };

  const handleReject = async () => {
    if (!selectedConsent) return;

    try {
      await api.post(`/consents/${selectedConsent.id}/reject`, { reason: rejectReason });
      setSnackbar({
        open: true,
        message: 'Consentimiento rechazado',
        severity: 'success'
      });
      setOpenRejectDialog(false);
      loadConsents();
      loadPendingConsents();
      setRejectReason('');
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al rechazar consentimiento',
        severity: 'error'
      });
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'signed': return 'success';
      case 'rejected': return 'error';
      case 'expired': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'signed': return 'Firmado';
      case 'rejected': return 'Rechazado';
      case 'expired': return 'Expirado';
      default: return status;
    }
  };

  const getConsentTypeLabel = (type: string) => {
    switch (type) {
      case 'surgery': return 'Cirugía';
      case 'anesthesia': return 'Anestesia';
      case 'euthanasia': return 'Eutanasia';
      case 'treatment': return 'Tratamiento';
      default: return type;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          <DocumentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Consentimientos
        </Typography>
        {(user?.role === 'veterinarian' || user?.role === 'admin') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenNewDialog(true)}
          >
            Nuevo Consentimiento
          </Button>
        )}
      </Box>

      {/* Consentimientos Pendientes para Clientes */}
      {user?.role === 'cliente' && pendingConsents.length > 0 && (
        <Card sx={{ mb: 3, bgcolor: 'warning.light' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Consentimientos Pendientes de Firma
            </Typography>
            <Grid container spacing={2}>
              {pendingConsents.map((consent) => (
                <Grid item xs={12} md={6} key={consent.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1">
                        {consent.pet.name} - {getConsentTypeLabel(consent.type)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Solicitado por: Dr. {consent.requestedBy.firstName} {consent.requestedBy.lastName}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {consent.description}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<SignIcon />}
                          onClick={() => {
                            setSelectedConsent(consent);
                            setOpenSignDialog(true);
                          }}
                          size="small"
                        >
                          Firmar Digital
                        </Button>
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<UploadIcon />}
                          onClick={() => {
                            setSelectedConsent(consent);
                            setOpenUploadDialog(true);
                          }}
                          size="small"
                        >
                          Cargar Firmado
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<RejectIcon />}
                          onClick={() => {
                            setSelectedConsent(consent);
                            setOpenRejectDialog(true);
                          }}
                          size="small"
                        >
                          Rechazar
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Tabla de Consentimientos */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mascota</TableCell>
              {(user?.role === 'admin' || user?.role === 'veterinarian') && (
                <TableCell>Propietario</TableCell>
              )}
              <TableCell>Tipo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha Solicitud</TableCell>
              <TableCell>Firmado Por</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {consents.map((consent) => (
              <TableRow key={consent.id}>
                <TableCell>{consent.pet.name}</TableCell>
                {(user?.role === 'admin' || user?.role === 'veterinarian') && (
                  <TableCell>
                    {consent.pet.owner 
                      ? `${consent.pet.owner.firstName} ${consent.pet.owner.lastName}`
                      : 'No asignado'}
                  </TableCell>
                )}
                <TableCell>{getConsentTypeLabel(consent.type)}</TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusLabel(consent.status)}
                    color={getStatusColor(consent.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(consent.createdAt)}</TableCell>
                <TableCell>
                  {consent.signedBy || '-'}
                  {consent.signedDate && (
                    <Typography variant="caption" display="block">
                      {formatDate(consent.signedDate)}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <ConsentActions 
                    consent={consent}
                    onUpload={() => {
                      setSelectedConsent(consent);
                      setOpenUploadDialog(true);
                    }}
                    onSign={() => {
                      setSelectedConsent(consent);
                      setOpenSignDialog(true);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Nuevo Consentimiento */}
      <Dialog open={openNewDialog} onClose={() => setOpenNewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Consentimiento</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Mascota</InputLabel>
            <Select
              value={newConsent.petId}
              onChange={(e) => setNewConsent({...newConsent, petId: e.target.value})}
              label="Mascota"
            >
              {pets.map(pet => (
                <MenuItem key={pet.id} value={pet.id}>
                  {pet.name} - {pet.owner ? `${pet.owner.firstName} ${pet.owner.lastName}` : 'Sin dueño'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo de Consentimiento</InputLabel>
            <Select
              value={newConsent.type}
              onChange={(e) => setNewConsent({...newConsent, type: e.target.value})}
              label="Tipo de Consentimiento"
            >
              <MenuItem value="surgery">Cirugía</MenuItem>
              <MenuItem value="anesthesia">Anestesia</MenuItem>
              <MenuItem value="treatment">Tratamiento</MenuItem>
              <MenuItem value="euthanasia">Eutanasia</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="Descripción del Procedimiento"
            value={newConsent.description}
            onChange={(e) => setNewConsent({...newConsent, description: e.target.value})}
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Riesgos"
            value={newConsent.risks}
            onChange={(e) => setNewConsent({...newConsent, risks: e.target.value})}
            multiline
            rows={2}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Alternativas"
            value={newConsent.alternatives}
            onChange={(e) => setNewConsent({...newConsent, alternatives: e.target.value})}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateConsent} variant="contained">Crear</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Ver Detalles */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Detalles del Consentimiento
        </DialogTitle>
        <DialogContent>
          {selectedConsent && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Mascota:</Typography>
                <Typography>{selectedConsent.pet.name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Propietario:</Typography>
                <Typography>
                  {selectedConsent.pet.owner 
                    ? `${selectedConsent.pet.owner.firstName} ${selectedConsent.pet.owner.lastName}`
                    : 'No asignado'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Tipo:</Typography>
                <Typography>{getConsentTypeLabel(selectedConsent.type)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Estado:</Typography>
                <Chip 
                  label={getStatusLabel(selectedConsent.status)}
                  color={getStatusColor(selectedConsent.status) as any}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Descripción:</Typography>
                <Typography>{selectedConsent.description}</Typography>
              </Grid>
              {selectedConsent.risks && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Riesgos:</Typography>
                  <Typography>{selectedConsent.risks}</Typography>
                </Grid>
              )}
              {selectedConsent.alternatives && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Alternativas:</Typography>
                  <Typography>{selectedConsent.alternatives}</Typography>
                </Grid>
              )}
              <Grid item xs={6}>
                <Typography variant="subtitle2">Solicitado por:</Typography>
                <Typography>
                  Dr. {selectedConsent.requestedBy.firstName} {selectedConsent.requestedBy.lastName}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Fecha de Solicitud:</Typography>
                <Typography>{formatDate(selectedConsent.createdAt)}</Typography>
              </Grid>
              {selectedConsent.signedBy && (
                <>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Firmado por:</Typography>
                    <Typography>{selectedConsent.signedBy}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Fecha de Firma:</Typography>
                    <Typography>{selectedConsent.signedDate ? formatDate(selectedConsent.signedDate) : '-'}</Typography>
                  </Grid>
                  {selectedConsent.relationship && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Relación con la mascota:</Typography>
                      <Typography>{selectedConsent.relationship}</Typography>
                    </Grid>
                  )}
                  {selectedConsent.digitalSignature && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Firma Digital:</Typography>
                      {selectedConsent.digitalSignature.startsWith('data:image') ? (
                        <Box sx={{ mt: 1, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                          <img 
                            src={selectedConsent.digitalSignature} 
                            alt="Firma Digital" 
                            style={{ maxWidth: '100%', maxHeight: '150px' }}
                          />
                        </Box>
                      ) : (
                        <Typography sx={{ fontStyle: 'italic', fontSize: '1.2rem', mt: 1 }}>
                          {selectedConsent.digitalSignature}
                        </Typography>
                      )}
                    </Grid>
                  )}
                </>
              )}
              {selectedConsent.additionalNotes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Notas adicionales:</Typography>
                  <Typography>{selectedConsent.additionalNotes}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Firmar Consentimiento */}
      <Dialog open={openSignDialog} onClose={() => {
        setOpenSignDialog(false);
        setShowSignatureCanvas(false);
      }} maxWidth="md" fullWidth>
        <DialogTitle>Firmar Consentimiento</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Al firmar este consentimiento, acepto los términos y condiciones del procedimiento descrito.
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            label="Nombre completo"
            value={signData.signedBy}
            onChange={(e) => setSignData({...signData, signedBy: e.target.value})}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Relación con la mascota</InputLabel>
            <Select
              value={signData.relationship}
              onChange={(e) => setSignData({...signData, relationship: e.target.value})}
              label="Relación con la mascota"
            >
              <MenuItem value="Propietario">Propietario</MenuItem>
              <MenuItem value="Familiar">Familiar</MenuItem>
              <MenuItem value="Autorizado">Autorizado</MenuItem>
            </Select>
          </FormControl>
          
          {/* Canvas de Firma o Campo de Texto */}
          {showSignatureCanvas ? (
            <SignatureCanvas
              onSignatureComplete={(signature) => {
                setSignData({...signData, digitalSignature: signature});
                setShowSignatureCanvas(false);
              }}
              onCancel={() => setShowSignatureCanvas(false)}
            />
          ) : (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setShowSignatureCanvas(true)}
                fullWidth
                sx={{ mb: 1 }}
              >
                Dibujar Firma Digital
              </Button>
              {signData.digitalSignature && (
                <Box sx={{ mt: 1, p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
                  {signData.digitalSignature.startsWith('data:image') ? (
                    <>
                      <Typography variant="caption">Firma capturada:</Typography>
                      <img 
                        src={signData.digitalSignature} 
                        alt="Firma" 
                        style={{ maxWidth: '100%', maxHeight: '100px' }}
                      />
                      <Button 
                        size="small" 
                        onClick={() => setSignData({...signData, digitalSignature: ''})}
                      >
                        Limpiar
                      </Button>
                    </>
                  ) : (
                    <TextField
                      fullWidth
                      label="O escriba su nombre como firma"
                      value={signData.digitalSignature}
                      onChange={(e) => setSignData({...signData, digitalSignature: e.target.value})}
                      helperText="Escriba su nombre completo como firma digital"
                    />
                  )}
                </Box>
              )}
              {!signData.digitalSignature && (
                <TextField
                  fullWidth
                  margin="normal"
                  label="O escriba su nombre como firma"
                  value={signData.digitalSignature}
                  onChange={(e) => setSignData({...signData, digitalSignature: e.target.value})}
                  helperText="Escriba su nombre completo como firma digital"
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenSignDialog(false);
            setShowSignatureCanvas(false);
          }}>Cancelar</Button>
          <Button 
            onClick={handleSign} 
            variant="contained" 
            color="success"
            disabled={!signData.signedBy || !signData.digitalSignature}
          >
            Firmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Rechazar Consentimiento */}
      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rechazar Consentimiento</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Por favor indique el motivo del rechazo del consentimiento.
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            label="Motivo del rechazo"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleReject} 
            variant="contained" 
            color="error"
            disabled={!rejectReason}
          >
            Rechazar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para cargar consentimiento firmado */}
      {selectedConsent && (
        <ConsentUpload
          open={openUploadDialog}
          onClose={() => setOpenUploadDialog(false)}
          consentId={selectedConsent.id}
          onSuccess={() => {
            setSnackbar({
              open: true,
              message: 'Documentos cargados exitosamente',
              severity: 'success'
            });
            loadConsents();
            loadPendingConsents();
          }}
        />
      )}

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