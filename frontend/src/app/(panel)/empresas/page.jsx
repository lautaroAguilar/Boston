"use client";
import React, { useEffect, useState } from "react";
import { Stack, Button, Paper, Modal, Typography } from "@mui/material";
import { useCompany } from "@/contexts/companies";
import { DataGrid } from "@mui/x-data-grid";
import {
  ApartmentRounded,
  ArrowDropDown,
  ArrowDropUp,
} from "@mui/icons-material";
import { useDashboard } from "@/contexts/dashboard";
import MyForm from "@/components/Form";
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
    field: "contacts",
    headerName: "Contactos",
    flex: 1,
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
  const { fetchCompaniesInfo, companies } = useCompany();
  const { setToolbarButtonAction } = useDashboard();
  const [showForm, setShowForm] = useState(false);
  const [formCompanyValues, setFormCompanyValues] = useState({
    name: "",
    cuit: "",
    business_name: "",
    sid: "",
    survey_link: "",
    cost_center: "",
  });
  const fieldsCompany = [
    [
      { name: "name", label: "Nombre", required: true },
      { name: "cuit", label: "CUIT", required: true },
      { name: "business_name", label: "Razón Social", required: true },
      { name: "sid", label: "SID" },
      { name: "survey_link", label: "Link de encuesta" },
    ],
    [
      {
        name: "cost_center",
        label: "Centro de costo",
        type: "text",
        required: true,
      },
    ],
  ];
  const handleChangeCompany = (fieldName, newValue) => {
    setFormCompanyValues((prev) => ({
      ...prev,
      [fieldName]: newValue,
    }));
  };
  function handleShowForm() {
    setShowForm(true);
  }
  function handleSubmitStepOne() {
    console.log(formCompanyValues, "step one");
    // Aquí puedes agregar lógica para validar los datos
    // Si todo está bien, devuelve true
    return true; // Asegúrate de que esto se ejecute si todo está correcto
  }
  function handleSubmitStepTwo() {
    console.log(formCompanyValues, "step two");
    return true;
  }
  /* LLAMAMOS A LAS EMPRESAS CON SU INFO + CC, SECTORES Y CONTACTOS */
  useEffect(() => {
    fetchCompaniesInfo();
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
      <Modal open={showForm} onClose={() => setShowForm(false)} sx={{height: "100%"}}>
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
            maxWidth: 500,
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
          <MyForm
            steps={["Paso 1", "Paso 2"]}
            fields={fieldsCompany}
            values={formCompanyValues}
            onChange={handleChangeCompany}
            handleSubmitPerStep={{
              "Paso 1": handleSubmitStepOne,
              "Paso 2": handleSubmitStepTwo,
            }}
            buttonText={"Crear empresa"}
          />
        </Paper>
      </Modal>
    </Stack>
  );
}
