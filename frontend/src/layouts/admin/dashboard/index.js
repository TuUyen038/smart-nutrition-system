import { useEffect, useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import { Card, Divider, CircularProgress, Box } from "@mui/material";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DefaultDoughnutChart from "examples/Charts/DoughnutCharts/DefaultDoughnutChart";
import LineChart from "examples/Charts/LineChart";

import AdminStatsCards from "./components/AdminStatsCards";
import TopRecipesTable from "./components/TopRecipesTable";

import { getDashboardStats } from "services/adminStatsApi";
import { useToast } from "context/ToastContext";

function AdminDashboard() {
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [donutData, setDonutData] = useState(null);
  const [userLineData, setUserLineData] = useState(null);
  const [topRecipes, setTopRecipes] = useState([]);

  const [isInitialLoad, setIsInitialLoad] = useState(true); // Chỉ dùng cho lần đầu
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data.stats);
        
        // Format data cho donut chart
        setDonutData({
          labels: data.recipeDistribution.labels,
          datasets: {
            label: "Số công thức",
            data: data.recipeDistribution.data,
          },
        });

        // Format data cho line chart
        setUserLineData({
          labels: data.userGrowth.labels,
          datasets: [
            {
              label: "Người dùng mới",
              data: data.userGrowth.data,
            },
          ],
        });

        setTopRecipes(data.topRecipes || []);
      } catch (err) {
        showError(err.message);
      } finally {
        setLoading(false);
        setIsInitialLoad(false); // Kết thúc lần load đầu tiên
      }
    };

    fetchData();
  }, []);

  const memoizedLineData = useMemo(() => userLineData, [userLineData]);
const memoizedDonutData = useMemo(() => donutData, [donutData]);

const lineChartComponent = useMemo(() => {
    if (!userLineData) return null;
    return (
      <LineChart
                  icon={{ color: "primary", component: "show_chart" }}
        title="Tăng trưởng người dùng"
        description="Số lượng người dùng mới theo từng tháng"
        chart={userLineData}
        chartOptions={{
                    beginAtZero: true,
                    yAxisLabel: "",
                  }}
      />
    );
  }, [userLineData]); // Chỉ re-render khi userLineData thay đổi

  const donutChartComponent = useMemo(() => {
    if (!donutData) return null;
    return (
      <DefaultDoughnutChart
        color="info"
        title="Phân bố loại món ăn"
        description="Tỉ lệ các nhóm món phổ biến trong hệ thống"
        chart={donutData}
      />
    );
  }, [donutData]);
  if (loading && isInitialLoad) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress />
          </Box>
        </MDBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Hàng card thống kê tổng quan */}
        <AdminStatsCards stats={stats} />

        {/* Hàng biểu đồ chính: tăng trưởng user + phân bố món ăn */}
        <MDBox mt={3}>
          <Grid container spacing={3}>
            {/* Line chart: tăng trưởng người dùng */}
            <Grid item xs={12} md={7} lg={8}>
              <Card sx={{ p: 3, height: "100%" }}>
                {lineChartComponent}
              </Card>
            </Grid>

            {/* Doughnut chart: phân bố loại món ăn */}
            <Grid item xs={12} md={5} lg={4}>
              <Card sx={{ p: 3, height: "100%" }}>
                {donutChartComponent}
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
            <TopRecipesTable topRecipes={topRecipes} />
          </Card>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default AdminDashboard;
