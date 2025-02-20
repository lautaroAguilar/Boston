"use client";
import React, { useEffect, useState } from "react";
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
import {
  companySchema,
  contactSchema,
  costCenterSchema,
  sectorSchema,
} from "../../../../schemas/companies";

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
/* COLUMNAS PARA EL DATAGRID */
const columns = [
  {
    field: "id",
    headerName: "ID",
    width: 150,
    renderCell: (params) => <ExpandableCell {...params} />,
  },
  { field: "name", headerName: "Nombre", width: 150 },
  { field: "SID", headerName: "SID", width: 150 },
  { field: "business_name", headerName: "Razón social", width: 150 },
  {
    field: "costCenters",
    headerName: "Centros de costo",
    width: 150,
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
    width: 150,
    renderCell: (params) => {
      const value =
        params.value?.success === true && params.value?.data?.length === 0
          ? params.value.message
          : params.value?.map((s) => `- ${s.sector_name}`).join("\n");
      return <ExpandableCell value={value} />;
    },
  },
  {
    field: "contacts",
    headerName: "Contactos",
    width: 150,
    renderCell: (params) => {
      const value =
        params.value?.success === true && params.value?.data?.length === 0
          ? params.value.message
          : params.value
              ?.map(
                (c) =>
                  `- ${c.contact_name} (${c.contact_email}) ${c.contact_notes}`
              )
              .join("\n");
      return <ExpandableCell value={value} />;
    },
  },
];
export default function Page() {
  const {
    companies,
    handleSubmitCompany,
    handleSubmitCostCenter,
    handleSubmitContact,
    handleSubmitSector,
    errorMessage,
    setErrorMessage,
  } = useCompany();
  const { setToolbarButtonAction } = useDashboard();
  const isMobile = useMediaQuery("(max-width:600px)");
  /* ESTADOS */
  const [showForm, setShowForm] = useState(false);
  const [formCompanyValues, setFormCompanyValues] = useState({
    name: "",
    cuit: "",
    business_name: "",
    sid: "",
    survey_link: "",
  });
  const [formCostCenterValues, setFormCostCenterValues] = useState({
    name: "",
  });
  const [formContactValues, setFormContactValues] = useState({
    name: "",
    email: "",
    notes: "",
  });
  const [formSectorValues, setFormSectorValues] = useState({ name: "" });
  /* CASILLAS PARA EL COMPONENTE MY FORM */
  const fieldsCompany = [
    { name: "name", label: "Nombre", required: true },
    { name: "cuit", label: "CUIT", required: true, type: "number" },
    { name: "business_name", label: "Razón Social", required: true },
    { name: "sid", label: "SID" },
    { name: "survey_link", label: "Link de encuesta" },
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
      const companyRes = await handleSubmitCompany(formCompanyValues);
      const newCompanyId = companyRes?.id;
      await Promise.all([
        handleSubmitCostCenter(formCostCenterValues, newCompanyId),
        handleSubmitSector(formSectorValues, newCompanyId),
        handleSubmitContact(formContactValues, newCompanyId),
      ]);
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
          /* slots={{ toolbar: GridToolbar }} */
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
