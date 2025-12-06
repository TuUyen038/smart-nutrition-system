const labels = ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6"];

const adminUserLineChartData = {
  labels,
  datasets: [
    {
      label: "Người dùng mới",
      data: [20, 35, 50, 80, 120, 150],
      // Nếu component LineChart của bạn có options riêng thì giữ nguyên format như file cũ
    },
  ],
};

export default adminUserLineChartData;
