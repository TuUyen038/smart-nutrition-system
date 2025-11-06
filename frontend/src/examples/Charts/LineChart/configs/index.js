import typography from "assets/theme/base/typography";

function configs(labels, datasets, fixedMin = 0, fixedMax = 3000) {
  const allData = datasets.flatMap((ds) => ds.data || []);

  const actualMin = Math.min(...allData);
  const actualMax = Math.max(...allData);

  // Nếu vượt qua fixed range thì mở rộng ra đúng giá trị vượt
  const yMin = actualMin < fixedMin ? actualMin : fixedMin;
  const yMax = actualMax > fixedMax ? actualMax : fixedMax;

  return {
    data: {
      labels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true },

      },
      interaction: {
        intersect: false,
        mode: "index",
      },
      scales: {
        x: {
          type: "category", // 👈 thêm rõ kiểu trục X
          grid: {
            drawBorder: false,
            display: false,
            drawOnChartArea: true,
            drawTicks: false,
            borderDash: [5, 5],
          },
          ticks: {
            display: true,
            color: "#b2b9bf",
            padding: 10,
            font: {
              size: 11,
              family: typography.fontFamily,
              style: "normal",
              lineHeight: 2,
            },
          },
        },
        y: {
          type: "linear", // 👈 thêm rõ kiểu trục Y
          beginAtZero: false,
          min: yMin,
          max: yMax,
          grid: {
            drawBorder: false,
            display: true,
            drawOnChartArea: true,
            drawTicks: false,
            borderDash: [5, 5],
            color: "rgba(0,0,0,0.05)" 
          },
          ticks: {
            display: true,
            padding: 10,
            color: "#b2b9bf",
            font: {
              size: 11,
              family: typography.fontFamily,
              style: "normal",
              lineHeight: 2,
            },
            stepSize: Math.round((yMax - yMin) / 5), // chia khoảng hợp lý
            callback: (value) => `${value} kcal`,
          },
        },
      },
    },
  };
}

export default configs;
