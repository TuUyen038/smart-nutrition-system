import colors from "assets/theme/base/colors";

const { gradients, dark } = colors;

function configs(labels, datasets, cutout = 60) {
  const backgroundColors = ["#42A5F5", "#66BB6A", "#FFA726", "#EF5350"];

  if (datasets.backgroundColors) {
    datasets.backgroundColors.forEach((color) => {
      if (gradients[color]) {
        if (color === "info") {
          backgroundColors.push(gradients.info.main);
        } else {
          backgroundColors.push(gradients[color].state);
        }
      } else {
        backgroundColors.push(dark.main);
      }
    });
  } else {
    backgroundColors.push(dark.main);
  }

  // Kiểm tra xem có dữ liệu không (tất cả giá trị = 0)
  const chartData = datasets.data || [];
  const hasData = chartData.some((value) => value > 0);
  
  // Nếu không có dữ liệu, tạo một vòng tròn rỗng để chart vẫn hiển thị
  // Sử dụng một giá trị và màu xám nhạt để tạo vòng tròn rỗng
  const processedData = hasData 
    ? chartData 
    : [100]; // Một giá trị để tạo vòng tròn
  const processedLabels = hasData 
    ? labels 
    : [""]; // Label rỗng
  const processedBackgroundColors = hasData 
    ? backgroundColors 
    : ["rgba(158, 158, 158, 0.1)"]; // Màu xám nhạt

  return {
    data: {
      labels: processedLabels,
      datasets: [
        {
          label: datasets.label,
          weight: 9,
          cutout,
          tension: 0.9,
          pointRadius: 2,
          borderWidth: hasData ? 2 : 1,
          borderColor: hasData ? undefined : "rgba(158, 158, 158, 0.3)",
          backgroundColor: processedBackgroundColors,
          fill: false,
          data: processedData,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
          display: hasData, // Ẩn legend khi không có dữ liệu
        },
        tooltip: {
          enabled: hasData, // Tắt tooltip khi không có dữ liệu
          callbacks: {
            label: (context) => `${context.label}: ${context.raw}`,
          },
        },
      },
    },
  };
}

export default configs;
