import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Chip,
  Box,
  CircularProgress,
  Divider,
  Alert
} from '@mui/material';
import {
  History,
  Description,
  Badge,
  Download,
  Visibility,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import api from '../services/api';

interface DocumentHistoryItem {
  id: string;
  documentType: 'signed_consent' | 'id_document';
  documentUrl: string;
  originalFileName?: string;
  mimeType?: string;
  fileSize?: number;
  isActive: boolean;
  notes?: string;
  uploadedAt: string;
  uploadedBy?: {
    firstName: string;
    lastName: string;
  };
}

interface DocumentHistoryProps {
  open: boolean;
  onClose: () => void;
  consentId: string;
}

const DocumentHistory: React.FC<DocumentHistoryProps> = ({ open, onClose, consentId }) => {
  const [history, setHistory] = useState<DocumentHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && consentId) {
      loadHistory();
    }
  }, [open, consentId]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/consents/${consentId}/document-history`);
      setHistory(response.data.history);
    } catch (err: any) {
      setError('Error al cargar el historial');
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getDocumentTypeLabel = (type: string) => {
    return type === 'signed_consent' ? 'Consentimiento Firmado' : 'Documento de Identidad';
  };

  const getDocumentIcon = (type: string) => {
    return type === 'signed_consent' ? <Description /> : <Badge />;
  };

  const handleDownload = (url: string, fileName?: string) => {
    const link = document.createElement('a');
    link.href = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}${url}`;
    link.download = fileName || 'documento';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (url: string) => {
    window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}${url}`, '_blank');
  };

  const groupHistoryByDate = () => {
    const grouped: { [key: string]: DocumentHistoryItem[] } = {};
    
    history.forEach(item => {
      const date = new Date(item.uploadedAt).toLocaleDateString('es-ES');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    
    return grouped;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <History />
          Historial de Documentos
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : history.length === 0 ? (
          <Typography color="text.secondary" align="center" py={3}>
            No hay documentos en el historial
          </Typography>
        ) : (
          <Box>
            {Object.entries(groupHistoryByDate()).map(([date, items]) => (
              <Box key={date} mb={3}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {date}
                </Typography>
                <Divider sx={{ mb: 1 }} />
                
                <List dense>
                  {items.map((item) => (
                    <ListItem key={item.id}>
                      <ListItemIcon>
                        {getDocumentIcon(item.documentType)}
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body1">
                              {getDocumentTypeLabel(item.documentType)}
                            </Typography>
                            {item.isActive && (
                              <Chip
                                label="Actual"
                                size="small"
                                color="success"
                                icon={<CheckCircle />}
                              />
                            )}
                            {!item.isActive && (
                              <Chip
                                label="Anterior"
                                size="small"
                                variant="outlined"
                                icon={<Cancel />}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="caption" display="block">
                              Archivo: {item.originalFileName || 'Sin nombre'}
                            </Typography>
                            <Typography variant="caption" display="block">
                              Tamaño: {formatFileSize(item.fileSize)}
                            </Typography>
                            <Typography variant="caption" display="block">
                              Subido por: {item.uploadedBy ?
                                `${item.uploadedBy.firstName} ${item.uploadedBy.lastName}` :
                                'Usuario desconocido'}
                            </Typography>
                            <Typography variant="caption" display="block">
                              Hora: {new Date(item.uploadedAt).toLocaleTimeString('es-ES')}
                            </Typography>
                            {item.notes && (
                              <Typography variant="caption" display="block" sx={{ fontStyle: 'italic' }}>
                                Nota: {item.notes}
                              </Typography>
                            )}
                          </>
                        }
                      />
                      
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleView(item.documentUrl)}
                          title="Ver documento"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => handleDownload(item.documentUrl, item.originalFileName)}
                          title="Descargar"
                        >
                          <Download />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="caption">
                <strong>Trazabilidad:</strong> Este historial muestra todas las versiones de documentos 
                cargados para este consentimiento. Los documentos marcados como "Actual" son los que 
                están activos en el sistema. Los anteriores se mantienen para auditoría.
              </Typography>
            </Alert>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentHistory;