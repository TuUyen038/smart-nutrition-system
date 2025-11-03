import React, { useState, useRef } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDButton from "components/MDButton";
import { Card, CircularProgress, Box, Chip, Alert } from "@mui/material";
import {
  findRecipeByFoodName,
  getBackUpNutrition,
  getIngredientsAndInstructionsInAi,
} from "../../services/recipeApi";
import { findIngredientById } from "../../services/ingredientApi";
import { List, ListItem, ListItemText, ListItemIcon, Divider } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import NutritionProgress from "./nutritionProgress";
function AnalyzeRecipe() {
  const resultRef = useRef(null);
  const [searchParams] = useSearchParams();
  const foodName = searchParams.get("dish");
  const [ingredients, setIngredients] = useState([]);
  const [ingrIds, setIngrIds] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [backUpNutrition, setBackUpNutrition] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [error, setError] = useState(null);
  const [totalNutrition, setTotalNutrition] = useState({});
  const [db, setBd] = useState(false);
  const [dishName, setDishName] = useState("");
  const [healthWarnings, setHealthWarnings] = useState([]);

  useEffect(() => {
    let active = true;

    const fetchRecipe = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let recipeData = await findRecipeByFoodName(foodName);
        if (!recipeData) {
          console.log("Không tìm thấy trong CSDL. Chuyển sang tìm kiếm bằng AI.");
          recipeData = await getIngredientsAndInstructionsInAi(foodName);

          if (!recipeData || (!recipeData.ingredients && !recipeData.instructions)) {
            throw new Error("Không thể tìm thấy công thức hợp lệ từ bất kỳ nguồn nào.");
          }
          console.log("Tìm kiếm bằng AI:", recipeData);
          if (!active) return;
          const ingrs = recipeData.ingredients || [];
          const names = ingrs.map((ingr) => ({
            name: ingr.name,
            quantity: ingr.quantity
              ? `${ingr.quantity.amount || ""} ${ingr.quantity.unit || ""}`.trim()
              : "",
          }));
          getBackUpNutrition(names)
            .then((nutritions) => {
              if (!active) return;

              let parsed = nutritions;
              if (typeof nutritions === "string") {
                try {
                  parsed = JSON.parse(nutritions);
                } catch (e) {
                  console.error("Không parse được JSON:", e);
                  parsed = [];
                }
              }

              setBackUpNutrition(parsed);
              console.log("Nutrition backup da co");
            })
            .catch((err) => console.error(err));
        } else {
          setBd(true);
          let ids = recipeData.ingredients.map((ingr) => ingr._id);
          setIngrIds(ids);
        }

        if (!active) return;
        setIngredients(recipeData.ingredients || []);
        setInstructions(recipeData.instructions || []);
      } catch (err) {
        if (!active) return;
        console.error("Lỗi tìm kiếm công thức:", err);
        setError(err.message || "Đã xảy ra lỗi khi tìm công thức.");
        setIngredients([]);
        setInstructions([]);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    if (foodName) {
      fetchRecipe();
    }

    return () => {
      active = false;
      console.log("Unmounted");
    };
  }, [foodName]);

  const handleSave = () => {
    alert("Đã lưu công thức thành công!");
  };

  const convertToGram = (amount, unit) => {
    switch (unit?.toLowerCase()) {
      case "kg":
        return amount * 1000;
      case "g":
        return amount;
      case "mg":
        return amount / 1000;
      case "l":
        return amount * 1000;
      case "ml":
        return amount;
      case "tsp":
      case "teaspoon":
        return amount * 5;
      case "tbsp":
      case "tablespoon":
        return amount * 15;
      case "cup":
        return amount * 240;
      case "quả":
        return amount * 50;
      default:
        return amount;
    }
  };

  const analyzeHealthWarnings = (nutrition) => {
    const warnings = [];

    if (nutrition.calories > 800) {
      warnings.push({
        type: "warning",
        message: "Món ăn có hàm lượng calo cao. Nên chia thành nhiều bữa hoặc kết hợp vận động.",
      });
    }

    if (nutrition.sodium > 2000) {
      warnings.push({
        type: "error",
        message: "Hàm lượng natri cao, không phù hợp với người huyết áp cao.",
      });
    }

    if (nutrition.sugar > 50) {
      warnings.push({
        type: "warning",
        message: "Hàm lượng đường cao, người tiểu đường nên hạn chế.",
      });
    }

    if (nutrition.protein > 40) {
      warnings.push({
        type: "success",
        message: "Giàu protein, tốt cho việc tăng cơ và phục hồi.",
      });
    }

    if (nutrition.fiber > 10) {
      warnings.push({
        type: "success",
        message: "Giàu chất xơ, tốt cho hệ tiêu hóa.",
      });
    }

    return warnings;
  };

  const handleCalculate = async () => {
    console.log("db ne: ", db);

    setIsLoading2(true);
    let totalNutrition = {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    };

    try {
      if (db === true) {
        if (!ingrIds || ingrIds.length === 0) return;
        for (const id of ingrIds) {
          const nutri = await findIngredientById(id);
          if (nutri) {
            totalNutrition.calories += nutri.calories || 0;
            totalNutrition.protein += nutri.protein || 0;
            totalNutrition.fat += nutri.fat || 0;
            totalNutrition.carbs += nutri.carbs || 0;
            totalNutrition.fiber += nutri.fiber || 0;
            totalNutrition.sugar += nutri.sugar || 0;
            totalNutrition.sodium += nutri.sodium || 0;
          }
        }
      } else {
        if (
          !backUpNutrition ||
          !Array.isArray(backUpNutrition.Nutrition) ||
          backUpNutrition.Nutrition.length === 0
        ) {
          return;
        }

        backUpNutrition.Nutrition.forEach((item) => {
          const matched = ingredients.find((i) => i.name === item.name);
          const amount = matched?.quantity?.amount || 0;
          const unit = matched?.quantity?.unit || "g";
          const amountInGram = convertToGram(amount, unit);
          const ratio = amountInGram / 100;

          totalNutrition.calories += (item.calories || 0) * ratio;
          totalNutrition.protein += (item.protein || 0) * ratio;
          totalNutrition.fat += (item.fat || 0) * ratio;
          totalNutrition.carbs += (item.carbs || 0) * ratio;
          totalNutrition.fiber += (item.fiber || 0) * ratio;
          totalNutrition.sugar += (item.sugar || 0) * ratio;
          totalNutrition.sodium += (item.sodium || 0) * ratio;
        });

        for (let key in totalNutrition) {
          totalNutrition[key] = Math.round(totalNutrition[key] * 100) / 100;
        }
      }

      setTotalNutrition(totalNutrition);

      const warnings = analyzeHealthWarnings(totalNutrition);
      setHealthWarnings(warnings);

      setTimeout(() => {
        if (resultRef.current) {
          resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300); // delay nhẹ để React render xong
    } finally {
      setIsLoading2(false);
    }
  };

  const nutritionLabels = {
    calories: "Năng lượng (kcal)",
    protein: "Protein (g)",
    fat: "Chất béo (g)",
    carbs: "Carbohydrate (g)",
    fiber: "Chất xơ (g)",
    sugar: "Đường (g)",
    sodium: "Natri (mg)",
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} sx={{ minHeight: "calc(100vh - 64px)" }}>
        <Grid container spacing={3}>
          {/* Header */}
          <Grid item xs={12}>
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
              <MDTypography variant="h5" mb={2}>
                Phân tích dinh dưỡng từ công thức món ăn
              </MDTypography>

              <TextField
                fullWidth
                label="Tên món ăn"
                variant="outlined"
                value={foodName || dishName}
                onChange={(e) => setDishName(e.target.value)}
                sx={{ mb: 2 }}
              />

              {isLoading && (
                <MDBox display="flex" justifyContent="center" alignItems="center" py={5}>
                  <CircularProgress color="info" />
                </MDBox>
              )}
            </Card>
          </Grid>

          {/* Hàng 1: Các bước nấu ăn */}
          {!isLoading && (
            <Grid item xs={12}>
              <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
                <MDTypography variant="h6" gutterBottom>
                  Các bước thực hiện
                </MDTypography>
                <TextField
                  fullWidth
                  multiline
                  minRows={8}
                  value={instructions.length > 0 ? instructions.join("\n") : ""}
                  onChange={(e) => {
                    const steps = e.target.value.split("\n").filter((s) => s.trim() !== "");
                    setInstructions(steps);
                  }}
                  placeholder="VD:\n1. Ướp thịt với nước mắm và tiêu trong 15 phút\n2. Chiên vàng hai mặt...\n3. Dọn ra đĩa..."
                  sx={{ mb: 3 }}
                />

                <MDBox display="flex" gap={2}>
                  <MDButton
                    variant="contained"
                    color="info"
                    onClick={handleCalculate}
                    disabled={isLoading}
                  >
                    Phân tích dinh dưỡng
                  </MDButton>
                  <MDButton
                    variant="outlined"
                    color="success"
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    Lưu công thức
                  </MDButton>
                </MDBox>
              </Card>
            </Grid>
          )}

          <Grid item xs={12} ref={resultRef}>
            {isLoading2 && (
              <MDBox display="flex" justifyContent="center" alignItems="center" py={5}>
                <CircularProgress color="info" />
              </MDBox>
            )}
            {/* Hàng 2: Nguyên liệu + Dinh dưỡng (chỉ hiển thị sau khi bấm Phân tích) */}
            {Object.keys(totalNutrition).length > 0 && (
              <Grid item xs={12}>
                <Grid container spacing={3}>
                  {/* Cột trái - Nguyên liệu */}
                  <Grid item xs={12} md={4} ref={resultRef}>
                    <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
                      <MDTypography variant="h6" fontWeight="medium" gutterBottom>
                        Nguyên liệu
                      </MDTypography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column", // mỗi Chip 1 hàng
                          gap: 1,
                          maxHeight: 350,
                          overflowY: "auto",
                          p: 1.5,
                          border: "1px solid #e0e0e0",
                          borderRadius: 2,
                          bgcolor: "#fafafa",
                          scrollbarWidth: "thin",
                          "&::-webkit-scrollbar": { width: 6 },
                          "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "#bbb",
                            borderRadius: 3,
                          },
                        }}
                      >
                        {ingredients.map((item, index) => (
                          <Box
                            key={index}
                            sx={{
                              width: "fit-content",
                            }}
                          >
                            <Chip
                              key={index}
                              label={`${item.name}${
                                item.quantity?.amount
                                  ? ` — ${item.quantity.amount} ${item.quantity.unit}`
                                  : ""
                              }`}
                              color="primary"
                              variant="outlined"
                              sx={{
                                fontSize: 13,
                                justifyContent: "flex-start",
                                height: "auto",
                                py: 1,
                                width: "auto",
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                    </Card>
                  </Grid>

                  {/* Cột phải - Dinh dưỡng */}
                  <Grid item xs={12} md={8}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
                        <MDTypography variant="h6" fontWeight="medium" mb={2}>
                          Thành phần dinh dưỡng
                        </MDTypography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <NutritionProgress
                            mealNutrition={{
                              calories: 200,
                              protein: 10,
                              fat: 5,
                              carbs: 30,
                            }}
                            totalNutrition={{
                              calories: 400,
                              protein: 20,
                              fat: 10,
                              carbs: 50,
                            }}
                            recommendedNutrition={{
                              calories: 600,
                              protein: 50,
                              fat: 20,
                              carbs: 60,
                            }}
                          />
                        </Box>
                      </Card>

                      {/* Lưu ý sức khỏe */}
                      {healthWarnings.length > 0 && (
                        <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
                          <MDTypography variant="h6" fontWeight="medium" mb={2}>
                            Lưu ý sức khỏe
                          </MDTypography>
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            {healthWarnings.map((warning, index) => (
                              <Alert key={index} severity={warning.type}>
                                {warning.message}
                              </Alert>
                            ))}
                          </Box>
                        </Card>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default AnalyzeRecipe;
