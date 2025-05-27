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
  Modal,
  Paper,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";
import { useAuth } from "@/contexts/auth";
import { useDashboard } from "@/contexts/dashboard";
import {
  LogoutOutlined,
  LockOutlined,
  LockResetOutlined,
  PersonOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useMediaQuery } from "@mui/material";
export default function AccountMenu() {
  const isMobile = useMediaQuery("(max-width: 600px)");
  const { userInfo, logout, changePassword } = useAuth();
  const {
    roles,
    fetchRoles,
    setSnackbarErrorMessage,
    setSnackbarMessage,
  } = useDashboard();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});
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
    setOpenPasswordDialog(true);
    handleClose();
  };

  const handleClosePasswordDialog = () => {
    setOpenPasswordDialog(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setFormErrors({});
  };

  const validatePasswordForm = () => {
    const errors = {};
    if (!passwordForm.currentPassword) {
      errors.currentPassword = "La contraseña actual es requerida";
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = "La nueva contraseña es requerida";
    } else {
      // Validar longitud mínima
      if (passwordForm.newPassword.length < 8) {
        errors.newPassword = "La contraseña debe tener al menos 8 caracteres";
      }
      
      // Validar que contenga al menos una mayúscula, una minúscula y un número
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
      if (!passwordRegex.test(passwordForm.newPassword)) {
        errors.newPassword = "La contraseña debe contener al menos una mayúscula, una minúscula y un número";
      }
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "La confirmación de contraseña es requerida";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }

    return errors;
  };

  const handleSubmitPasswordChange = async () => {
    const errors = validatePasswordForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const result = await changePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword
    );

    if (result.success) {
      setSnackbarMessage("Contraseña actualizada exitosamente");
      handleClosePasswordDialog();
    } else {
      setSnackbarErrorMessage(result.error || "Error al cambiar la contraseña");
    }
  };

  const handlePasswordFormChange = (field) => (event) => {
    setPasswordForm({
      ...passwordForm,
      [field]: event.target.value,
    });
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: null,
      });
    }
  };

  const handleTogglePasswordVisibility = (field) => () => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
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
    <>
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
          
          
          <MenuItem onClick={handleResetPassword} sx={{gap: 1}}>
          <LockResetOutlined color="warning" fontSize="small" />
          <Typography variant="body2">
          Restablecer contraseña
          </Typography>
          </MenuItem>
          
          <Divider />
          */}
          <MenuItem onClick={handleChangePassword} sx={{ gap: 1 }}>
            <LockOutlined color="primary" fontSize="small" />
            <Typography variant="body2">Cambiar contraseña</Typography>
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ gap: 1 }}>
            <LogoutOutlined color="error" fontSize="small" />
            <Typography variant="body2">Cerrar sesión</Typography>
          </MenuItem>
        </Menu>
      </Box>

      <Modal
        open={openPasswordDialog}
        onClose={handleClosePasswordDialog}
        sx={{ height: "100%" }}
      >
        <Paper
          elevation={4}
          square={false}
          sx={{
            height: "auto",
            display: "flex",
            flexDirection: "column",
            p: 2,
            gap: 2,
            width: isMobile ? "90%" : "50%",
            maxWidth: 650,
            maxHeight: 600,
            overflowY: "auto",
            scrollbarWidth: "thin",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Typography variant="h5">Cambiar Contraseña</Typography>
          <Stack spacing={2}>
            <TextField
              label="Contraseña actual"
              type={showPasswords.currentPassword ? "text" : "password"}
              fullWidth
              value={passwordForm.currentPassword}
              onChange={handlePasswordFormChange("currentPassword")}
              error={!!formErrors.currentPassword}
              helperText={formErrors.currentPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility("currentPassword")}
                      edge="end"
                    >
                      {showPasswords.currentPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Nueva contraseña"
              type={showPasswords.newPassword ? "text" : "password"}
              fullWidth
              value={passwordForm.newPassword}
              onChange={handlePasswordFormChange("newPassword")}
              error={!!formErrors.newPassword}
              helperText={formErrors.newPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility("newPassword")}
                      edge="end"
                    >
                      {showPasswords.newPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirmar nueva contraseña"
              type={showPasswords.confirmPassword ? "text" : "password"}
              fullWidth
              value={passwordForm.confirmPassword}
              onChange={handlePasswordFormChange("confirmPassword")}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility("confirmPassword")}
                      edge="end"
                    >
                      {showPasswords.confirmPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button onClick={handleClosePasswordDialog}>Cancelar</Button>
            <Button onClick={handleSubmitPasswordChange} variant="contained">
              Cambiar Contraseña
            </Button>
          </Stack>
        </Paper>
      </Modal>
    </>
  );
}
