import React, { useRef, useState, useEffect } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import { Clear as ClearIcon, Done as DoneIcon } from '@mui/icons-material';

interface SignatureCanvasProps {
  onSignatureComplete: (signature: string) => void;
  onCancel: () => void;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({ 
  onSignatureComplete, 
  onCancel 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Configurar el canvas
    context.strokeStyle = '#000000';
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    // Fondo blanco
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    setHasSignature(true);

    const rect = canvas.getBoundingClientRect();
    const context = canvas.getContext('2d');
    if (!context) return;

    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const context = canvas.getContext('2d');
    if (!context) return;

    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convertir canvas a base64
    const signatureData = canvas.toDataURL('image/png');
    onSignatureComplete(signatureData);
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Firme aquí con el mouse o dedo
      </Typography>
      
      <Box sx={{ 
        border: '2px dashed #ccc', 
        borderRadius: 1, 
        mb: 2,
        position: 'relative',
        backgroundColor: '#f9f9f9'
      }}>
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          style={{ 
            width: '100%', 
            height: '200px',
            cursor: 'crosshair',
            touchAction: 'none'
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasSignature && (
          <Typography
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#999',
              pointerEvents: 'none',
              userSelect: 'none'
            }}
          >
            Firme aquí
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<ClearIcon />}
          onClick={clearSignature}
          disabled={!hasSignature}
        >
          Limpiar
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<DoneIcon />}
          onClick={saveSignature}
          disabled={!hasSignature}
        >
          Aceptar Firma
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={onCancel}
        >
          Cancelar
        </Button>
      </Box>
    </Paper>
  );
};

export default SignatureCanvas;