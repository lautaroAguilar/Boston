"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Stack,
  Button,
  Paper,
  Modal,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import {
  ApartmentRounded,
  ArrowDropDown,
  ArrowDropUp,
} from "@mui/icons-material";
import { useCompany } from "@/contexts/companies";
import { useDashboard } from "@/contexts/dashboard";
import FormStepper from "@/components/Stepper";
import OptionsButton from "@/components/OptionsButton";
import {
  companySchema,
  contactSchema,
  costCenterSchema,
  sectorSchema,
} from "../../../../schemas/companies";
import CONFIG from "../../../../config/api";
import { useRouter } from "next/navigation";
/**
 * ExpandableCell componente que permite expandir el campo si el texto es demasiado.
 *
 * @param {object} value - texto a renderizar obtenido desde la DDBB
 */

function ExpandableCell({ value }) {
  const [expanded, setExpanded] = React.useState(false);
  return (
    <Stack flexDirection={"row"} gap={1} alignItems={"center"}>
      {value && value.length > 10 && (
        <Button
          sx={{ height: 30, padding: 0, margin: 0, minWidth: 30 }}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ArrowDropUp /> : <ArrowDropDown />}
        </Button>
      )}
      {expanded
        ? value
        : value && value.length > 10
          ? `${value.slice(0, 10)}...`
          : value}
      &nbsp;
    </Stack>
  );
}

