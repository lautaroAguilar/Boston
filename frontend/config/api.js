const getApiBaseUrl = () => {
  // Detectar el entorno basado en la URL actual
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  // Comprobar si estamos en el ambiente de prueba o producción
  if (hostname.includes("sistema-test.bostoncelop.com.ar")) {
    return {
      API_URL: "https://api.sistema-test.bostoncelop.com.ar/api",
    };
  } else if (hostname.includes("sistema.bostoncelop.com.ar")) {
    return {
      API_URL: "https://api.sistema.bostoncelop.com.ar/api",
    };
  }

  // Fallback para desarrollo local
  return {
    API_URL: "http://localhost:3000/api",
  };
};
const CONFIG = getApiBaseUrl();

export default CONFIG;
