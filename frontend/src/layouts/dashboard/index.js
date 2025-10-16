import Grid from "@mui/material/Grid";

import MDBox from "components/MDBox";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DefaultDoughnutChart from "examples/Charts/DoughnutCharts/DefaultDoughnutChart";

import donutChartData from "./data/donutChartData";
import MDTypography from "components/MDTypography";
import DefaultInfoCard from "examples/Cards/InfoCards/DefaultInfoCard";
import { Card } from "@mui/material";
import MenuList from "./components/MenuList";
function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5} style={{ cursor: "pointer" }}>
              <DefaultInfoCard
                color="primary"
                icon="fastfood"
                title="Nhận diện món ăn"
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Just updated",
                }}
                onClick={() => navigate("/detect-food")}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5} style={{ cursor: "pointer" }}>
              <DefaultInfoCard
                color="primary"
                icon="receipt_long"
                title="Phân tích công thức"
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Just updated",
                }}
                onClick={() => navigate("/analyze-recipe")}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5} style={{ cursor: "pointer" }}>
              <DefaultInfoCard
                color="primary"
                icon="auto_awesome"
                title="Gợi ý thực đơn"
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Just updated",
                }}
                onClick={() => navigate("/recommendation")}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5} style={{ cursor: "pointer" }}>
              <DefaultInfoCard
                color="primary"
                icon="history"
                title="Lịch sử ăn uống"
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Just updated",
                }}
                onClick={() => navigate("/history")}
              />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox mt={4.5}>
          <Grid container spacing={3} alignItems="stretch">
            {/* Chart bên trái */}
            <Grid item xs={12} md={5} lg={4}>
              <MDBox mb={3} height="100%">
                <DefaultDoughnutChart
                  color="info"
                  title="Tổng quan"
                  description="Dinh dưỡng đã nạp trong hôm nay"
                  chart={donutChartData}
                />
              </MDBox>
            </Grid>

            {/* Thông tin chi tiết bên phải */}
            <Grid item xs={12} md={7} lg={8}>
              <Card sx={{ p: 3, height: "calc( 100% - 1.5rem) " }} mb={3} height="100%">
                <MDTypography variant="h6" color="dark" mb={0.5}>
                  Thực đơn hôm nay
                </MDTypography>
                <MenuList />
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default Dashboard;
