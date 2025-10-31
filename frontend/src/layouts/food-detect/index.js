import React, { useState } from "react";
import {
  Grid,
  Button,
  Input,
  Card,
  CardMedia,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Box, width } from "@mui/system";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { detectFood } from "../../services/recipeApi";

function DetectFood() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [recipe, setRecipe] = useState("");
  const [nutrition, setNutrition] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState(null); // Trạng thái lỗi
  // Trạng thái kết quả, khớp với cấu trúc JSON của Backend
  const [analysisData, setAnalysisData] = useState(null);
  const [fileToUpload, setFileToUpload] = useState(null); // Lưu file gốc

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 1. Thiết lập trạng thái ban đầu
      setFileToUpload(file);
      setSelectedImage(URL.createObjectURL(file));
      setAnalysisData(null);
      setError(null);
      setLoading(true);

      // 2. GỌI HÀM API THỰC TẾ
      uploadAndAnalyze(file);
    }
  };

  const uploadAndAnalyze = async (file) => {
    try {
      const result = await detectFood(file);
      // Kiểm tra xem result có phải là JSON hợp lệ và có đủ trường không
      if (result) {
        setAnalysisData(result);
      } else {
        // Xử lý trường hợp Gemini trả về JSON không đúng format
        throw new Error("Dữ liệu phân tích không đúng cấu trúc.");
      }
    } catch (err) {
      setError(err.message || "Lỗi không xác định khi phân tích ảnh món ăn.");
      setAnalysisData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveToRecipe = () => {
    navigate(`/analyze-recipe?dish=${encodeURIComponent(analysisData)}`);
  };
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} sx={{ minHeight: "calc(100vh - 64px)" }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={12}>
            <Card sx={{ p: 3 }}>
              {/* Chọn ảnh */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" mb={1}>
                  Ảnh món ăn:
                </Typography>
              </Box>

              <label htmlFor="upload-photo">
                <Input
                  id="upload-photo"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  sx={{ display: "none" }}
                />
                <Box
                  sx={{
                    height: 300,
                    width: "60%",
                    border: "1px dashed #ccc",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#fafafa",
                    margin: "0 auto",
                    mb: 3,
                    cursor: "pointer", // 👈 giúp người dùng biết có thể click
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      backgroundColor: "#f0f0f0",
                    },
                  }}
                >
                  {selectedImage ? (
                    <CardMedia
                      component="img"
                      image={selectedImage}
                      alt="Uploaded food"
                      sx={{
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 2,
                        margin: 0,
                      }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      + Click vào đây để chọn ảnh
                    </Typography>
                  )}
                </Box>
              </label>

              {loading ? (
                <Box textAlign="center">
                  <CircularProgress color="info" />
                  <Typography variant="body2" mt={1}>
                    Đang xử lý ảnh...
                  </Typography>
                </Box>
              ) : analysisData ? (
                <>
                  <Grid container spacing={1} alignItems="center" mb={5}>
                    <Grid item xs={6} md={3} lg={2}>
                      <MDTypography variant="h6" fontWeight="medium">
                        Kết quả nhận diện:
                      </MDTypography>
                    </Grid>
                    <Grid item xs={6} md={3} lg={3}>
                      <Typography variant="body2">{analysisData}</Typography>
                    </Grid>
                  </Grid>
                  {/* <MDTypography variant="h6" fontWeight="medium">
                    Công thức nấu
                  </MDTypography>
                  {console.log(result.recipe)}
                  <Typography variant="body2">{result.recipe}</Typography>
                  <Divider sx={{ my: 2 }} />
                  <MDTypography variant="h6" fontWeight="medium">
                    Thành phần dinh dưỡng
                  </MDTypography>
                  {console.log(result.totalNutrition)}
                  <Typography variant="body2">{result.totalNutrition}</Typography>
                  <Divider sx={{ my: 2 }} />
                  <MDTypography variant="h6" fontWeight="medium">
                    Cảnh báo
                  </MDTypography>
                  {console.log(result.Recommendation.phuHopVoi)}
                  <Typography variant="body2" mb={3}>
                    {result.Recommendation.phuHopVoi}
                  </Typography> */}
                  <Grid item xs={12} sm={6} lg={12}>
                    <MDBox display="flex" gap={2} flexWrap="wrap">
                      <MDButton variant="contained" color="info" onClick={handleMoveToRecipe}>
                        Xem chi tiết
                      </MDButton>
                      <label htmlFor="upload-photo">
                        <Input
                          id="upload-photo"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          sx={{ display: "none" }}
                        />
                        <MDButton variant="contained" component="span" color="primary">
                          Chọn ảnh khác
                        </MDButton>
                      </label>
                    </MDBox>
                  </Grid>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary"></Typography>
              )}
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}
export default DetectFood;
