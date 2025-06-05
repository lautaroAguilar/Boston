import { useState } from 'react';
import * as XLSX from 'xlsx';
import { useDashboard } from '@/contexts/dashboard';

export const useExcelExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const { setSnackbarMessage, setSnackbarErrorMessage } = useDashboard();

  // Función para formatear valores según su tipo
  const formatCellValue = (value, fieldType = 'text') => {
    if (value === null || value === undefined) return '';
    
    switch (fieldType) {
      case 'date':
        return value ? new Date(value).toLocaleDateString('es-ES') : '';
      case 'datetime':
        return value ? new Date(value).toLocaleString('es-ES') : '';
      case 'number':
        return typeof value === 'number' ? value : parseFloat(value) || '';
      case 'boolean':
        return value ? 'Sí' : 'No';
      case 'array':
        return Array.isArray(value) ? value.join(', ') : value;
      case 'currency':
        return typeof value === 'number' ? value.toLocaleString('es-ES', { style: 'currency', currency: 'ARS' }) : value;
      default:
        return String(value);
    }
  };

  // Función para obtener el tipo de campo basado en la columna de DataGrid
  const getFieldType = (column, value) => {
    // Si la columna especifica un tipo
    if (column.type) return column.type;
    
    // Detectar tipo basado en el nombre del campo
    const fieldName = column.field.toLowerCase();
    if (fieldName.includes('date') || fieldName.includes('fecha')) return 'date';
    if (fieldName.includes('email')) return 'text';
    if (fieldName.includes('phone') || fieldName.includes('telefono')) return 'text';
    if (fieldName.includes('id') && typeof value === 'number') return 'number';
    if (fieldName.includes('cbu') || fieldName.includes('cuit')) return 'text';
    if (fieldName.includes('amount') || fieldName.includes('price') || fieldName.includes('precio')) return 'currency';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    
    return 'text';
  };

  // Función para procesar datos de DataGrid y renderCell personalizado
  const processRowData = (row, columns) => {
    const processedRow = {};
    
    columns.forEach(column => {
      if (column.field === 'actions') return; // Skip actions column
      
      let value = row[column.field];
      
      // Si la columna tiene renderCell, intentar extraer el valor procesado
      if (column.renderCell && typeof column.renderCell === 'function') {
        try {
          // Crear un objeto params simulado para renderCell
          const params = { 
            value, 
            row, 
            field: column.field,
            api: null,
            getValue: (id, field) => row[field]
          };
          
          // Intentar ejecutar renderCell y extraer texto plano
          const rendered = column.renderCell(params);
          
          // Si renderCell devuelve JSX, intentar extraer el texto
          if (rendered && typeof rendered === 'object') {
            if (rendered.props && rendered.props.children) {
              value = String(rendered.props.children);
            } else if (rendered.props && rendered.props.value) {
              value = rendered.props.value;
            }
          } else if (typeof rendered === 'string' || typeof rendered === 'number') {
            value = rendered;
          }
        } catch (error) {
          // Si renderCell falla, usar el valor original
          console.warn(`Error procesando componente renderCell para ${column.field}:`, error);
        }
      }
      
      const fieldType = getFieldType(column, value);
      processedRow[column.headerName || column.field] = formatCellValue(value, fieldType);
    });
    
    return processedRow;
  };

  // Función principal de exportación
  const exportToExcel = async (
    data, 
    columns, 
    filename, 
    options = {}
  ) => {
    try {
      setIsExporting(true);
      setExportProgress(0);

      const {
        sheetName = 'Datos',
        batchSize = 1000,
        includeFilters = true,
        customProcessing = null
      } = options;

      // Filtrar columnas visibles (excluir actions)
      const visibleColumns = columns.filter(col => 
        col.field !== 'actions' && 
        !col.hide &&
        col.headerName !== ''
      );

      let processedData = [];
      const totalRows = data.length;

      // Procesar datos en lotes para tablas grandes
      for (let i = 0; i < totalRows; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        
        const processedBatch = batch.map(row => {
          if (customProcessing) {
            return customProcessing(row, visibleColumns);
          }
          return processRowData(row, visibleColumns);
        });

        processedData = processedData.concat(processedBatch);
        
        // Actualizar progreso
        const progress = Math.min(((i + batchSize) / totalRows) * 80, 80);
        setExportProgress(progress);

        // Pequeña pausa para no bloquear la UI
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      setExportProgress(90);

      // Crear workbook y worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(processedData);

      // Configurar anchos de columna automáticamente
      const colWidths = visibleColumns.map(col => ({
        wch: Math.max(
          String(col.headerName || col.field).length,
          Math.max(...processedData.map(row => 
            String(row[col.headerName || col.field] || '').length
          )),
          10
        )
      }));
      ws['!cols'] = colWidths;

      // Agregar worksheet al workbook
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      setExportProgress(95);

      // Generar nombre de archivo con timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const finalFilename = `${filename}_${timestamp}.xlsx`;

      // Escribir archivo
      XLSX.writeFile(wb, finalFilename);

      setExportProgress(100);
      setSnackbarMessage(`Excel exportado exitosamente: ${finalFilename}`);

      return { success: true, filename: finalFilename };

    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setSnackbarErrorMessage(`Error al exportar: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportProgress(0), 2000);
    }
  };

  // Función específica para exportar DataGrid
  const exportDataGridToExcel = async (
    gridData,
    gridColumns,
    tableName,
    customOptions = {}
  ) => {
    const filename = `${tableName.toLowerCase().replace(/\s+/g, '_')}`;
    
    return await exportToExcel(
      gridData,
      gridColumns,
      filename,
      {
        sheetName: tableName,
        ...customOptions
      }
    );
  };

  // Función para exportar con datos personalizados (para casos especiales)
  const exportCustomData = async (
    customData,
    headers,
    filename,
    sheetName = 'Datos'
  ) => {
    try {
      setIsExporting(true);
      setExportProgress(50);

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(customData);

      // Configurar headers si se proporcionan
      if (headers && headers.length > 0) {
        XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' });
      }

      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const finalFilename = `${filename}_${timestamp}.xlsx`;

      setExportProgress(90);
      XLSX.writeFile(wb, finalFilename);
      setExportProgress(100);

      setSnackbarMessage(`Excel exportado exitosamente: ${finalFilename}`);
      return { success: true, filename: finalFilename };

    } catch (error) {
      console.error('Error exporting custom data to Excel:', error);
      setSnackbarErrorMessage(`Error al exportar: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportProgress(0), 2000);
    }
  };

  return {
    exportToExcel,
    exportDataGridToExcel,
    exportCustomData,
    isExporting,
    exportProgress,
    formatCellValue
  };
}; 