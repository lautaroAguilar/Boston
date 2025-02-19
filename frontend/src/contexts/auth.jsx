"use client";
import { createContext, useState, useEffect, useContext, use } from "react";
import { useRouter } from "next/navigation";
import CONFIG from "../../config/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const checkUserSession = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${CONFIG.API_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401) {
        return await refreshToken();
      }
      const data = await res.json();
      setUser(data);
      

      if (data && data.userId) {
        await fetchUserInfo(data.userId);
      }
    } catch (error) {
      console.error("Error comprobando sesión:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const res = await fetch(`${CONFIG.API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (res.status === 401 || res.status === 403) {
        setUser(null);
        
        router.push("/autenticacion");
        return null;
      }

      const data = await res.json();
      

      // Redirige a /inicio después de obtener el nuevo access_token
      const currentPath = window.location.pathname;

      // 🔹 Si el usuario está en autenticación o en "/", lo mandamos a inicio
      if (currentPath === "/autenticacion" || currentPath === "/") {
        router.push("/inicio");
      }
      return await checkUserSession();
    } catch (error) {
      console.error("Error al refrescar token:", error);
      setUser(null);
      logout();
      return null;
    }
  };
  const logout = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${CONFIG.API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const successMessage = res.json();
        
        setUser(null);
        router.push("/autenticacion");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const fetchUserInfo = async (id) => {
    try {
      const res = await fetch(`${CONFIG.API_URL}/user/${id}`, {
        credentials: "include",
      });
      if (res.status === 404) {
        const errorMessage = await res.json();
        setErrorMessage(errorMessage.error);
      }

      const userInfo = await res.json();
      
      setUserInfo(userInfo);
    } catch (error) {
      console.error(error);
    }
  };
  /* SE INTENTA REFRESCAR EL ACCESS_TOKEN AUTOMÁTICAMENTE */
  useEffect(() => {
    checkUserSession();
    const interval = setInterval(
      () => {
        refreshToken();
      },
      14 * 60 * 1000
    );
    return () => clearInterval(interval);
  }, []);
  return (
    <AuthContext.Provider
      value={{
        user,
        userInfo,
        loading,
        logout,
        errorMessage,
        checkUserSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
