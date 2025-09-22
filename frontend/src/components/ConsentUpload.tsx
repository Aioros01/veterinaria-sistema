import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  Stack,
  Chip
} from '@mui/material';
import { 
  CloudUpload, 
  Description, 
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import api from '../services/api';

interface ConsentUploadProps {
  open: boolean;
  onClose: () => void;
  consentId: string;
  onSuccess: () => void;
}

export const ConsentUpload: React.FC<ConsentUploadProps> = ({
  open,
  onClose,
  consentId,
  onSuccess
}) => {
  const [signedPdf, setSignedPdf] = useState<File | null>(null);
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'id') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (type === 'pdf') {
      if (file.type !== 'application/pdf') {
        setError('El consentimiento debe ser un archivo PDF');
        return;
      }
      setSignedPdf(file);
    } else {
      // Aceptar PDF o imágenes para la cédula
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setError('La cédula debe ser PDF o imagen (JPG, PNG)');
        return;
      }
      setIdDocument(file);
    }
    setError('');
  };

  const handleUpload = async () => {
    if (!signedPdf) {
      setError('Por favor cargue el consentimiento firmado');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('signedConsent', signedPdf);
      
      // El documento de identidad es opcional
      if (idDocument) {
        formData.append('idDocument', idDocument);
      }

      await api.post(`/consents/${consentId}/upload-signed`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar los documentos');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSignedPdf(null);
      setIdDocument(null);
      setError('');
      onClose();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <CloudUpload />
          Cargar Consentimiento Firmado
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Consentimiento Firmado */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              1. Consentimiento Firmado (PDF)
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Descargue el PDF, imprímalo, fírmelo y vuélvalo a cargar
            </Typography>
            
            <input
              accept="application/pdf"
              style={{ display: 'none' }}
              id="pdf-file-input"
              type="file"
              onChange={(e) => handleFileSelect(e, 'pdf')}
              disabled={uploading}
            />
            <label htmlFor="pdf-file-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<Description />}
                disabled={uploading}
                fullWidth
                sx={{ mt: 1 }}
              >
                {signedPdf ? 'Cambiar PDF' : 'Seleccionar PDF Firmado'}
              </Button>
            </label>
            
            {signedPdf && (
              <Chip
                icon={<CheckCircle />}
                label={`${signedPdf.name} (${formatFileSize(signedPdf.size)})`}
                color="success"
                onDelete={() => setSignedPdf(null)}
                sx={{ mt: 1, maxWidth: '100%' }}
              />
            )}
          </Box>

          {/* Documento de Identidad */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              2. Copia de Cédula de Identidad (Opcional)
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Para verificación de identidad (PDF o imagen) - OPCIONAL
            </Typography>
            
            <input
              accept="application/pdf,image/*"
              style={{ display: 'none' }}
              id="id-file-input"
              type="file"
              onChange={(e) => handleFileSelect(e, 'id')}
              disabled={uploading}
            />
            <label htmlFor="id-file-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<Description />}
                disabled={uploading}
                fullWidth
                sx={{ mt: 1 }}
              >
                {idDocument ? 'Cambiar Cédula' : 'Seleccionar Cédula'}
              </Button>
            </label>
            
            {idDocument && (
              <Chip
                icon={<CheckCircle />}
                label={`${idDocument.name} (${formatFileSize(idDocument.size)})`}
                color="success"
                onDelete={() => setIdDocument(null)}
                sx={{ mt: 1, maxWidth: '100%' }}
              />
            )}
          </Box>

          {uploading && (
            <Box>
              <Typography variant="body2" gutterBottom>
                Cargando documentos...
              </Typography>
              <LinearProgress />
            </Box>
          )}

          <Alert severity="info">
            <Typography variant="body2">
              <strong>Importante:</strong> Los documentos cargados serán verificados por el personal veterinario.
            </Typography>
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Cancelar
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!signedPdf || !idDocument || uploading}
          startIcon={uploading ? null : <CloudUpload />}
        >
          {uploading ? 'Cargando...' : 'Cargar Documentos'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConsentUpload;