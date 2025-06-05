import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { FileDownloadOutlined } from '@mui/icons-material';

export default function ExportProgressDialog({ 
  open, 
  progress, 
  isExporting,
  onClose 
}) {
  const getProgressMessage = () => {
    if (progress === 0) return 'Iniciando exportación...';
    if (progress < 50) return 'Procesando datos...';
    if (progress < 90) return 'Generando archivo Excel...';
    if (progress < 100) return 'Finalizando exportación...';
    return 'Exportación completada';
  };

  return (
    <Dialog 
      open={open} 
      onClose={isExporting ? null : onClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={isExporting}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1 
      }}>
        <FileDownloadOutlined color="primary" />
        Exportando a Excel
      </DialogTitle>
      
      <DialogContent sx={{ pb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
            >
              {`${Math.round(progress)}%`}
            </Typography>
          </Box>
        </Box>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ textAlign: 'center' }}
        >
          {getProgressMessage()}
        </Typography>
        
        {isExporting && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
} 