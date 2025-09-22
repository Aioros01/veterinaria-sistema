import React from 'react';
import { Button } from '@mui/material';
import { Download } from '@mui/icons-material';
import html2pdf from 'html2pdf.js';

interface ConsentPDFProps {
  consent: any;
}

const ConsentPDF: React.FC<ConsentPDFProps> = ({ consent }) => {
  const generateAndDownloadPDF = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Consentimiento Informado - ${consent.title}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #2E7D32;
          }
          
          .header h1 {
            color: #2E7D32;
            font-size: 28px;
            margin-bottom: 10px;
          }
          
          .header h2 {
            color: #555;
            font-size: 20px;
            font-weight: normal;
          }
          
          .info-box {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
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
          
          .section {
            margin-bottom: 25px;
          }
          
          .section h3 {
            color: #2E7D32;
            font-size: 18px;
            margin-bottom: 10px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          
          .section p {
            text-align: justify;
            margin-bottom: 10px;
          }
          
          .signature-section {
            margin-top: 40px;
            padding: 20px;
            border: 2px solid #2E7D32;
            border-radius: 8px;
            background: #f9f9f9;
          }
          
          .signature-img {
            max-width: 300px;
            height: auto;
            border: 1px solid #ddd;
            padding: 10px;
            background: white;
            border-radius: 4px;
          }
          
          .signature-text {
            font-family: 'Courier New', monospace;
            font-size: 24px;
            color: #2E7D32;
            font-style: italic;
          }
          
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          
          @media print {
            body {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>CONSENTIMIENTO INFORMADO</h1>
          <h2>${getConsentTypeLabel(consent.type)}</h2>
        </div>
        
        <div class="info-box">
          <div class="info-row">
            <span class="label">Título:</span>
            <span>${consent.title}</span>
          </div>
          <div class="info-row">
            <span class="label">Mascota:</span>
            <span>${consent.pet?.name || 'No especificada'}</span>
          </div>
          <div class="info-row">
            <span class="label">Propietario:</span>
            <span>${consent.owner?.firstName || ''} ${consent.owner?.lastName || ''}</span>
          </div>
          <div class="info-row">
            <span class="label">Fecha de Creación:</span>
            <span>${new Date(consent.createdAt).toLocaleDateString('es-ES')}</span>
          </div>
        </div>
        
        <div class="section">
          <h3>Descripción</h3>
          <p>${consent.description}</p>
        </div>
        
        ${consent.risks ? `
          <div class="section">
            <h3>Riesgos</h3>
            <p>${consent.risks}</p>
          </div>
        ` : ''}
        
        ${consent.alternatives ? `
          <div class="section">
            <h3>Alternativas</h3>
            <p>${consent.alternatives}</p>
          </div>
        ` : ''}
        
        ${consent.signedBy ? `
          <div class="signature-section">
            <h3>Firma del Consentimiento</h3>
            <p><span class="label">Firmado por:</span> ${consent.signedBy}</p>
            <p><span class="label">Relación:</span> ${consent.relationship || 'Propietario'}</p>
            <p><span class="label">Fecha de Firma:</span> ${consent.signedDate ? 
              new Date(consent.signedDate).toLocaleString('es-ES') : 
              'No especificada'}</p>
            
            ${consent.digitalSignature ? `
              <div style="margin-top: 20px;">
                <p class="label">Firma Digital:</p>
                ${consent.digitalSignature.startsWith('data:image') ? 
                  `<img src="${consent.digitalSignature}" class="signature-img" alt="Firma Digital"/>` :
                  `<p class="signature-text">${consent.digitalSignature}</p>`
                }
              </div>
            ` : ''}
          </div>
        ` : `
          <div class="signature-section">
            <h3>Estado: PENDIENTE DE FIRMA</h3>
            <p>Este consentimiento aún no ha sido firmado.</p>
          </div>
        `}
        
        ${consent.additionalNotes ? `
          <div class="section">
            <h3>Notas Adicionales</h3>
            <p>${consent.additionalNotes}</p>
          </div>
        ` : ''}
        
        <div class="footer">
          <p>Documento generado el ${new Date().toLocaleString('es-ES')}</p>
          <p>Sistema de Gestión Veterinaria</p>
        </div>
      </body>
      </html>
    `;
    
    // Crear un contenedor temporal para el HTML
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    container.style.display = 'none';
    document.body.appendChild(container);
    
    // Configuración para html2pdf
    const opt = {
      margin: 10,
      filename: `consentimiento_${consent.id}_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as 'portrait' }
    };
    
    // Generar y descargar el PDF
    html2pdf()
      .set(opt)
      .from(container)
      .save()
      .then(() => {
        // Limpiar el contenedor temporal
        document.body.removeChild(container);
      })
      .catch((error: any) => {
        console.error('Error generando PDF:', error);
        document.body.removeChild(container);
        alert('Error al generar el PDF. Por favor intente nuevamente.');
      });
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
    <Button
      variant="outlined"
      startIcon={<Download />}
      onClick={generateAndDownloadPDF}
      size="small"
    >
      Descargar PDF
    </Button>
  );
};

export default ConsentPDF;