import { useEffect } from "react";

import Grid from "@mui/material/Grid";

import MDBox from "components/MDBox";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import { useMaterialUIController, setDirection } from "context";

function History() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>lich su an uong</MDBox>
    </DashboardLayout>
  );
}

export default History;
