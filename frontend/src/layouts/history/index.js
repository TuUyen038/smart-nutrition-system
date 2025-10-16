import React from "react";
import { Box, Grid, Divider } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DefaultFoodCard from "examples/Cards/FoodCards/DefaultFoodCard";
import CustomList from "components/CustomList";

const historyData = [
  {
    date: "2024-12-27",
    foods: [
      { id: 1, name: "Phở bò", image: "/images/pho.jpg", kcal: 450 },
      { id: 2, name: "Cơm gà xối mỡ", image: "/images/com-ga.jpg", kcal: 620 },
      { id: 3, name: "Bánh mì trứng", image: "/images/banh-mi.jpg", kcal: 320 },
    ],
  },
  {
    date: "2024-12-26",
    foods: [
      { id: 4, name: "Bún riêu", image: "/images/bun-rieu.jpg", kcal: 400 },
      { id: 5, name: "Gỏi cuốn", image: "/images/goi-cuon.jpg", kcal: 250 },
      { id: 6, name: "Cháo thịt bằm", image: "/images/chao.jpg", kcal: 300 },
      { id: 7, name: "Cơm sườn", image: "/images/com-suon.jpg", kcal: 550 },
      { id: 8, name: "Bánh cuốn", image: "/images/banh-cuon.jpg", kcal: 280 },
      { id: 9, name: "Súp gà", image: "/images/sup-ga.jpg", kcal: 320 },
    ],
  },
];

function FoodHistory() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box py={3}>
        {historyData.map((day) => (
          <Box key={day.date} mb={4}>
            {/* Tiêu đề ngày */}
            <MDBox display="flex" alignItems="center" gap={2} mb={2}>
              <MDTypography variant="button" color="text" sx={{ whiteSpace: "nowrap" }}>
                {new Date(day.date).toLocaleDateString("vi-VN")}
              </MDTypography>
              <Divider sx={{ flexGrow: 1 }} />
            </MDBox>

            {/* Danh sách món ăn */}
            <CustomList
              items={day.foods}
              renderItem={(item) => (
                <Box sx={{ px: 1, m: 1 }}>
                  <DefaultFoodCard
                    image={item.image}
                    label={`${item.kcal} kcal`}
                    title={item.name}
                    description="Món ăn đã dùng trong ngày"
                  />
                </Box>
              )}
            />
          </Box>
        ))}
      </Box>
    </DashboardLayout>
  );
}

export default FoodHistory;
