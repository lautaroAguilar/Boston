"use client";
import { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  Divider,
} from "@mui/material";
import { useAuth } from "@/contexts/auth";
import { useDashboard } from "@/contexts/dashboard";
import {
  LogoutOutlined,
  LockOutlined,
  LockResetOutlined,
  PersonOutlined,
} from "@mui/icons-material";

export default function AccountMenu() {
  const { userInfo, logout } = useAuth();
  const { roles, fetchRoles } = useDashboard();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (!roles || roles.length === 0) {
      fetchRoles();
    }
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const handleChangePassword = () => {
    // Implementar lógica para cambiar contraseña
    handleClose();
  };

  const handleResetPassword = () => {
    // Implementar lógica para resetear contraseña
    handleClose();
  };

  const handleProfile = () => {
    // Implementar lógica para ver perfil
    handleClose();
  };

  if (!userInfo) {
    return null;
  }

  // Obtener iniciales para el avatar
  const getInitials = () => {
    if (!userInfo.first_name) return "?";
    return userInfo.first_name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Obtener el nombre del rol basado en el role_id
  const getRoleName = () => {
    if (!userInfo?.role_id || !roles || roles.length === 0) return "Usuario";

    const userRole = roles.find((role) => role.id === userInfo.role_id);
    return userRole ? userRole.name : "Usuario";
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
      <Tooltip title="Cuenta">
        <IconButton
          onClick={handleClick}
          size="small"
          aria-controls={open ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
            {getInitials()}
          </Avatar>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        sx={{
          "& .MuiPaper-root": {
            minWidth: 220,
            padding: 0,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {userInfo.first_name} {userInfo.last_name || ""}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {userInfo.email}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.5 }}
          >
            {getRoleName()}
          </Typography>
        </Box>

        <Divider />

        {/* <MenuItem onClick={handleProfile} sx={{gap: 1}}>
          <PersonOutlined color="info" fontSize="small" />
          <Typography variant="body2">
            Mi perfil
          </Typography>
        </MenuItem>
        
        <MenuItem onClick={handleChangePassword} sx={{gap: 1}}>
          <LockOutlined color="primary" fontSize="small" />
          <Typography variant="body2">
            Cambiar contraseña
          </Typography>
        </MenuItem>
        
        <MenuItem onClick={handleResetPassword} sx={{gap: 1}}>
          <LockResetOutlined color="warning" fontSize="small" />
          <Typography variant="body2">
            Restablecer contraseña
          </Typography>
        </MenuItem>
        
        <Divider />
         */}
        <MenuItem onClick={handleLogout} sx={{ gap: 1 }}>
          <LogoutOutlined color="error" fontSize="small" />
          <Typography variant="body2">Cerrar sesión</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
}
