// components/Charts/data.js
const lineChartData = {
  labels: ["01/10", "02/10", "03/10", "04/10", "05/10", "06/10", "07/10"],
  datasets: [
    {
      label: "Calo đã tiêu thụ (kcal)",
      data: [2200, 2100, 2000, 1900, 1800, 1850, 1950],
      borderColor: "#E53935",
      backgroundColor: "rgba(229, 57, 53, 0.1)",
      tension: 0.4,
      fill: true,
    },
    {
      label: "Calo mục tiêu (kcal)",
      data: [2000, 2000, 2000, 2000, 2000, 2000, 2000],
      borderColor: "#1A73E8",
      backgroundColor: "rgba(26, 115, 232, 0.1)",
      borderDash: [10, 5],
      tension: 0.4,
      fill: false,
    }
  ],
};

export default lineChartData;
