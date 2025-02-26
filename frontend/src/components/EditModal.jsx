import { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import MyForm from "./Form";

export default function EditModal({
  isOpen,
  onClose,
  title,
  fields,
  values,
  onSubmit,
  errorMessage,
}) {
  const [formData, setFormData] = useState(values || {});

  useEffect(() => {
    setFormData(values || {});
  }, [values]);

  const handleChange = (fieldName, newValue) => {
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: newValue,
    }));
  };

  const handleSubmit = async () => {
    await onSubmit(formData);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <MyForm
          fields={fields}
          values={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          errorMessage={errorMessage}
        />
      </DialogContent>
      <DialogActions sx={{padding: 3}}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
