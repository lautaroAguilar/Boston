"use client";
import { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import CONFIG from "../../config/api";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { useDashboard } from "@/contexts/dashboard";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { setSnackbarErrorMessage } = useDashboard();
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const getUsers = async () => {
    try {
      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/user`,
        {
          method: "GET",
        },
        refreshToken,
        logout
      );
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

  const createUser = async (userData) => {
    try {
      // Siempre establecemos is_temp_password en true para que se genere una contraseña automática
      const dataToSend = {
        ...userData,
        is_temp_password: true,
      };

      const response = await fetchWithAuth(
        `${CONFIG.API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        },
        refreshToken,
        logout
      );

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData };
      }

      const data = await response.json();
      await getUsers(); // Actualizamos la lista de usuarios

      return { success: true, data };
    } catch (err) {
      console.error("Error al registrar el usuario:", err);
      return {
        success: false,
        error: { message: "Error de conexión al registrar el usuario" },
      };
    }
  };

  const updateUserStatus = async (userId, isActive) => {
    try {
      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/user/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ active: isActive }),
        },
        refreshToken,
        logout
      );

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error al actualizar estado del usuario:", errorData);
        return false;
      }

      // Actualizar el estado local de usuarios
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, active: isActive } : user
        )
      );

      return true;
    } catch (error) {
      console.error("Error de red al actualizar estado del usuario:", error);
      return false;
    }
  };

  const checkUserSession = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/auth/me`,
        {
          method: "GET",
        },
        refreshToken,
        logout
      );

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
      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/user/${id}`,
        {
          method: "GET",
        },
        refreshToken,
        logout
      );
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

  const changePassword = async (currentPassword, newPassword) => {
    try {
      if (!user?.userId) {
        return { success: false, error: "Usuario no autenticado" };
      }

      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/password/change`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        },
        refreshToken,
        logout
      );

      if (!res.ok) {
        const errorData = await res.json();
        return { success: false, error: errorData.error };
      }
      const data = await res.json();
      return { success: true, message: data.message };
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
      return {
        success: false,
        error: "Error de conexión al cambiar la contraseña",
      };
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
        getUsers,
        updateUserStatus,
        createUser,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
