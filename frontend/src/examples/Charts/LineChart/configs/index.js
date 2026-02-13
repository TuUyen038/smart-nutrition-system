import typography from "assets/theme/base/typography";

function configs(labels, datasets, fixedMin = 0, fixedMax = 3000, options = {}) {
  const { yAxisLabel = "kcal", beginAtZero = false } = options;
  const allData = datasets.flatMap((ds) => ds.data || []);

  // Kiểm tra xem có dữ liệu không
  const hasData = allData.length > 0 && allData.some((value) => value > 0);

  // Nếu không có dữ liệu, đặt giá trị mặc định để chart vẫn hiển thị
  const actualMin = hasData ? Math.min(...allData, 0) : 0;
  const actualMax = hasData ? Math.max(...allData, 0) : fixedMax || 2000;

  // Tính min/max phù hợp
  let yMin, yMax;
  if (beginAtZero) {
    yMin = 0;
    // Nếu max nhỏ, làm tròn lên để có khoảng trống
    yMax = actualMax <= 10 ? Math.max(actualMax + 2, 5) : Math.ceil(actualMax * 1.1);
  } else {
    // Nếu có fixedMin và fixedMax, sử dụng chúng (trừ khi dữ liệu vượt quá)
    if (fixedMin !== undefined && fixedMax !== undefined) {
      // Nếu fixedMin = 1 và fixedMax = 2000, bắt đầu từ 0 để có các mốc đẹp
      if (fixedMin === 1 && fixedMax === 2000) {
        yMin = 0; // Bắt đầu từ 0 để có mốc đẹp
        yMax = actualMax > fixedMax ? actualMax : fixedMax;
      } else {
        // Nếu dữ liệu vượt quá fixed range, mở rộng ra
        yMin = actualMin < fixedMin ? actualMin : fixedMin;
        yMax = actualMax > fixedMax ? actualMax : fixedMax;
      }
    } else {
      // Nếu không có fixed range, tính tự động
      yMin = actualMin < fixedMin ? actualMin : fixedMin;
      yMax = actualMax > fixedMax ? actualMax : fixedMax;
    }
  }

  // Đảm bảo yMax luôn lớn hơn yMin
  if (yMax <= yMin) {
    yMax = yMin + (fixedMax || 2000);
  }

  // Tính stepSize phù hợp với dữ liệu
  let stepSize;
  if (beginAtZero && actualMax <= 10) {
    stepSize = 1; // Với số nhỏ, dùng stepSize = 1
  } else if (fixedMin !== undefined && fixedMax !== undefined && fixedMax === 2000) {
    // Với khoảng 1-2000, dùng stepSize = 500 để có các mốc đẹp: 0, 500, 1000, 1500, 2000
    stepSize = 500;
  } else if (fixedMin !== undefined && fixedMax !== undefined) {
    // Với khoảng cố định khác, tính stepSize dựa trên khoảng đó
    const range = yMax - yMin;
    // Chia thành khoảng 5-10 bước để dễ đọc
    stepSize = Math.max(100, Math.round(range / 8)); // Ít nhất 100 kcal, chia thành 8 bước
  } else {
    stepSize = Math.max(1, Math.round((yMax - yMin) / 5)); // Ít nhất là 1
  }

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
          beginAtZero: beginAtZero,
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
            stepSize: stepSize,
            callback: (value) => yAxisLabel ? `${value} ${yAxisLabel}` : String(value),
          },
        },
      },
    },
  };
}

export default configs;
