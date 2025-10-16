import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDButton from "components/MDButton";
import { Card } from "@mui/material";

function AnalyzeRecipe() {
  const [dishName, setDishName] = useState("");
  const [recipe, setRecipe] = useState("");
  const [result, setResult] = useState(null);

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
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Công thức món ăn"
                variant="outlined"
                multiline
                rows={6}
                value={recipe}
                onChange={(e) => setRecipe(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Grid item xs={12} sm={6} lg={12}>
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
