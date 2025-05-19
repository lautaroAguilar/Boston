"use client";
import { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import CONFIG from "../../config/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const getUsers = async () => {
    try {
      const res = await fetch(`${CONFIG.API_URL}/user`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setSnackbarErrorMessage(data.message);
        return;
      }
      setUsers(data);
      return;
    } catch (error) {
      console.log("error al buscar usuarios", error);
    }
  };

  const checkUserSession = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${CONFIG.API_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401) {
        // Si recibimos 401, intentamos refrescar el token
        const refreshResult = await refreshToken();
        if (!refreshResult) {
          // Si el refresh falló, redirigimos a autenticación
          const currentPath = window.location.pathname;
          if (currentPath !== "/autenticacion") {
            router.push("/autenticacion");
          }
          return null;
        }

        return refreshResult;
      }

      const data = await res.json();
      setUser(data);

      if (data && data.userId) {
        await fetchUserInfo(data.userId);
      }
      return data;
    } catch (error) {
      console.log("Error comprobando sesión:", error);
      setUser(null);
      return null;
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
        return null;
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.log("Error al refrescar token:", error);
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
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const fetchUserInfo = async (id) => {
    try {
      const res = await fetch(`${CONFIG.API_URL}/user/${id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const errorMessage = await res.json();
        setErrorMessage(errorMessage.error);
        logout();
      }

      const userInfo = await res.json();

      setUserInfo(userInfo);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        userInfo,
        loading,
        logout,
        errorMessage,
        checkUserSession,
        refreshToken,
        users,
        setUsers,
        getUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
