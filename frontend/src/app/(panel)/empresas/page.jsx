"use client";
import React, { useEffect } from "react";
import { Stack, Button } from "@mui/material";
import { useCompany } from "@/contexts/companies";
import { DataGrid } from "@mui/x-data-grid";
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";
export default function Page() {
  const { fetchCompaniesInfo, companies } = useCompany();
  /* COMPONENTE PARA EXPANDIR CELDA CUANDO HAY MUCHA INFORMACIÓN */
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

  /* LLAMAMOS A LAS EMPRESAS CON SU INFO + CC, SECTORES Y CONTACTOS */
  useEffect(() => {
    fetchCompaniesInfo();
  }, []);
  return (
    <Stack
      sx={{
        height: "100%",
        width: "100%",
      }}
    >
      <DataGrid
        columns={columns}
        rows={companies}
        getEstimatedRowHeight={() => 100}
        getRowHeight={() => "auto"}
        /* slots={{ toolbar: GridToolbar }} */
        sx={{
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
    </Stack>
  );
}
