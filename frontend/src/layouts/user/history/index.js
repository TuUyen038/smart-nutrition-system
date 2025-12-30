import React, { use, useEffect, useState } from "react";
import { Box, Grid, Divider, Typography } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DefaultFoodCard from "examples/Cards/FoodCards/DefaultFoodCard";
import CustomList from "components/CustomList";
import { getRecipesByDateAndStatus } from "services/dailyMenuApi";
import { findRecipeById } from "services/recipeApi";
import { useNavigate } from "react-router-dom";
import MDButton from "components/MDButton";

function FoodHistory() {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getRecipesByDateAndStatus(
          new Date("2025-11-01"),
          new Date("2025-11-04"),
          "eaten"
        );
        setHistoryData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  const goToDetail = (id) => {
    navigate(`/recipes/${id}`);
  };
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box pt={2}>
        {isLoading && (
          <Typography variant="button" color="text" sx={{ whiteSpace: "nowrap" }}>
            Loading...
          </Typography>
        )}

        {!isLoading && historyData.length === 0 && (
          <Typography variant="button" color="text" sx={{ whiteSpace: "nowrap" }}>
            Chưa có dữ liệu
          </Typography>
        )}

        {!isLoading &&
          historyData.length > 0 &&
          historyData.map((day) => (
            <Box key={day.date} mb={2}>
              {/* Tiêu đề ngày */}
              <MDBox display="flex" alignItems="center" gap={2} mb={1}>
                <MDTypography variant="button" color="text" sx={{ whiteSpace: "nowrap" }}>
                  {new Date(day.date).toLocaleDateString("vi-VN")}
                </MDTypography>
                <Divider sx={{ flexGrow: 1 }} />
              </MDBox>

              {/* Danh sách món ăn */}
              <CustomList
                items={day.recipes}
                renderItem={(item) => (
                  <Box sx={{ mb: 1 }}>
                    {/* <DefaultFoodCard
                      image={item.imageUrl}
                      label={`${item.totalNutrition.calories} kcal`}
                      title={item.name}
                      description={item.description}
                      action={null}
                      // action={{ onClick: () => goToDetail(item.recipeId) }}
                    >
                      <MDButton color="error" size="small">Xóa</MDButton>
                    </DefaultFoodCard> */}
                    <DefaultFoodCard
                      image={item.imageUrl}
                      label={`${item.totalNutrition.calories} kcal`}
                      title={item.name}
                      description={item.description}
                      action={{ onClick: () => goToDetail(item.recipeId) }}
                    ></DefaultFoodCard>
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
