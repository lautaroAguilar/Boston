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
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DeleteIcon from "@mui/icons-material/Delete";
import { useParams } from "next/navigation";
import { useCompany } from "@/contexts/companies";
import { useDashboard } from "@/contexts/dashboard";
import EditModal from "@/components/EditModal";
import DialogModal from "@/components/DialogModal";

export default function Page() {
  const { id } = useParams();
  const {
    fetchCompany,
    fetchCostCenters,
    fetchContacts,
    fetchSectors,
    updateCompany,
    deleteCompany,
    errorMessage,
    handleSubmitCostCenter,
    updateCostCenter,
    deleteCostCenter,
    handleSubmitContact,
    updateContact,
    deleteContact,
    handleSubmitSector,
    updateSector,
    deleteSector,
    updated,
  } = useCompany();
  const {
    setToolbarButtonAction,
    setOpenSnackbar,
    snackbarMessage,
    snackbarErrorMessage,
  } = useDashboard();
  const theme = useTheme();

  const [companyData, setCompanyData] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentModal, setCurrentModal] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

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
  /* CONFIGURACIONES PARA LOS MODALES DE EDITAR, AGREGAR Y ELIMINAR */
  const modalConfigs = {
    company: {
      title: "Editar Empresa",
      fields: [
        { name: "name", label: "Nombre" },
        { name: "business_name", label: "Razón Social" },
        { name: "cuit", label: "CUIT", type: "number" },
        { name: "sid", label: "SID" },
        { name: "survey_link", label: "Link de encuesta" },
      ],
      values: (companyData) => ({
        name: companyData?.name || "",
        business_name: companyData?.business_name || "",
        cuit: companyData?.CUIT || "",
        sid: companyData?.SID || "",
        survey_link: companyData?.survey_link || "",
      }),
      onSubmit: (data) => {
        updateCompany(data, id);
      },
      onDelete: async () => {
        await deleteCompany(companyData.id);
      },
      deleteTitle: "Eliminar Empresa",
      deleteMessage:
        "¿Estás seguro de que deseas eliminar esta empresa? Esta acción es irreversible.",
    },
    costCenter: {
      title: "Editar Centro de Costo",
      fields: [{ name: "name", label: "Centro de Costo" }],
      values: (companyData, index) => ({
        name: companyData?.costCenters[index]?.cost_center_name || "",
      }),
      onSubmit: async (data, index) => {
        const companyId = companyData?.id;
        const costCenterId = companyData?.costCenters[index]?.cost_center_id;
        if (!companyId || !costCenterId) {
          console.error("Error: No se encontró el ID del centro de costo.");
          return;
        }
        await updateCostCenter(data, companyId, costCenterId);
      },
      onDelete: async (index) => {
        const companyId = companyData?.id;
        const costCenterId = companyData?.costCenters[index]?.cost_center_id;
        if (!companyId || !costCenterId) {
          console.error("Error: No se encontró el ID del centro de costo.");
          return;
        }
        await deleteCostCenter(companyId, costCenterId);
      },
      deleteTitle: "Eliminar centro de costo",
      deleteMessage:
        "¿Estás seguro de que deseas eliminar este centro de costo? Esta acción es irreversible.",
    },
    addCostCenter: {
      title: "Agregar centro de costo",
      fields: [{ name: "name", label: "Nombre del centro de costo" }],
      values: () => ({
        name: "",
      }),
      onSubmit: async (data) => {
        const companyId = companyData?.id;
        if (!companyId) {
          console.error("Error: No se encontró el ID de la empresa.");
          return;
        }
        await handleSubmitCostCenter(data, companyId);
      },
    },
    contact: {
      title: "Editar Contacto",
      fields: [
        { name: "name", label: "Nombre de Contacto" },
        { name: "email", label: "Email de Contacto", type: "email" },
        { name: "notes", label: "Comentarios" },
      ],
      values: (companyData, index) => ({
        name: companyData?.contacts[index]?.contact_name || "",
        email: companyData?.contacts[index]?.contact_email || "",
        notes: companyData?.contacts[index]?.contact_notes || "",
      }),
      onSubmit: async (data, index) => {
        const companyId = companyData?.id;
        const contactId = companyData?.contacts[index]?.contact_id;
        if (!companyId || !contactId) {
          console.error("Error: No se encontró el ID del contacto.");
          return;
        }
        console.log("Datos a enviar:", data);
        await updateContact(data, companyId, contactId);
      },
      onDelete: async (index) => {
        const companyId = companyData?.id;
        const contactId = companyData?.contacts[index]?.contact_id;
        if (!companyId || !contactId) {
          console.error("Error: No se encontró el ID del contacto.");
          return;
        }
        await deleteContact(companyId, contactId);
      },
      deleteTitle: "Eliminar contacto",
      deleteMessage:
        "¿Estás seguro de que deseas eliminar este contacto? Esta acción es irreversible.",
    },
    addContact: {
      title: "Agregar Contacto",
      fields: [
        { name: "name", label: "Nombre de Contacto" },
        { name: "email", label: "Email de Contacto", type: "email" },
        { name: "notes", label: "Comentarios" },
      ],
      values: () => ({
        name: "",
        email: "",
        notes: "",
      }),
      onSubmit: async (data) => {
        const companyId = companyData?.id;
        if (!companyId) {
          console.error("Error: No se encontró el ID de la empresa.");
          return;
        }
        await handleSubmitContact(data, companyId);
      },
    },
    sector: {
      title: "Editar Sector",
      fields: [{ name: "name", label: "Sector" }],
      values: (companyData, index) => ({
        name: companyData?.sectors[index]?.sector_name || "",
      }),
      onSubmit: async (data, index) => {
        const companyId = companyData?.id;
        const sectorId = companyData?.sectors[index]?.sector_id;
        if (!companyId || !sectorId) {
          console.error("Error: No se encontró el ID del sector.");
          return;
        }
        await updateSector(data, companyId, sectorId);
      },
      onDelete: async (index) => {
        const companyId = companyData?.id;
        const sectorId = companyData?.sectors[index]?.sector_id;
        if (!companyId || !sectorId) {
          console.error("Error: No se encontró el ID del sector.");
          return;
        }
        await deleteSector(companyId, sectorId);
      },
      deleteTitle: "Eliminar sector",
      deleteMessage:
        "¿Estás seguro de que deseas eliminar este sector? Esta acción es irreversible.",
    },
    addSector: {
      title: "Agregar Sector",
      fields: [{ name: "name", label: "Nombre del Sector" }],
      values: () => ({
        name: "",
      }),
      onSubmit: async (data) => {
        const companyId = companyData?.id;
        if (!companyId) {
          console.error("Error: No se encontró el ID de la empresa.");
          return;
        }
        await handleSubmitSector(data, companyId);
      },
    },
  };
  const openDeleteModal = (type, index = null) => {
    setCurrentModal(type);
    setSelectedIndex(index);
    setOpenDeleteDialog(true);
  };
  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setSelectedIndex(null);
  };

  const handleConfirmDelete = async () => {
    if (modalConfigs[currentModal]?.onDelete) {
      if (selectedIndex !== null) {
        await modalConfigs[currentModal].onDelete(selectedIndex);
      } else {
        await modalConfigs[currentModal].onDelete();
      }
    }
    handleCancelDelete();
  };
  const openEditModal = (type, index = null) => {
    setCurrentModal(type);
    setSelectedIndex(index);
    setOpenEditDialog(true);
  };

  const closeEditModal = () => {
    setOpenEditDialog(false);
    setSelectedIndex(null);
  };
  useEffect(() => {
    getCompanyData(id);
  }, [updated]);

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
                  <Typography variant="h4" component="div">
                    {companyData?.name}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      color="error"
                      size="small"
                      onClick={() => openDeleteModal("company")}
                    >
                      ELIMINAR
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => openEditModal("company")}
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
                        : theme.palette.grey[200],
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
                        : theme.palette.grey[200],
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
                        : theme.palette.grey[200],
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
                        : theme.palette.grey[200],
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Centros de costo
                  </Typography>
                  <Stack spacing={1}>
                    {Array.isArray(companyData?.costCenters) ? (
                      companyData.costCenters.map((costCenter, index) => (
                        <Stack
                          key={index}
                          sx={{
                            minWidth: 350,
                            flex: true,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background:
                              theme.palette.mode === "dark"
                                ? theme.palette.grey[700]
                                : theme.palette.grey[300],
                            p: 1,
                            borderRadius: 1,
                          }}
                        >
                          <Typography key={index} variant="body1">
                            {costCenter.cost_center_name}
                          </Typography>
                          <Stack flexDirection={"row"}>
                            <Tooltip title="Editar">
                              <Button
                                onClick={() =>
                                  openEditModal("costCenter", index)
                                }
                                size="small"
                                sx={{ minWidth: "30px", minHeight: "30px" }}
                              >
                                <EditRoundedIcon />
                              </Button>
                            </Tooltip>
                            <Tooltip title="Agregar">
                              <Button
                                onClick={() =>
                                  openEditModal("addCostCenter", index)
                                }
                                size="small"
                                sx={{ minWidth: "30px", minHeight: "30px" }}
                                color="success"
                              >
                                <AddCircleOutlineRoundedIcon />
                              </Button>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <Button
                                onClick={() =>
                                  openDeleteModal("costCenter", index)
                                }
                                size="small"
                                sx={{ minWidth: "30px", minHeight: "30px" }}
                                color="error"
                              >
                                <DeleteOutlineRoundedIcon />
                              </Button>
                            </Tooltip>
                          </Stack>
                        </Stack>
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
                        : theme.palette.grey[200],
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Sectores
                  </Typography>
                  <Stack spacing={1}>
                    {Array.isArray(companyData?.sectors) ? (
                      companyData.sectors.map((sector, index) => (
                        <Stack
                          key={index}
                          sx={{
                            minWidth: 350,
                            flex: true,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background:
                              theme.palette.mode === "dark"
                                ? theme.palette.grey[700]
                                : theme.palette.grey[300],
                            p: 1,
                            borderRadius: 1,
                          }}
                        >
                          <Typography key={index} variant="body1">
                            {sector.sector_name}
                          </Typography>
                          <Stack flexDirection={"row"}>
                            <Tooltip title="Editar">
                              <Button
                                onClick={() => openEditModal("sector", index)}
                                size="small"
                                sx={{ minWidth: "30px", minHeight: "30px" }}
                              >
                                <EditRoundedIcon />
                              </Button>
                            </Tooltip>
                            <Tooltip title="Agregar">
                              <Button
                                onClick={() =>
                                  openEditModal("addSector", index)
                                }
                                size="small"
                                sx={{ minWidth: "30px", minHeight: "30px" }}
                                color="success"
                              >
                                <AddCircleOutlineRoundedIcon />
                              </Button>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <Button
                                onClick={() => openDeleteModal("sector", index)}
                                size="small"
                                sx={{ minWidth: "30px", minHeight: "30px" }}
                                color="error"
                              >
                                <DeleteOutlineRoundedIcon />
                              </Button>
                            </Tooltip>
                          </Stack>
                        </Stack>
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
                        : theme.palette.grey[200],
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Contactos
                  </Typography>
                  <Stack spacing={1}>
                    {Array.isArray(companyData?.contacts) ? (
                      companyData?.contacts.map((contact, index) => (
                        <Stack
                          key={index}
                          sx={{
                            minWidth: 350,
                            flex: true,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background:
                              theme.palette.mode === "dark"
                                ? theme.palette.grey[700]
                                : theme.palette.grey[300],
                            p: 1,
                            borderRadius: 1,
                          }}
                        >
                          <Box key={contact.contact_id}>
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
                          <Stack flexDirection={"row"}>
                            <Tooltip title="Editar">
                              <Button
                                onClick={() => openEditModal("contact", index)}
                                size="small"
                                sx={{ minWidth: "30px", minHeight: "30px" }}
                              >
                                <EditRoundedIcon />
                              </Button>
                            </Tooltip>
                            <Tooltip title="Agregar">
                              <Button
                                onClick={() =>
                                  openEditModal("addContact", index)
                                }
                                size="small"
                                sx={{ minWidth: "30px", minHeight: "30px" }}
                                color="success"
                              >
                                <AddCircleOutlineRoundedIcon />
                              </Button>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <Button
                                onClick={() =>
                                  openDeleteModal("contact", index)
                                }
                                size="small"
                                sx={{ minWidth: "30px", minHeight: "30px" }}
                                color="error"
                              >
                                <DeleteOutlineRoundedIcon />
                              </Button>
                            </Tooltip>
                          </Stack>
                        </Stack>
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
      {currentModal && (
        <EditModal
          isOpen={openEditDialog}
          onClose={closeEditModal}
          title={modalConfigs[currentModal].title}
          fields={modalConfigs[currentModal].fields}
          values={modalConfigs[currentModal].values(companyData, selectedIndex)}
          onSubmit={(data) =>
            modalConfigs[currentModal].onSubmit(data, selectedIndex)
          }
        />
      )}
      <DialogModal
        isOpen={openDeleteDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={modalConfigs[currentModal]?.deleteTitle || "Eliminar"}
        message={
          modalConfigs[currentModal]?.deleteMessage ||
          "¿Estás seguro de que deseas eliminar este elemento? Esta acción es irreversible."
        }
      />
    </>
  );
}
