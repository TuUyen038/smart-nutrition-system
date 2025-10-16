// components/Charts/data.js
const chartData = {
  labels: ["01/10", "02/10", "03/10", "04/10", "05/10", "06/10", "07/10"],
  datasets: [
    {
      label: "Cân nặng (kg)",
      data: [65, 64.8, 64.5, 64.3, 64.1, 64.0, 63.8],
      borderColor: "#1A73E8",
      backgroundColor: "rgba(26, 115, 232, 0.1)",
      tension: 0.4,
      fill: true,
    },
    {
      label: "Calo tiêu thụ (kcal)",
      data: [2200, 2100, 2000, 1900, 1800, 1850, 1750],
      borderColor: "#E53935",
      backgroundColor: "rgba(229, 57, 53, 0.1)",
      tension: 0.4,
      fill: true,
    },
  ],
};

export default chartData;
