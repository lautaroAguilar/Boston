import moment from 'moment';
import 'moment/locale/es';

// Configurar momento para usar español
moment.locale('es');

/**
 * Formatea una fecha para enviar a la API (YYYY-MM-DD)
 * @param {moment.Moment|Date} date - Objeto Date o Moment
 * @returns {string} Fecha formateada como YYYY-MM-DD
 */
export const formatDateForAPI = (date) => {
  // Asegurarse de que la fecha esté en formato YYYY-MM-DD
  return moment(date).format('YYYY-MM-DD');
};

/**
 * Formatea una hora para enviar a la API (HH:mm)
 * @param {moment.Moment|Date} time - Objeto Date o Moment
 * @returns {string} Hora formateada como HH:mm
 */
export const formatTimeForAPI = (time) => {
  // Asegurarse de que la hora esté en formato HH:mm
  return moment(time, 'HH:mm').format('HH:mm');
};

/**
 * Formatea una fecha en formato DD/MM/YYYY sin ajustar la zona horaria
 * @param {string|moment.Moment|Date|Object} date - Fecha en cualquier formato válido o params del DataGrid
 * @returns {string} Fecha formateada como DD/MM/YYYY
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  
  try {
    // Si estamos recibiendo un objeto params del DataGrid, extraer el valor
    const actualDate = date.value !== undefined ? date.value : date;
    
    // Usar moment.utc para evitar ajustes de zona horaria
    const momentDate = moment.utc(actualDate);
    if (!momentDate.isValid()) return 'N/A';
    
    return momentDate.format('DD/MM/YYYY');
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'N/A';
  }
};

/**
 * Formatea una hora en formato HH:mm
 * @param {string|moment.Moment|Date|Object} time - Hora en cualquier formato válido o params del DataGrid
 * @returns {string} Hora formateada como HH:mm
 */
export const formatTime = (time) => {
  if (!time) return 'N/A';
  
  try {
    // Si estamos recibiendo un objeto params del DataGrid, extraer el valor
    const actualTime = time.value !== undefined ? time.value : time;
    
    // Si es null o undefined, retornar N/A
    if (actualTime === null || actualTime === undefined) return 'N/A';
    
    // Si ya viene en formato HH:mm o HH:mm:ss, simplemente extraer HH:mm
    if (typeof actualTime === 'string') {
      // Formato HH:mm:ss
      if (/^\d{1,2}:\d{2}:\d{2}$/.test(actualTime)) {
        return actualTime.substring(0, actualTime.lastIndexOf(':'));
      }
      // Formato HH:mm
      if (/^\d{1,2}:\d{2}$/.test(actualTime)) {
        return actualTime;
      }
    }
    
    // Intentar convertir con moment
    const momentTime = moment(actualTime);
    if (!momentTime.isValid()) return 'N/A';
    
    return momentTime.format('HH:mm');
  } catch (error) {
    console.error('Error al formatear hora:', error);
    return 'N/A';
  }
};


/**
 * Convierte duración en horas a formato legible (X hs o X hs Y min)
 * @param {number|Object} durationInHours - Duración en horas o params del DataGrid
 * @returns {string} Duración formateada
 */
export const formatDuration = (durationInHours) => {
  // Si estamos recibiendo un objeto params del DataGrid, extraer el valor
  const actualDuration = durationInHours && durationInHours.value !== undefined 
    ? durationInHours.value 
    : durationInHours;
    
  if (actualDuration === undefined || actualDuration === null) return 'N/A';
  
  // Si es un número, formatearlo correctamente
  if (typeof actualDuration === 'number') {
    // Separar horas y minutos
    const hours = Math.floor(actualDuration);
    const minutes = Math.round((actualDuration - hours) * 60);
    
    if (minutes === 0) {
      return `${hours} hs`;
    } else if (hours === 0) {
      return `${minutes} min`;
    } else {
      return `${hours} hs ${minutes} min`;
    }
  }
  
  return `${actualDuration} hs`;
}; 