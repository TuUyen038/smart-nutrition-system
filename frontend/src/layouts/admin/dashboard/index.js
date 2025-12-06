import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { Card, Divider } from "@mui/material";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DefaultDoughnutChart from "examples/Charts/DoughnutCharts/DefaultDoughnutChart";
import LineChart from "examples/Charts/LineChart";

import AdminStatsCards from "./components/AdminStatsCards";
import TopRecipesTable from "./components/TopRecipesTable";

import adminDonutChartData from "./data/adminDonutChartData";
import adminUserLineChartData from "./data/adminUserLineChartData";

function AdminDashboard() {
  // Nếu sau này bạn dùng API thật, có thể dùng state cho data:
  const [donutData, setDonutData] = useState(adminDonutChartData);
  const [userLineData, setUserLineData] = useState(adminUserLineChartData);

  useEffect(() => {
    // TODO: gọi API thực tế ở đây, rồi setDonutData, setUserLineData
    // Ví dụ:
    // fetch("/api/admin/stats/recipes-by-category").then(...)
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Hàng card thống kê tổng quan */}
        <AdminStatsCards />

        {/* Hàng biểu đồ chính: tăng trưởng user + phân bố món ăn */}
        <MDBox mt={3}>
          <Grid container spacing={3}>
            {/* Line chart: tăng trưởng người dùng */}
            <Grid item xs={12} md={7} lg={8}>
              <Card sx={{ p: 3, height: "100%" }}>
                <LineChart
                  icon={{ color: "primary", component: "show_chart" }}
                  title="Tăng trưởng người dùng"
                  description="Số lượng người dùng mới theo từng tháng"
                  chart={userLineData}
                />
              </Card>
            </Grid>

            {/* Doughnut chart: phân bố loại món ăn */}
            <Grid item xs={12} md={5} lg={4}>
              <Card sx={{ p: 3, height: "100%" }}>
                <DefaultDoughnutChart
                  color="info"
                  title="Phân bố loại món ăn"
                  description="Tỉ lệ các nhóm món phổ biến trong hệ thống"
                  chart={donutData}
                />
              </Card>
            </Grid>
          </Grid>
        </MDBox>

        {/* Bảng top món ăn */}
        <MDBox mt={3}>
          <Card sx={{ p: 3 }}>
            <MDTypography variant="h6" color="dark" mb={2}>
              Top món ăn được sử dụng nhiều nhất
            </MDTypography>
            <Divider sx={{ mb: 2 }} />
            <TopRecipesTable />
          </Card>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default AdminDashboard;
