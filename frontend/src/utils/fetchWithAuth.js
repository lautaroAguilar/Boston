import CONFIG from "../../config/api";

/**
 * Wrapper para fetch que maneja el refresh automático del token.
 * @param {string} url - URL de la petición
 * @param {object} options - Opciones de fetch
 * @param {function} refreshTokenFn - Función para refrescar el token (debe devolver true/false)
 * @param {function} logoutFn - Función para cerrar sesión si el refresh falla
 * @returns {Promise<Response>} - Respuesta de fetch
 */
export async function fetchWithAuth(url, options, refreshTokenFn, logoutFn) {
  let res = await fetch(url, options);

  if (res.status === 401) {
    // Intentar refrescar el token
    const refreshRes = await refreshTokenFn();
    if (!refreshRes) {
      // Si falla el refresh, cerrar sesión
      if (logoutFn) logoutFn();
      throw new Error("No autorizado");
    }
    // Reintentar la petición original
    res = await fetch(url, options);
  }

  return res;
} 