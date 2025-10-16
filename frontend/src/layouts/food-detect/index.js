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
import { Box, width } from "@mui/system";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
function DetectFood() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [recipe, setRecipe] = useState("");
  const [nutrition, setNutrition] = useState("");
  const [note, setNote] = useState("");

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setLoading(true);
      setResult("");
      setRecipe("");
      setNutrition("");
      setNote("");

      setTimeout(() => {
        setResult("Phở bò");
        setRecipe("Nước dùng từ xương bò, bánh phở, thịt bò tái, rau thơm, chanh, tương ớt.");
        setNutrition("Calo: 350, Protein: 25g, Carb: 40g, Chất béo: 10g");
        setNote("Thích hợp cho bữa sáng. Không nên ăn quá muộn nếu bạn đang giảm cân.");
        setLoading(false);
      }, 2000);
    }
  };

  const handleSave = () => {
    alert("Đã lưu vào lịch sử ăn uống!");
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
              ) : result ? (
                <>
                  <Typography variant="h5" mb={0}>
                    Kết quả nhận diện: {result}
                  </Typography>

                  <Divider sx={{ my: 2 }} />
                  <MDTypography variant="h6" fontWeight="medium">
                    Công thức nấu
                  </MDTypography>
                  <Typography variant="body2">{recipe}</Typography>

                  <Divider sx={{ my: 2 }} />
                  <MDTypography variant="h6" fontWeight="medium">
                    Thành phần dinh dưỡng
                  </MDTypography>
                  <Typography variant="body2">{nutrition}</Typography>

                  <Divider sx={{ my: 2 }} />
                  <MDTypography variant="h6" fontWeight="medium">
                    Cảnh báo
                  </MDTypography>
                  <Typography variant="body2" mb={3}>
                    {note}
                  </Typography>
                  <Grid item xs={12} sm={6} lg={12}>
                    <MDBox display="flex" gap={2} flexWrap="wrap">
                      <MDButton variant="contained" color="info" onClick={handleSave}>
                        Lưu vào lịch sử ăn uống
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
