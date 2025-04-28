import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

/**
 * Componente de botón de opciones con menú desplegable
 * @param {Object} props 
 * @param {Array} props.options - Array de objetos con las opciones
 *   Cada opción debe tener: { label: string, icon: ReactNode, onClick: function, disabled: boolean (opcional) }
 * @param {Object} props.row - Datos de la fila (opcional, para pasar a la función onClick)
 * @returns {JSX.Element}
 */
export default function OptionsButton({ options, row }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleOptionClick = (onClick) => {
    return (event) => {
      event.stopPropagation();
      onClick(row);
      handleClose();
    };
  };

  return (
    <>
      <IconButton
        aria-label="opciones"
        aria-controls={open ? "options-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        size="small"
      >
        <MoreVertIcon />
      </IconButton>
      
      <Menu
        id="options-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {options.map((option, index) => (
          <MenuItem
            key={index}
            onClick={handleOptionClick(option.onClick)}
            disabled={option.disabled}
          >
            {option.icon && <ListItemIcon>{option.icon}</ListItemIcon>}
            <ListItemText>{option.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
} 