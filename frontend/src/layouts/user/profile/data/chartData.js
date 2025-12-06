// components/Charts/data.js
const chartData = {
  labels: ["01/10", "02/10", "03/10", "04/10", "05/10", "06/10", "07/10"],
  datasets: [
    {
      label: "Calo tiêu thụ (kcal)",
      data: [1200, 2100, 2000, 1900, 1800, 1850, 1750],
      borderColor: "#E53935",
      backgroundColor: "rgba(229, 57, 53, 0.1)",
      tension: 0.4,
      fill: true,
    },
  ],
};

export default chartData;
