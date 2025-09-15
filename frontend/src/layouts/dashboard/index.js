import Grid from "@mui/material/Grid";

import MDBox from "components/MDBox";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DefaultDoughnutChart from "examples/Charts/DoughnutCharts/DefaultDoughnutChart";

import donutChartData from "./data/donutChartData";
import MDTypography from "components/MDTypography";
import DefaultInfoCard from "examples/Cards/InfoCards/DefaultInfoCard";
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
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <DefaultDoughnutChart
                  color="info"
                  title="Tổng quan"
                  description="Last Campaign Performance"
                  chart={donutChartData}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={8}>
              <MDBox
                mb={3}
                borderRadius="lg"
                border="1px solid #eee"
                minWidth="100%"
                display="flex"
                flexDirection="column"
                justifyContent="flex-start"
              >
                <MDBox
                  p={2}
                  borderRadius="lg"
                  variant="gradient"
                  bgColor="white"
                  shadow="md"
                  minHeight="100%"
                >
                  <MDTypography variant="body1" fontSize="14px" color="dark">
                    Chu thich:
                  </MDTypography>
                  <MDTypography variant="body1" fontSize="14px" color="dark">
                    Chu thich:
                  </MDTypography>
                  <MDTypography variant="body1" fontSize="14px" color="dark">
                    Chu thich:
                  </MDTypography>
                  <MDTypography variant="body1" fontSize="14px" color="dark">
                    Chu thich:
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default Dashboard;
