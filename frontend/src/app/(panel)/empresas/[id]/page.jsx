"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  Stack,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useParams, useRouter } from "next/navigation";
import { useCompany } from "@/contexts/companies";
import CONFIG from "../../../../../config/api";
import { useDashboard } from "@/contexts/dashboard";

export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  const {
    fetchCompany,
    fetchCostCenters,
    fetchContacts,
    fetchSectors,
    errorMessage,
  } = useCompany();
  const {
    setToolbarButtonAction,
    setOpenSnackbar,
    setSnackbarMessage,
    snackbarMessage,
    snackbarErrorMessage,
    setSnackbarErrorMessage,
  } = useDashboard();
  const [companyData, setCompanyData] = useState(null);
  
  const theme = useTheme();

  const [openDialog, setOpenDialog] = useState(false);

  async function getCompanyData(id) {
    try {
      const company = await fetchCompany(id);
      const costCenters = await fetchCostCenters(id);
      const contacts = await fetchContacts(id);
      const sectors = await fetchSectors(id);

      const data = {
        ...company,
        costCenters,
        contacts,
        sectors,
      };

      console.log(data);
      setCompanyData(data);
    } catch (error) {
      console.error("Error fetching company data:", error);
    }
  }
  async function deleteCompany(id) {
    try {
      const res = await fetch(`${CONFIG.API_URL}/companies/${id}`, {
        method: "delete",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setSnackbarErrorMessage(data.error);
      }
      setSnackbarMessage(data.message);
      router.replace("/empresas");
    } catch (error) {
      console.error("error al eliminar empresa", error);
      /* setErrorMessage(data.error); */
    }
  }

  const handleDeleteClick = () => {
    setOpenDialog(true);
  };

  const handleConfirmDelete = () => {
    setOpenDialog(false);
    deleteCompany(id);
  };

  const handleCancelDelete = () => {
    setOpenDialog(false);
  };

  useEffect(() => {
    getCompanyData(id);
  }, []);

  useEffect(() => {
    if (snackbarMessage || snackbarErrorMessage) {
      setOpenSnackbar(true);
    }
  }, [snackbarMessage, snackbarErrorMessage]);
  useEffect(() => {
    setToolbarButtonAction(null);
  }, [setToolbarButtonAction]);

  return (
    <>
      <Card
        sx={{
          maxWidth: 1200,
          width: "100%",
          p: 2,
          backgroundColor:
            theme.palette.mode === "dark"
              ? theme.palette.grey[900]
              : theme.palette.grey[50],
          border: `1px solid ${
            theme.palette.mode === "dark"
              ? theme.palette.grey[800]
              : theme.palette.grey[300]
          },`,
        }}
        elevation={0}
      >
        {companyData?.error ? (
          "No se encontró la empresa"
        ) : (
          <>
            <CardHeader
              title={
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6" component="div">
                    {companyData?.name}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      color="error"
                      size="small"
                      onClick={handleDeleteClick}
                    >
                      ELIMINAR
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      size="small"
                    >
                      EDITAR
                    </Button>
                  </Stack>
                </Box>
              }
            />
            <CardContent>
              <Stack spacing={2}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  sx={{
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? theme.palette.grey[800]
                        : theme.palette.grey[300],
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    CUIT
                  </Typography>
                  <Typography variant="body1">{companyData?.CUIT}</Typography>
                </Box>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  sx={{
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? theme.palette.grey[800]
                        : theme.palette.grey[300],
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Centros de costo
                  </Typography>
                  <Stack alignItems="flex-end">
                    {Array.isArray(companyData?.costCenters) ? (
                      companyData.costCenters.map((costCenter, index) => (
                        <Typography key={index} variant="body1">
                          {costCenter.cost_center_name}
                        </Typography>
                      ))
                    ) : (
                      <Typography variant="body1" color="text.secondary">
                        No se encontraron centros de costo
                      </Typography>
                    )}
                  </Stack>
                </Box>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  sx={{
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? theme.palette.grey[800]
                        : theme.palette.grey[300],
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Sectores
                  </Typography>
                  <Stack alignItems="flex-end">
                    {Array.isArray(companyData?.sectors) ? (
                      companyData.sectors.map((sector, index) => (
                        <Typography key={index} variant="body1">
                          {sector.sector_name}
                        </Typography>
                      ))
                    ) : (
                      <Typography variant="body1" color="text.secondary">
                        No se encontraron sectores
                      </Typography>
                    )}
                  </Stack>
                </Box>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  sx={{
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? theme.palette.grey[800]
                        : theme.palette.grey[300],
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Razón social
                  </Typography>
                  <Typography variant="body1">
                    {companyData?.business_name}
                  </Typography>
                </Box>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  sx={{
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? theme.palette.grey[800]
                        : theme.palette.grey[300],
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    SID
                  </Typography>
                  <Typography variant="body1">{companyData?.SID}</Typography>
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  sx={{
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? theme.palette.grey[800]
                        : theme.palette.grey[300],
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Contactos
                  </Typography>
                  <Stack alignItems="flex-end">
                    {Array.isArray(companyData?.contacts) ? (
                      companyData?.contacts.map((contact) => (
                        <Box
                          key={contact.contact_id}
                          sx={{
                            width: "auto",
                            p: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <Typography variant="body1">
                            {contact.contact_name}
                          </Typography>
                          <Typography variant="body2">
                            {contact.contact_email}
                          </Typography>
                          <Typography variant="body2">
                            {contact.contact_notes}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body1" color="text.secondary">
                        No se encontraron contactos
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </>
        )}
      </Card>
      <Dialog open={openDialog} onClose={handleCancelDelete} sx={{}}>
        <DialogTitle>Eliminar empresa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar esta empresa? Esta acción es
            irreversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
