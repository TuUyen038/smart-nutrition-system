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
import { Card, CircularProgress, Box, Chip, Alert, Skeleton, Stack } from "@mui/material";
import {
  findRecipeByFoodName,
  getBackUpNutrition,
  getIngredientsAndInstructionsInAi,
  getIngredientsInAi,
  createRecipe
} from "../../services/recipeApi";
import { fetchIngredientsNutrition } from "../../services/mappingModelApi";
import { findIngredientById } from "../../services/ingredientApi";
import { List, ListItem, ListItemText, ListItemIcon, Divider } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import NutritionProgress from "./nutritionProgress";
import { addRecipeToDailyMenu } from "services/dailyMenuApi";
function AnalyzeRecipe() {
  const myId = localStorage.getItem("userId") || "68f4394c4d4cc568e6bc5daa"; // ID người dùng giả định
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
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
  const [isLoadingNutrition, setIsLoadingNutrition] = useState(false);
  const [isClick, setIsClick] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  //50  2 30 50 10 50 50 30 20 15 10 5 5 5 50 30
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
          // getBackUpNutrition(names)
          //   .then((nutritions) => {
          //     if (!active) return;

          //     let parsed = nutritions;
          //     if (typeof nutritions === "string") {
          //       try {
          //         parsed = JSON.parse(nutritions);
          //       } catch (e) {
          //         console.error("Không parse được JSON:", e);
          //         parsed = [];
          //       }
          //     }
          //     setIsBackupLoading(true);
          //     setBackUpNutrition(parsed);
          //     console.log("Nutrition backup da co");
          //   })
          //   .catch((err) => console.error(err));
        } else {
          setBd(true);
          setTotalNutrition(recipeData.nutrition || {});
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

  const handleSave = async () => {
    try {
      const recipePayload = {
        ownerId: myId,
        name: dishName || foodName || "Món ăn chưa đặt tên",
        imageUrl: "https://res.cloudinary.com/denhj5ubh/image/upload/v1762541471/foodImages/ml4njluxyrvhthnvx0xr.jpg",
        public_id: "foodImages/ml4njluxyrvhthnvx0xr",
        description: `Công thức cho món ${dishName || foodName || "không tên"}`,
        ingredients,
        instructions,
        createdBy: "user",
        totalNutrition,
        verified: false,
      };

      // Tạo recipe
      const createdRecipe = await createRecipe(recipePayload);
      console.log("Lưu công thức thành công:", createdRecipe);

      // Thêm vào daily menu
      const date = new Date();
      const recipeId = createdRecipe._id;

      const data = await addRecipeToDailyMenu({
        userId: myId,
        date,
        recipeId,
        portion: 1,
        note: "",
        servingTime: "other",
      });

      console.log("Added to daily menu:", data);
      alert("Thêm thành công!");
    } catch (error) {
      console.error("Lỗi khi lưu món ăn:", error);
      alert("Lưu công thức thất bại. Vui lòng thử lại.");
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
    setIsClick(true);
    let totalNutrition = {
      calories: 0, protein: 0, fat: 0, carbs: 0,
      fiber: 0, sugar: 0, sodium: 0,
    };

    try {
      let ingredientsArr;

      if (!db) {
        //load nguyen lieu
        setIsLoadingIngredients(true);

        const nutri = await getIngredientsInAi(instructions);
        ingredientsArr = nutri.ingredients || [];
        setIngredients(nutri.ingredients || []);

        setIsLoadingIngredients(false);
        setIsSuccess(true);
      }
      if (!db) {
        // ------------------------------------------
        // 2️⃣ Giai đoạn 2: Load dinh dưỡng
        // ------------------------------------------
        setIsLoadingNutrition(true);
        console.log("🔍 Bắt đầu lấy dinh dưỡng cho nguyên liệu...");

        const data = await fetchIngredientsNutrition(ingredientsArr);
        console.log("🔍 Kết quả từ mô hình mapping da co.");
        const nutrition = data.map((item) => {
          //   console.log(`\n🔍 Input: ${item.input}`);

          //   if (item.results && item.results.length > 0) {
          //     item.results.slice(0, 3).forEach((r, i) => {
          //       console.log(`  ${i + 1}. ${r.name_vi} - score: ${r.score.toFixed(3)}`);
          //       console.log(`     nutrition:`, r.nutrition);
          //     });
          //   } else {
          //     console.log(`  ⚠️ Không tìm thấy kết quả nào.`);
          //   }

          const firstResult = item.results?.[0];
          if (!firstResult) {
            return {
              input: item.input,
              name_vi: item.input,
              nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sugar: 0, sodium: 0 },
            };
          }
          return {
            input: item.input,
            name_vi: firstResult.name_vi,
            nutrition: {
              calories: +(firstResult.nutrition.calories || 0).toFixed(2),
              protein: +(firstResult.nutrition.protein || 0).toFixed(2),
              fat: +(firstResult.nutrition.fat || 0).toFixed(2),
              carbs: +(firstResult.nutrition.carbs || 0).toFixed(2),
              fiber: +(firstResult.nutrition.fiber || 0).toFixed(2),
              sugar: +(firstResult.nutrition.sugar || 0).toFixed(2),
              sodium: +(firstResult.nutrition.sodium || 0).toFixed(2),
            },
          };

        });
        console.log("\n✅ Dinh dưỡng tìm được từ mô hình mapping:", nutrition);
        setIsLoadingNutrition(false);

        ingredientsArr.forEach((ing, i) => {
          const nutri = nutrition[i].nutrition;
          const { amount, unit } = ing.quantity;

          let valueInGram = amount;
          const unitLower = unit?.toLowerCase();
          if (unitLower === "kg") valueInGram = amount * 1000;
          else if (unitLower === "mg") valueInGram = amount / 1000;
          else if (unitLower === "l" || unitLower === "ml") {
            valueInGram = unitLower === "l" ? amount * 1000 : amount;
          } else if (unitLower === "muỗng" || unitLower === "tbsp") {
            valueInGram = amount * 15;
          } else if (unitLower === "tsp") {
            valueInGram = amount * 5;
          }

          const factor = valueInGram / 100;
          totalNutrition.calories += nutri.calories * factor;
          totalNutrition.protein += nutri.protein * factor;
          totalNutrition.fat += nutri.fat * factor;
          totalNutrition.carbs += nutri.carbs * factor;
          totalNutrition.fiber += (nutri.fiber || 0) * factor;
          totalNutrition.sugar += (nutri.sugar || 0) * factor;
          totalNutrition.sodium += (nutri.sodium || 0) * factor;
        });
        for (const key in totalNutrition) {
          totalNutrition[key] = Math.round(totalNutrition[key] * 100) / 100;
        }


        setTotalNutrition(totalNutrition);
      }

      const warnings = analyzeHealthWarnings(totalNutrition);
      setHealthWarnings(warnings);

      // Scroll xuống kết quả
      setTimeout(() => {
        if (resultRef.current) {
          resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    } catch (error) {
      console.error("❌ handleCalculate error:", error);
    } finally {

    }
  };

  const skeletonWidths = [90, 80, 75, 85, 65, 70];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} sx={{ minHeight: "calc(100vh - 64px)" }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
              <TextField
                fullWidth
                label="Tên món ăn"
                variant="outlined"
                value={foodName || dishName}
                onChange={(e) => setDishName(e.target.value)}
                sx={{ mb: 0 }}
              />
            </Card>
          </Grid>
          {/* Hàng 1: Các bước nấu ăn */}
          {isLoading ? (
            <Grid item xs={12}>
              <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
                <Stack spacing={2}>
                  <Skeleton variant="text" width="40%" height={32} />
                  <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
                  <Stack direction="row" spacing={2}>
                    <Skeleton variant="rectangular" width={150} height={36} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rectangular" width={150} height={36} sx={{ borderRadius: 2 }} />
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          ) : (
            <Grid item xs={12}>
              <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={8}
                  value={instructions.length > 0 ? instructions.join("\n") : ""}
                  onChange={(e) => {
                    const steps = e.target.value.split("\n");
                    setInstructions(steps);
                  }}
                  label="Công thức nấu"
                  placeholder="Vui lòng nêu rõ định lượng các nguyên liệu để kết quả phân tích được chính xác nhất!"
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
                    Lưu vào thực đơn
                  </MDButton>
                </MDBox>
              </Card>
            </Grid>
          )}

        </Grid>


        <Grid container spacing={3} sx={{ mt: 0.1 }}>

          {isClick && (
            <Grid item xs={12} md={4} ref={resultRef}>
              <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3, maxHeight: 457, overflowY: "auto" }}>
                <MDTypography variant="h6" fontWeight="medium" gutterBottom>
                  Nguyên liệu
                </MDTypography>

                {/* Phần nội dung có điều kiện */}
                {isLoadingIngredients ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
                    {skeletonWidths.map((w, i) => (
                      <Skeleton
                        key={i}
                        variant="rounded"
                        height={22}
                        width={`${w}%`}
                        animation="wave"
                        sx={{ my: 0.5, borderRadius: 1 }}
                      />
                    ))}
                  </Box>

                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      marginTop: 1,
                      minHeight: 350,
                      overflowY: "auto",
                      borderRadius: 2,
                      scrollbarWidth: "thin",
                      "&::-webkit-scrollbar": { width: 6 },
                      "&::-webkit-scrollbar-thumb": { borderRadius: 3 },
                    }}
                  >
                    {ingredients.map((item, index) => (
                      <Box key={index} sx={{ width: "fit-content" }}>
                        <Chip
                          label={`${item.name}${item.quantity?.amount
                            ? ` — ${item.quantity.amount} ${item.quantity.unit}`
                            : ""
                            }`}
                          color="info"
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
                )}
              </Card>
            </Grid>
          )}

          {/* Cột phải - Dinh dưỡng */}
          {isSuccess && (
            <Grid item xs={12} md={8}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <MDBox mb={3}>
                      <MDTypography variant="h6">Thông tin dinh dưỡng</MDTypography>
                      <Divider sx={{ mb: 1 }} />

                      {isLoadingNutrition ? (
                        <Grid container spacing={1}>
                          {[...Array(8)].map((_, i) => (
                            <Grid item xs={6} sm={4} md={3} key={i}>
                              <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                              <Skeleton variant="text" sx={{ fontSize: '1rem' }} />

                              {/* <Skeleton variant="circular" width={40} height={40} />
                              <Skeleton variant="rectangular" width={210} height={60} />
                              <Skeleton variant="rounded" width={210} height={60} /> */}
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Grid container spacing={1}>
                          {totalNutrition &&
                            Object.entries(totalNutrition).map(([key, value]) => (
                              <Grid item xs={6} sm={4} md={3} key={key}>
                                <MDTypography variant="button" color="text">
                                  {key.charAt(0).toUpperCase() + key.slice(1)}:{" "}
                                  {value.toFixed(1)}
                                </MDTypography>
                              </Grid>
                            ))}
                        </Grid>
                      )}
                    </MDBox>
                  </Box>
                </Card>

                {/* Lưu ý sức khỏe */}
                {!isLoadingNutrition && healthWarnings.length > 0 && (
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
          )}
        </Grid>
      </MDBox>
    </DashboardLayout >
  );
}

export default AnalyzeRecipe;
