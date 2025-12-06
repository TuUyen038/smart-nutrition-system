import React, { useEffect, useState } from "react";
import { Box, Grid, Divider, Typography, Card, Chip, Breadcrumbs } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import BigFoodCard from "examples/Cards/FoodCards/BigFoodCard";
import CustomList from "components/CustomList";
import { findRecipeById } from "services/recipeApi";
import { useParams } from "react-router-dom";

function RecipeDetail() {
  const { id } = useParams(); 
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await findRecipeById(id);
        setRecipe(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) return <DashboardLayout><DashboardNavbar /><Box p={2}>Loading...</Box></DashboardLayout>;
  if (!recipe) return <DashboardLayout><DashboardNavbar /><Box p={2}>Không tìm thấy món ăn</Box></DashboardLayout>;

  const { name, imageUrl, description, ingredients, instructions, totalNutrition, servings } = recipe;

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <Box pt={2} px={3}>
        {/* Tên + hình + mô tả */}
        <Grid container spacing={3} alignItems="flex-start">
          <Grid item xs={12} md={4}>
            <BigFoodCard
              image={imageUrl}
              label={`${totalNutrition.calories} kcal`}
              title={name}
              description={description}
            />
          </Grid>

          <Grid item xs={12} md={8}>
            {/* Tổng quan dinh dưỡng */}
            <Card p={2}>
              <MDBox mb={3} px={2} pt={2}>
                <MDTypography variant="h6">Thông tin dinh dưỡng</MDTypography>
                <Divider sx={{ mb: 1 }} />
                <Grid container spacing={1}>
                  {totalNutrition && Object.entries(totalNutrition).map(([key, value]) => (
                    <Grid item xs={6} sm={4} md={3} key={key}>
                      <MDTypography variant="button" color="text">
                        {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                      </MDTypography>
                    </Grid>
                  ))}
                  <Grid item xs={6}>
                    <MDTypography variant="button" color="text">Servings: {servings}</MDTypography>
                  </Grid>
                </Grid>
              </MDBox>

              {/* Nguyên liệu */}
              <MDBox mb={3}  px={2}>
                <MDTypography variant="h6">Nguyên liệu</MDTypography>
                <Divider sx={{ mb: 1 }} />
                  <Grid container spacing={2}>
                    {ingredients.map((item, index) => (
                      <Grid item xs={6} key={index}>
                        <MDTypography variant="button" color="text">
                          {item.name} {item.quantity}
                        </MDTypography>
                      </Grid>
                    ))}
                  </Grid>  
              </MDBox>

              {/* Hướng dẫn */}
              <MDBox mb={3}  px={2}>
                <MDTypography variant="h6">Công thức nấu</MDTypography>
                <Divider sx={{ mb: 1 }} />
                  <Grid container spacing={2}>
                    {instructions.map((item, index) => (
                      <Grid item xs={12} key={index}>
                        <MDTypography variant="button" color="text">
                          {item}
                        </MDTypography>
                      </Grid>
                    ))}
                  </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}

export default RecipeDetail;
