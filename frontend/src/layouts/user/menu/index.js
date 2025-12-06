import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fade,
  Paper,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DefaultFoodCard from "examples/Cards/FoodCards/DefaultFoodCard";
import MDTypography from "components/MDTypography";
import CustomList from "components/CustomList";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import { useNavigate } from "react-router-dom";

function MenuCreation() {
  const [filters, setFilters] = useState({ goal: "", duration: "" });
  const [comboByDuration, setComboByDuration] = useState({});

  const navigate = useNavigate();

  const handleSelectCombo = () => {
    navigate("/edit-menu", {
      state: {
        selectedCombo: comboByDuration, // truyền dữ liệu sang trang phụ
        filters,
      },
    });
  };

  useEffect(() => {
    if (filters.goal && filters.duration) {
      // Giả lập dữ liệu theo ngày hoặc tuần
      const mockCombos = {
        ngay: {
          Combo: [
            {
              time: "Sáng",
              id: 1,
              image: "/images/banh-mi-op-la.jpg",
              title: "Bánh mì",
              description:
                "Năng lượng cho buổi sángNăng lượng cho buổi sángNăng lượng cho buổi sángNăng lượng cho buổi sángNăng lượng cho buổi sángNăng lượng cho buổi sáng",
              label: "350 kcal",
            },
            {
              time: "Sáng",
              id: 2,
              image: "/images/banh-mi-op-la.jpg",
              title: "Bún",
              description: "Năng lượng cho buổi sáng",
              label: "350 kcal",
            },
            {
              time: "Sáng",
              id: 2,
              image: "/images/banh-mi-op-la.jpg",
              title: "Bún",
              description: "Năng lượng cho buổi sáng",
              label: "350 kcal",
            },
            {
              time: "Sáng",
              id: 2,
              image: "/images/banh-mi-op-la.jpg",
              title: "Bún",
              description: "Năng lượng cho buổi sáng",
              label: "350 kcal",
            },
            {
              time: "Sáng",
              id: 2,
              image: "/images/banh-mi-op-la.jpg",
              title: "Bún",
              description: "Năng lượng cho buổi sáng",
              label: "350 kcal",
            },
            {
              time: "Sáng",
              id: 2,
              image: "/images/banh-mi-op-la.jpg",
              title: "Bún",
              description: "Năng lượng cho buổi sáng",
              label: "350 kcal",
            },
            {
              time: "Trưa",
              id: 3,
              image: "/images/com-ca-hoi.jpg",
              title: "Cơm cá hồi",
              description: "Giàu protein, phù hợp tăng cơ",
              label: "520 kcal",
            },
            {
              time: "Tối",
              id: 4,
              image: "/images/pho-chay.jpg",
              title: "Phở chay",
              description: "Thanh đạm, phù hợp ăn chay",
              label: "300 kcal",
            },
          ],
        },
        tuan: {
          "Thứ Hai": [
            {
              id: 4,
              image: "/images/salad-uc-ga.jpg",
              title: "Salad ức gà",
              description: "Nhẹ nhàng, phù hợp giảm cân",
              label: "400 kcal",
            },
            {
              id: 4,
              image: "/images/salad-uc-ga.jpg",
              title: "Salad ức gà",
              description: "Nhẹ nhàng, phù hợp giảm cân",
              label: "400 kcal",
            },
            {
              id: 4,
              image: "/images/salad-uc-ga.jpg",
              title: "Salad ức gà",
              description: "Nhẹ nhàng, phù hợp giảm cân",
              label: "400 kcal",
            },
            {
              id: 4,
              image: "/images/salad-uc-ga.jpg",
              title: "Salad ức gà",
              description: "Nhẹ nhàng, phù hợp giảm cân",
              label: "400 kcal",
            },
          ],
          "Thứ Ba": [
            {
              id: 5,
              image: "/images/com-ca-hoi.jpg",
              title: "Cơm cá hồi",
              description: "Tăng cơ hiệu quả",
              label: "520 kcal",
            },
          ],
        },
      };
      setComboByDuration(mockCombos[filters.duration]);
    } else {
      setComboByDuration({});
    }
  }, [filters]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box py={3}>
        {/* Bộ lọc mục tiêu và thời gian */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="goal">Mục tiêu</InputLabel>
                <Select
                  labelId="goal-label"
                  id="goal"
                  value={filters.goal}
                  onChange={(e) => setFilters({ ...filters, goal: e.target.value })}
                  label="Mục tiêu"
                  sx={{
                    padding: "14px 4px 0.75rem !important",
                    fontSize: "1rem",
                    "& .MuiOutlinedInput-input": { padding: "12px 0.75rem" },
                  }}
                >
                  <MenuItem value="giam_can">Giảm cân</MenuItem>
                  <MenuItem value="tang_co">Tăng cơ</MenuItem>
                  <MenuItem value="can_bang">Cân bằng</MenuItem>
                  <MenuItem value="an_chay">Ăn chay</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="time">Thời gian</InputLabel>
                <Select
                  labelId="time-label"
                  id="time"
                  value={filters.duration}
                  onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
                  label="Thời gian"
                  sx={{
                    padding: "14px 4px 0.75rem !important",
                    fontSize: "1rem",
                    "& .MuiOutlinedInput-input": { padding: "12px 0.75rem" },
                  }}
                >
                  <MenuItem value="ngay">Theo ngày</MenuItem>
                  <MenuItem value="tuan">Theo tuần</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Gợi ý thực đơn */}
        {Object.keys(comboByDuration).length > 0 ? (
          Object.entries(comboByDuration).map(([label, combos]) => (
            <Accordion key={label} defaultExpanded sx={{ mb: 0 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="button" color="text" sx={{ whiteSpace: "nowrap" }}>
                  {label}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {["Sáng", "Trưa", "Tối"].map((mealTime) => {
                  const items = combos.filter((c) => c.time === mealTime);
                  return (
                    <Box key={mealTime} mb={4}>
                      <MDBox display="flex" alignItems="center" gap={2} mb={0}>
                        <MDTypography variant="button" color="text" sx={{ whiteSpace: "nowrap" }}>
                          {mealTime}
                        </MDTypography>
                        <Divider sx={{ flexGrow: 1 }} />
                      </MDBox>

                      <CustomList
                        items={items}
                        renderItem={(item) => (
                          <Box sx={{ px: 1, m: 1 }}>
                            <DefaultFoodCard
                              image={item.image}
                              label={item.label}
                              title={item.title}
                              description={item.description}
                            />
                          </Box>
                        )}
                      />
                    </Box>
                  );
                })}
                <Box display="flex" justifyContent="center" mt={3}>
                  <MDButton
                    variant="contained"
                    color="info"
                    size="large"
                    onClick={handleSelectCombo}
                  >
                    Chọn combo
                  </MDButton>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <MDTypography variant="body2" color="text" textAlign="center" mt={4}>
            Vui lòng chọn mục tiêu và thời gian để xem gợi ý thực đơn.
          </MDTypography>
        )}
      </Box>
    </DashboardLayout>
  );
}

export default MenuCreation;
