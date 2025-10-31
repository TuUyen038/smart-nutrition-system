import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDButton from "components/MDButton";
import { Card } from "@mui/material";
import { findRecipeByFoodName, getIngredientsAndInstructionsInAi } from "../../services/recipeApi";
function AnalyzeRecipe() {
  const [searchParams] = useSearchParams();
  const foodName = searchParams.get("dish");
  const [recipe, setRecipe] = useState(null);
  const [result, setResult] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("foodName trong use effect:", foodName);
        let recipeData = await findRecipeByFoodName(foodName);
        console.log("recipeData:", recipeData);

        if (!recipeData) {
          console.log("Không tìm thấy trong CSDL. Chuyển sang tìm kiếm bằng AI.");
          recipeData = await getIngredientsAndInstructionsInAi(foodName);

          if (!recipeData || (!recipeData.ingredients && !recipeData.instructions)) {
            throw new Error("Không thể tìm thấy công thức hợp lệ từ bất kỳ nguồn nào.");
          }
        }
        console.log("recipeData:", recipeData);
        setRecipe({ ...recipeData });
        setIngredients(recipeData.ingredients || []);
        setInstructions(recipeData.instructions || []);
      } catch (err) {
        console.error("Lỗi tìm kiếm công thức:", err);
        setError(err.message || "Đã xảy ra lỗi khi tìm công thức.");
        setIngredients([]);
        setInstructions([]);
        setRecipe(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [foodName]);

  const handleAnalyze = () => {
    setResult({
      nutrition: "Năng lượng: 520 kcal, Protein: 18g, Chất béo: 30g, Carbs: 45g",
      note: "Món ăn chứa nhiều đường và chất béo, không phù hợp với người tiểu đường",
    });
  };

  const handleSave = () => {
    alert("Đã lưu công thức thành công!");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} sx={{ minHeight: "calc(100vh - 64px)" }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={12}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="h5" mb={2}>
                Phân tích dinh dưỡng từ công thức món ăn
              </MDTypography>
              <TextField
                fullWidth
                label="Tên món ăn"
                variant="outlined"
                value={foodName || ""}
                // onChange={(e) => setDishName(e.target.value)}
                sx={{ mb: 2 }}
              />
              {ingredients.length > 0 && (
                <MDBox mt={3}>
                  <MDTypography variant="h6" fontWeight="medium" gutterBottom>
                    Nguyên liệu
                  </MDTypography>
                  {ingredients.map((item, index) => (
                    <Typography key={index} variant="body2">
                      • {item.name} — <strong>{item.quantity}</strong>
                    </Typography>
                  ))}
                </MDBox>
              )}
              {instructions.length > 0 && (
                <MDBox mt={3}>
                  <MDTypography variant="h6" fontWeight="medium" gutterBottom>
                    Các bước thực hiện
                  </MDTypography>
                  {instructions.map((step, index) => (
                    <Typography key={index} variant="body2">
                      {index + 1}. {step}
                    </Typography>
                  ))}
                </MDBox>
              )}

              <Grid item xs={12} sm={6} lg={12} mt={3}>
                <MDBox display="flex" gap={2} flexWrap="wrap">
                  <MDButton variant="contained" color="info" onClick={handleAnalyze}>
                    Phân tích
                  </MDButton>
                  <MDButton variant="contained" color="info" onClick={handleSave}>
                    Lưu
                  </MDButton>
                </MDBox>
              </Grid>
            </Card>
          </Grid>

          {result && (
            <Grid item xs={12} mt={4}>
              <MDBox p={2} border="1px solid #ccc" borderRadius="lg" bgColor="white">
                <MDTypography variant="h6" fontWeight="medium">
                  Thành phần dinh dưỡng
                </MDTypography>
                <Typography variant="body2">{result.nutrition}</Typography>

                <Divider sx={{ my: 2 }} />
                <MDTypography variant="h6" fontWeight="medium">
                  Cảnh báo
                </MDTypography>
                <Typography variant="body2">{result.note}</Typography>
              </MDBox>
            </Grid>
          )}
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default AnalyzeRecipe;