export default function Page() {
  const router = useRouter();
  const {
    companyCreated,
    setCompanyCreated,
    fetchCompaniesInfo,
    companies,
    errorMessage,
    setErrorMessage,
  } = useCompany();
  const {
    setToolbarButtonAction,
    setOpenSnackbar,
    snackbarMessage,
    snackbarErrorMessage,
    setSnackbarMessage,
    setSnackbarErrorMessage,
  } = useDashboard();
  const isMobile = useMediaQuery("(max-width:600px)");
  /* ESTADOS */
  const [showForm, setShowForm] = useState(false);
  const [formCompanyValues, setFormCompanyValues] = useState({
    name: "",
    cuit: "",
    business_name: "",
    first_survey_link: "",
    second_survey_link: "",
  });
  const [formCostCenterValues, setFormCostCenterValues] = useState({
    name: "",
  });
  const [formContactValues, setFormContactValues] = useState({
    name: "",
    email: "",
    notes: "",
  });
  const [formSectorValues, setFormSectorValues] = useState({
    name: "",
  });
  /* CASILLAS PARA EL COMPONENTE MY FORM */
  const fieldsCompany = [
    { name: "name", label: "Nombre", required: true },
    { name: "business_name", label: "Razón Social", required: true },
    { name: "cuit", label: "CUIT", required: true, type: "number" },
    { name: "first_survey_link", label: "Primer encuesta" },
    { name: "second_survey_link", label: "Segunda encuesta" },
  ];
  const fieldsCostCenter = [
    {
      name: "name",
      label: "Centro de costo",
    },
  ];
  const fieldsContact = [
    {
      name: "name",
      label: "Nombre",
    },
    {
      name: "email",
      label: "Email",
    },
    {
      name: "notes",
      label: "Notas",
    },
  ];
  const fieldsSector = [
    {
      name: "name",
      label: "Sector",
    },
  ];
  /* PASOS DEL STEPPER */
  const steps = [
    {
      label: "Datos de la Empresa",
      description: "Completa los datos principales de la empresa",
      schema: companySchema,
      fields: fieldsCompany,
      values: formCompanyValues,
      setValues: setFormCompanyValues,
      errorMessage: errorMessage,
    },
    {
      label: "Centro de Costo",
      description: "Agrega un Centro de Costo a la nueva empresa",
      schema: costCenterSchema,
      fields: fieldsCostCenter,
      values: formCostCenterValues,
      setValues: setFormCostCenterValues,
      errorMessage: errorMessage,
    },
    {
      label: "Sector",
      description: "Agrega un Sector a la nueva empresa",
      schema: sectorSchema,
      fields: fieldsSector,
      values: formSectorValues,
      setValues: setFormSectorValues,
      errorMessage: errorMessage,
    },
    {
      label: "Contacto",
      description: "Agrega un Contacto asociado a la nueva empresa",
      schema: contactSchema,
      fields: fieldsContact,
      values: formContactValues,
      setValues: setFormContactValues,
      errorMessage: errorMessage,
    },
  ];
  /* TRADUCIMOS A ESPAÑOL LA TABLA */
  const theme = createTheme(esES);
  function handleShowForm() {
    setShowForm(true);
    setErrorMessage(false);
  }
  /* FUNCION QUE SE EJECUTA AL FINAL PARA CREAR LA EMPRESA */
  async function handleFinish() {
    try {
      const res = await fetch(`${CONFIG.API_URL}/companies/fullCompany`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          companyData: formCompanyValues,
          contactData: formContactValues,
          costCenterData: formCostCenterValues,
          sectorData: formSectorValues,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSnackbarErrorMessage(data.error);
        return;
      }
      setSnackbarMessage("Empresa creada correctamente");
      setCompanyCreated(true);
      setShowForm(false);
      setFormCompanyValues({});
      setFormCostCenterValues({});
      setFormSectorValues({});
      setFormContactValues({});
      return data;
    } catch (error) {
      console.error("Error al crear entidades: ", error);
    }
  }
  /* LLAMAMOS A LAS EMPRESAS CON SU INFO + CC, SECTORES Y CONTACTOS */
  useEffect(() => {
    setToolbarButtonAction({
      label: "Crear nueva",
      action: handleShowForm,
      icon: <ApartmentRounded />,
    });
  }, [setToolbarButtonAction]);
  useEffect(() => {
    if (snackbarMessage || snackbarErrorMessage) {
      setOpenSnackbar(true);
    }
  }, [snackbarMessage, snackbarErrorMessage]);
  useEffect(() => {
    fetchCompaniesInfo();
  }, [companyCreated]);

  /* COLUMNAS PARA EL DATAGRID */
  const columns = [
    {
      field: "id",
      headerName: "ID",
      minWidth: 150,
      renderCell: (params) => <ExpandableCell {...params} />,
    },
    {
      field: "name",
      headerName: "Nombre",
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <Link
          href={`/empresas/${params.row.id}`}
          style={{
            textDecoration: "none",
            color: "inherit",
            textTransform: "uppercase",
          }}
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: "business_name",
      headerName: "Razón social",
      minWidth: 150,
      flex: 1,
    },
    { field: "cuit", headerName: "CUIT", minWidth: 150, flex: 1 },
    {
      field: "costCenters",
      headerName: "Centros de costo",
      minWidth: 150,
      flex: 1,
      renderCell: (params) => {
        const value =
          params.value?.success === true && params.value?.data?.length === 0
            ? params.value.message
            : params.value?.map((cc) => `- ${cc.cost_center_name}`).join("\n");

        return <ExpandableCell value={value} />;
      },
    },
    {
      field: "sectors",
      headerName: "Sectores",
      minWidth: 150,
      flex: 1,
      renderCell: (params) => {
        const value =
          params.value?.success === true && params.value?.data?.length === 0
            ? params.value.message
            : params.value?.map((s) => `- ${s.sector_name}`).join("\n");
        return <ExpandableCell value={value} />;
      },
    },
    {
      field: "actions",
      headerName: "",
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const handleView = (row) => {
          router.push(`/empresas/${row.id}`);
          // Implementar lógica para ver detalles
        };
        const options = [
          {
            label: "Ver detalle",
            onClick: handleView,
          },
          /* { 
        label: "Editar", 
        icon: <Edit fontSize="small" />, 
        onClick: handleEdit 
      },
      { 
        label: "Eliminar", 
        icon: <Delete fontSize="small" />, 
        onClick: handleDelete 
      }, */
        ];
        return <OptionsButton options={options} row={params.row} />;
      },
    },
  ];
  return (
    <Stack
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ThemeProvider theme={theme}>
        <DataGrid
          columns={columns}
          rows={companies}
          getEstimatedRowHeight={() => 100}
          getRowHeight={() => "auto"}
          sx={{
            width: "100%",
            "&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell": {
              py: 1,
            },
            "&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell": {
              py: "15px",
            },
            "&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell": {
              py: "22px",
            },
          }}
        />
      </ThemeProvider>
      <Modal
        open={showForm}
        onClose={() => {
          setShowForm(false);
        }}
        sx={{ height: "100%" }}
      >
        <Paper
          elevation={4}
          square={false}
          sx={{
            height: "80%",
            width: "100%",
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
          <Typography variant="h5">Crear nueva empresa</Typography>
          <FormStepper steps={steps} onFinish={handleFinish} />
        </Paper>
      </Modal>
    </Stack>
  );
}
