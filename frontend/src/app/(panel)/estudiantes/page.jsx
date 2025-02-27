"use client";
import React, { useEffect, useState } from "react";
import FormStepper from "@/components/Stepper";
import { Modal, Paper, Typography, Stack, useMediaQuery } from "@mui/material";
import { SchoolRounded } from "@mui/icons-material";
import { useDashboard } from "@/contexts/dashboard";
import { useStudent } from "@/contexts/students";
import { useCompany } from "@/contexts/companies";
import {
  studentStepOneSchema,
  studentStepTwoSchema,
} from "../../../../schemas/students";
export default function Page() {
  const { companyId, fetchCostCenters, fetchSectors, sectors, costCenters } =
    useCompany();
  const {
    setToolbarButtonAction,
    selectedCompany,
    fetchModules,
    fetchLanguages,
    fetchLevels,
    languages,
    levels,
    modules,
  } = useDashboard();
  const { student, createStudent } = useStudent();
  const isMobile = useMediaQuery("(max-width:600px)");
  /* ESTADOS */
  const [showForm, setShowForm] = useState(false);
  const [studentCreated, setStudentCreated] = useState(false);
  const [step1Values, setStep1Values] = useState({
    first_name: "",
    last_name: "",
    email: "",
    company_id: companyId, // Se asigna automáticamente
    cost_center_id: "",
    sector_id: "",
  });

  const [step2Values, setStep2Values] = useState({
    initial_leveling_date: "",
    language_id: "",
    module_id: "",
    level_id: "",
  });

  function handleShowForm() {
    setShowForm(true);
  }

  const steps = [
    {
      label: "Datos Personales",
      fields: [
        { name: "first_name", label: "Nombre" },
        { name: "last_name", label: "Apellido" },
        { name: "email", label: "Email", type: "email" },
        {
          name: "cost_center_id",
          label: "Centro de Costo",
          component: "select",
          options:
            Array.isArray(costCenters) && costCenters.length > 0
              ? costCenters.map((cc) => ({ id: cc.id, label: cc.name }))
              : [{ id: "no_cost_center", label: costCenters.message }],
        },
        {
          name: "sector_id",
          label: "Sector",
          component: "select",
          options:
            Array.isArray(sectors) && sectors.length > 0
              ? sectors.map((sector) => ({
                  id: sector.id,
                  label: sector.name,
                }))
              : [{ id: "no_sectors", label: sectors?.message }],
        },
      ],
      values: step1Values,
      setValues: setStep1Values,
      schema: studentStepOneSchema,
    },
    {
      label: "Detalles de Nivelación",
      fields: [
        {
          name: "initial_leveling_date",
          label: "Fecha de Nivelación",
          type: "date",
        },
        {
          name: "language_id",
          label: "Idioma",
          component: "select",
          options: languages.map((lang) => ({ id: lang.id, label: lang.name })),
        },
        {
          name: "module_id",
          label: "Módulo",
          component: "select",
          options: modules.map((mod) => ({ id: mod.id, label: mod.name })),
        },
        {
          name: "level_id",
          label: "Nivel",
          component: "select",
          options: levels.map((lvl) => ({ id: lvl.id, label: lvl.name })),
        },
      ],
      values: step2Values,
      setValues: setStep2Values,
      schema: studentStepTwoSchema,
    },
  ];
  const handleFinish = async () => {
    const studentData = {
      ...step1Values,
      ...step2Values,
    };
    await createStudent(studentData);
  };
  useEffect(() => {
    setToolbarButtonAction({
      label: "Crear nuevo",
      action: handleShowForm,
      icon: <SchoolRounded />,
    });
  }, [setToolbarButtonAction]);
  useEffect(() => {
    fetchCostCenters(selectedCompany);
    fetchSectors(selectedCompany);
    fetchModules();
    fetchLanguages();
    fetchLevels();
  }, [selectedCompany]);
  return (
    <Stack>
      <Typography>Welcome to estudiantes page in the dashboard!</Typography>
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
          <Typography variant="h5">Agregar nuevo alumno</Typography>
          <FormStepper steps={steps} onFinish={handleFinish} />
        </Paper>
      </Modal>
    </Stack>
  );
}
