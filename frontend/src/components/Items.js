import {
  HomeRounded,
  SchoolRounded,
  GroupRounded,
  Diversity3Rounded,
  CalendarMonthRounded,
  ApartmentRounded,
} from "@mui/icons-material";

const NAVIGATION = [
  {
    segment: "",
    title: "Inicio",
    icon: <HomeRounded />,
  },
  {
    segment: "estudiantes",
    title: "Estudiantes",
    icon: <SchoolRounded />,
  },
  {
    segment: "docentes",
    title: "Docentes",
    icon: <GroupRounded />,
  },
  {
    segment: "grupos",
    title: "Grupos",
    icon: <Diversity3Rounded />,
  },
  {
    segment: "cronograma",
    title: "Cronograma",
    icon: <CalendarMonthRounded />,
  },
  {
    segment: "empresas",
    title: "Empresas",
    icon: <ApartmentRounded />,
  },
];
export default NAVIGATION;
