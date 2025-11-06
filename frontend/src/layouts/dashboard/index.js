import Grid from "@mui/material/Grid";

import MDBox from "components/MDBox";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DefaultDoughnutChart from "examples/Charts/DoughnutCharts/DefaultDoughnutChart";

import donutChartData from "./data/donutChartData";
import MDTypography from "components/MDTypography";
import DefaultInfoCard from "examples/Cards/InfoCards/DefaultInfoCard";
import { Card, Divider } from "@mui/material";
import MenuList from "./components/MenuList";
import LineChart from "examples/Charts/LineChart";
import lineChartData from "./data/lineChartData";
function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        
        <MDBox mt={0}>
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

        {/* Biểu đồ và nút hành động */}
          <Grid item xs={12} md={8} lg={8}>
            <Card sx={{ p: 3 }}>
              <LineChart
                icon={{ color: "primary", component: "show_chart" }}
                title="Lượng calo tiêu thụ trong tuần trước"
                description="Theo dõi năng lượng tiêu hao mỗi ngày trong một tuần qua"
                chart={lineChartData}
              />
              <Divider sx={{ my: 2 }} />
            </Card>
          </Grid>

      </MDBox>
    </DashboardLayout>
  );
}

export default Dashboard;
