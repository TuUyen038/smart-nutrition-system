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
import { detectFood } from "../../../services/recipeApi";

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
    // Kiểm tra MIME type thật
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn đúng định dạng ảnh!");
      return;
    }

    // (Tùy chọn) Kiểm tra kích thước tệp
    if (file.size > 5 * 1024 * 1024) { // > 5MB
      alert("Ảnh quá lớn, vui lòng chọn ảnh dưới 5MB!");
      return;
    }
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
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            {/* --- Khu vực chọn ảnh --- */}
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
                  height: 400,
                  width: 'fit-content',
                  minWidth: '40%',
                  border: "1px dashed #ccc",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#fafafa",
                  margin: "0 auto",
                  mb: 4,
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: "#f0f0f0",
                  },
                  pb: 2,
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
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    + Click vào đây để chọn ảnh
                  </Typography>
                )}
              </Box>
            </label>

            {/* --- Hiển thị kết quả AI hoặc trạng thái --- */}
            {loading ? (
              <Box textAlign="center">
                <CircularProgress color="info" />
                <Typography variant="body2" mt={1}>
                  Đang xử lý ảnh...
                </Typography>
              </Box>
            ) : (
              <>
                {analysisData ? (
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

                    <Grid item xs={12}>
                      <MDBox display="flex" gap={2} flexWrap="wrap">
                        <MDButton
                          variant="contained"
                          color="info"
                          onClick={handleMoveToRecipe}
                        >
                          Xem chi tiết
                        </MDButton>
                        <label htmlFor="upload-photo-alt">
                          <Input
                            id="upload-photo-alt"
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
                  selectedImage && (
                    <Grid container spacing={1} alignItems="center" mb={5}>
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          Không thể nhận diện được món ăn! Vui lòng thử lại với ảnh khác.
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <MDBox display="flex" gap={2} flexWrap="wrap">
                          <label htmlFor="upload-photo-alt">
                            <Input
                              id="upload-photo-alt"
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
                    </Grid>
                  )
                )}
              </>
            )}
          </Card>
        </Grid>
      </Grid>
    </MDBox>
  </DashboardLayout>
);

}
export default DetectFood;
