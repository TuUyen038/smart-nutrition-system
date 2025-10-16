import React, { useState } from "react";
import {
  Grid,
  Card,
  Box,
  LinearProgress,
  Typography,
  IconButton,
  Button,
  Divider,
} from "@mui/material";
import MDTypography from "components/MDTypography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

const MenuList = () => {
  // ✅ Chuyển từ const meal sang state để có thể toggle
  const [menu, setMenu] = useState([
    {
      id: 1,
      name: "Cơm tấm sườn bì chả",
      calories: 720,
      protein: 40,
      image: "",
      eaten: false,
    },
    {
      id: 2,
      name: "Bún bò Huế",
      calories: 550,
      protein: 30,
      image: "",
      eaten: true,
    },
    {
      id: 3,
      name: "Gỏi cuốn tôm thịt",
      calories: 300,
      protein: 20,
      image: "",
      eaten: false,
    },
    {
      id: 4,
      name: "Cháo cá lóc",
      calories: 400,
      protein: 25,
      image: "",
      eaten: true,
    },
  ]);

  const handleToggleEaten = (id) => {
    setMenu((prev) =>
      prev.map((item) => (item.id === id ? { ...item, eaten: !item.eaten } : item))
    );
  };

  // ✅ Tính toán tiến độ kcal
  const totalCalories = menu.reduce((sum, m) => sum + m.calories, 0);
  const eatenCalories = menu.filter((m) => m.eaten).reduce((sum, m) => sum + m.calories, 0);
  const progress = Math.round((eatenCalories / totalCalories) * 100);

  return (
    <Box>
      {/* Thanh tiến độ tổng */}
      <Box sx={{ position: "relative", mb: 1 }}>
        {/* Thanh nền */}
        <Box
          sx={{
            height: 12,
            borderRadius: 5,
            bgcolor: "#f0f0f0",
            overflow: "hidden",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.15)",
          }}
        >
          {/* Thanh màu tiến độ */}
          <Box
            sx={{
              width: `${progress}%`,
              height: "100%",
              borderRadius: 5,
              background: "linear-gradient(90deg, #4caf50 0%, #81c784 100%)",
              transition: "width 0.4s ease",
            }}
          />
        </Box>
      </Box>

      <MDTypography variant="button" color="text" mb={2} display="block">
        Đã nạp {eatenCalories} / {totalCalories} kcal ({progress}%)
      </MDTypography>

      {/* Danh sách món */}
      <Grid container spacing={1}>
        {menu.map((meal) => (
          <Grid item xs={12} md={6} lg={4} key={meal.id}>
            <Card
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1.5,
                borderRadius: 3,
                boxShadow: meal.eaten ? 2 : 1,
                bgcolor: meal.eaten ? "action.selected" : "background.paper",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: 3,
                  transform: "translateY(-2px)",
                },
              }}
            >
              {/* Nội dung món ăn */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexGrow: 1,
                  gap: 1.5,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <MDTypography variant="h6" color="dark" mb={1}>
                    {meal.name}
                  </MDTypography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                    Bữa sáng
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                    {meal.calories} kcal • {meal.protein}g protein
                  </Typography>
                </Box>
              </Box>

              {/* Nút check */}
              <IconButton
                onClick={() => handleToggleEaten(meal.id)}
                color={meal.eaten ? "success" : "default"}
                sx={{
                  ml: 1,
                  transition: "0.2s",
                  "&:hover": {
                    color: meal.eaten ? "success.dark" : "primary.main",
                  },
                }}
              >
                {meal.eaten ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
              </IconButton>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MenuList;
