// components/Charts/LineChart.jsx
import React from "react";
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

import configs from "./configs";
import chartData from "layouts/profile/data/chartData";
import MDBox from "components/MDBox";

// Đăng ký các thành phần cần thiết
ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale, // 👈 scale "linear" cần thiết cho trục Y
  Legend,
  Tooltip
);

function LineChart() {
  const { data, options } = configs(chartData.labels, chartData.datasets);

  return (
    <MDBox sx={{ height: "300px" }}>
      <Line data={data} options={options} />
    </MDBox>
  );
}

export default LineChart;
