import React, { useState } from 'react';
import {
  Button,
  ButtonGroup,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Paper,
  Divider
} from '@mui/material';
import {
  Visibility,
  Download,
  CloudUpload,
  ArrowDropDown,
  Description,
  History
} from '@mui/icons-material';
import DocumentHistory from './DocumentHistory';

interface ConsentActionsProps {
  consent: any;
  onUpload?: () => void;
  onSign?: () => void;
}

const ConsentActions: React.FC<ConsentActionsProps> = ({ consent, onUpload, onSign }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleView = () => {
    setViewDialogOpen(true);
    handleClose();
  };
  
  const handleDownloadBlank = () => {
    generatePDF(false); // Sin firma
    handleClose();
  };
  
  const handleDownloadSigned = () => {
    if (consent.digitalSignature) {
      generatePDF(true); // Con firma digital
    } else {
      alert('Este consentimiento no tiene firma digital');
    }
    handleClose();
  };
  
  const generatePDF = (includeSignature: boolean) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Consentimiento - ${consent.title}</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .header {
            text-align: center;
            border-bottom: 2px solid #2E7D32;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .header h1 {
            color: #2E7D32;
            margin: 0 0 10px 0;
          }
          
          .info-section {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          
          .info-row {
            display: flex;
            margin-bottom: 8px;
          }
          
          .label {
            font-weight: bold;
            min-width: 150px;
            color: #2E7D32;
          }
          
          .content-section {
            margin-bottom: 25px;
          }
          
          .content-section h3 {
            color: #2E7D32;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          
          .signature-section {
            margin-top: 50px;
            padding: 20px;
            border: 2px solid #2E7D32;
            border-radius: 5px;
          }
          
          .signature-img {
            max-width: 300px;
            margin-top: 10px;
          }
          
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>CONSENTIMIENTO INFORMADO</h1>
          <h2>${getConsentTypeLabel(consent.type)}</h2>
        </div>
        
        <div class="info-section">
          <div class="info-row">
            <span class="label">Mascota:</span>
            <span>${consent.pet?.name || 'No especificada'}</span>
          </div>
          <div class="info-row">
            <span class="label">Propietario:</span>
            <span>${consent.owner?.firstName || ''} ${consent.owner?.lastName || ''}</span>
          </div>
          <div class="info-row">
            <span class="label">Fecha:</span>
            <span>${new Date(consent.createdAt).toLocaleDateString('es-ES')}</span>
          </div>
        </div>
        
        <div class="content-section">
          <h3>Descripción del Procedimiento</h3>
          <p>${consent.description || 'No especificada'}</p>
        </div>
        
        ${consent.risks ? `
          <div class="content-section">
            <h3>Riesgos</h3>
            <p>${consent.risks}</p>
          </div>
        ` : ''}
        
        ${consent.alternatives ? `
          <div class="content-section">
            <h3>Alternativas</h3>
            <p>${consent.alternatives}</p>
          </div>
        ` : ''}
        
        <div class="signature-section">
          ${includeSignature && consent.digitalSignature ? `
            <h3>Firma Digital</h3>
            <p><strong>Firmado por:</strong> ${consent.signedBy}</p>
            <p><strong>Fecha:</strong> ${new Date(consent.signedDate).toLocaleString('es-ES')}</p>
            ${consent.digitalSignature.startsWith('data:image') ? 
              `<img src="${consent.digitalSignature}" class="signature-img" />` : 
              `<p style="font-size: 24px; font-style: italic;">${consent.digitalSignature}</p>`
            }
          ` : `
            <h3>Espacio para Firma</h3>
            <p>Yo, _________________________________, en mi calidad de propietario/responsable</p>
            <p>de la mascota mencionada, declaro que he sido informado y comprendo los riesgos</p>
            <p>y beneficios del procedimiento descrito.</p>
            <br><br>
            <div style="display: flex; justify-content: space-between; margin-top: 50px;">
              <div style="text-align: center;">
                <p>_______________________</p>
                <p>Firma del Propietario</p>
                <p>Fecha: _______________</p>
              </div>
              <div style="text-align: center;">
                <p>_______________________</p>
                <p>Firma del Veterinario</p>
                <p>Fecha: _______________</p>
              </div>
            </div>
          `}
        </div>
        
        <div class="footer">
          <p>Documento generado el ${new Date().toLocaleString('es-ES')}</p>
          <p>Sistema de Gestión Veterinaria</p>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
            Imprimir / Guardar como PDF
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; margin-left: 10px; cursor: pointer;">
            Cerrar
          </button>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
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
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'signed': return 'Firmado Digitalmente';
      case 'uploaded': return 'Documento Cargado';
      case 'rejected': return 'Rechazado';
      default: return status;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'signed': return 'success';
      case 'uploaded': return 'info';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };
  
  return (
    <>
      <ButtonGroup variant="outlined" size="small">
        <Button onClick={handleView} startIcon={<Visibility />}>
          Ver
        </Button>
        <Button onClick={handleClick} endIcon={<ArrowDropDown />}>
          Opciones
        </Button>
      </ButtonGroup>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleDownloadBlank}>
          <Download sx={{ mr: 1 }} />
          Descargar sin firma (para imprimir)
        </MenuItem>
        
        {consent.digitalSignature && (
          <MenuItem onClick={handleDownloadSigned}>
            <Description sx={{ mr: 1 }} />
            Descargar con firma digital
          </MenuItem>
        )}
        
        {!consent.digitalSignature && !consent.uploadedDocumentUrl && (
          <MenuItem onClick={onSign}>
            <Description sx={{ mr: 1 }} />
            Firmar digitalmente
          </MenuItem>
        )}
        
        {!consent.uploadedDocumentUrl && (
          <MenuItem onClick={onUpload}>
            <CloudUpload sx={{ mr: 1 }} />
            Cargar documento firmado
          </MenuItem>
        )}
        
        <Divider />
        
        <MenuItem onClick={() => {
          setHistoryDialogOpen(true);
          handleClose();
        }}>
          <History sx={{ mr: 1 }} />
          Ver historial de documentos
        </MenuItem>
      </Menu>
      
      {/* Dialog para Ver Consentimiento */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Consentimiento Informado</Typography>
            <Typography 
              variant="body2" 
              color={getStatusColor(consent.status) as any}
              sx={{ 
                px: 2, 
                py: 0.5, 
                borderRadius: 1,
                bgcolor: 'action.hover'
              }}
            >
              {getStatusLabel(consent.status)}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom color="primary">
              {consent.title}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Tipo:</strong> {getConsentTypeLabel(consent.type)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Mascota:</strong> {consent.pet?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Propietario:</strong> {consent.owner?.firstName} {consent.owner?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Fecha:</strong> {new Date(consent.createdAt).toLocaleDateString('es-ES')}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Descripción del Procedimiento:</strong>
              </Typography>
              <Typography variant="body2" paragraph>
                {consent.description}
              </Typography>
            </Box>
            
            {consent.risks && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Riesgos:</strong>
                </Typography>
                <Typography variant="body2" paragraph>
                  {consent.risks}
                </Typography>
              </Box>
            )}
            
            {consent.alternatives && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Alternativas:</strong>
                </Typography>
                <Typography variant="body2" paragraph>
                  {consent.alternatives}
                </Typography>
              </Box>
            )}
            
            {consent.digitalSignature && (
              <Box sx={{ mt: 3, p: 2, border: '2px solid', borderColor: 'primary.main', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Firma Digital:</strong>
                </Typography>
                <Typography variant="body2">
                  Firmado por: {consent.signedBy}
                </Typography>
                <Typography variant="body2">
                  Fecha: {new Date(consent.signedDate).toLocaleString('es-ES')}
                </Typography>
                {consent.digitalSignature.startsWith('data:image') && (
                  <img 
                    src={consent.digitalSignature} 
                    alt="Firma" 
                    style={{ maxWidth: '300px', marginTop: '10px' }}
                  />
                )}
              </Box>
            )}
          </Paper>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog para Historial de Documentos */}
      <DocumentHistory
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        consentId={consent.id}
      />
    </>
  );
};

export default ConsentActions;