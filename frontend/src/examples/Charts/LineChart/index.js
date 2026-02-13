import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
} from "chart.js";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

// Material Dashboard components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Configs
import configs from "./configs";

// Đăng ký các thành phần cần thiết cho chart.js
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Legend, Tooltip);

function LineChart({ icon, title, description, height, chart, chartOptions }) {
  // Kiểm tra xem có dữ liệu không (tất cả giá trị = 0 hoặc không có data)
  const datasets = chart.datasets || [];
  const allData = datasets.flatMap((ds) => ds.data || []);
  const hasData = allData.some((value) => value > 0) && allData.length > 0;

  const { data, options } = configs(
    chart.labels || [], 
    datasets,
    chartOptions?.fixedMin,
    chartOptions?.fixedMax,
    chartOptions
  );

  const renderChart = (
    <MDBox py={2} pr={2} pl={icon.component ? 1 : 2}>
      {/* Header: icon + title + description */}
      {title || description ? (
        <MDBox display="flex" px={description ? 1 : 0} pt={description ? 1 : 0}>
          {/* {icon.component && (
            <MDBox
              width="4rem"
              height="4rem"
              bgColor={icon.color || "dark"}
              variant="gradient"
              coloredShadow={icon.color || "dark"}
              borderRadius="xl"
              display="flex"
              justifyContent="center"
              alignItems="center"
              color="white"
              mt={-5}
              mr={2}
            >
              <Icon fontSize="medium">{icon.component}</Icon>
            </MDBox>
          )} */}
          <MDBox mt={icon.component ? -2 : 0}>
            {title && <MDTypography variant="h6">{title}</MDTypography>}
            {description && (
              <MDBox mb={4}>
                <MDTypography component="div" variant="button" color="text">
                  {description}
                </MDTypography>
              </MDBox>
            )}
          </MDBox>
        </MDBox>
      ) : null}

      {/* Biểu đồ */}
      {useMemo(
        () => (
          <MDBox height={height} position="relative">
            {!hasData && (
              <MDBox
                position="absolute"
                top="50%"
                left="50%"
                sx={{
                  transform: "translate(-50%, -50%)",
                  zIndex: 10,
                  textAlign: "center",
                  pointerEvents: "none",
                }}
              >
                <MDTypography variant="body2" color="text" fontWeight="medium">
                  Chưa có dữ liệu
                </MDTypography>
              </MDBox>
            )}
            <Line data={data} options={options} redraw />
          </MDBox>
        ),
        [chart, height, hasData, data, options]
      )}
    </MDBox>
  );

  return title || description ? <Card>{renderChart}</Card> : renderChart;
}

// ⚙️ Default props
LineChart.defaultProps = {
  icon: { color: "info", component: "" },
  title: "",
  description: "",
  height: "19.125rem",
};

// 🧩 Typechecking props
LineChart.propTypes = {
  icon: PropTypes.shape({
    color: PropTypes.oneOf([
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "error",
      "light",
      "dark",
    ]),
    component: PropTypes.node,
  }),
  title: PropTypes.string,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  chart: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string),
    datasets: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  chartOptions: PropTypes.shape({
    fixedMin: PropTypes.number,
    fixedMax: PropTypes.number,
    yAxisLabel: PropTypes.string,
    beginAtZero: PropTypes.bool,
  }),
};

export default LineChart;
