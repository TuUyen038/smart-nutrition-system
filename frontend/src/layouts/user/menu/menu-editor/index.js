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
import { useLocation } from "react-router-dom";
function MenuCreation() {
  const location = useLocation();
  const { selectedCombo, filters } = location.state || {};

  const [menuData, setMenuData] = useState(() => {
    const clone = {};
    if (selectedCombo) {
      Object.entries(selectedCombo).forEach(([label, combos]) => {
        clone[label] = [...combos];
      });
    }
    return clone;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [newDish, setNewDish] = useState({
    title: "",
    label: "",
    description: "",
    image: "",
    time: "Sáng",
  });

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box py={3}>
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" mb={2}>
            Thêm món ăn mới
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Bữa</InputLabel>
                <Select
                  value={newDish.time}
                  onChange={(e) => setNewDish({ ...newDish, time: e.target.value })}
                >
                  <MenuItem value="Sáng">Sáng</MenuItem>
                  <MenuItem value="Trưa">Trưa</MenuItem>
                  <MenuItem value="Tối">Tối</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <input
                placeholder="Tên món"
                value={newDish.title}
                onChange={(e) => setNewDish({ ...newDish, title: e.target.value })}
                style={{ width: "100%", padding: "10px" }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <input
                placeholder="Kcal"
                value={newDish.label}
                onChange={(e) => setNewDish({ ...newDish, label: e.target.value })}
                style={{ width: "100%", padding: "10px" }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                onClick={() => {
                  const updated = { ...menuData };
                  const firstLabel = Object.keys(menuData)[0];
                  updated[firstLabel].push({ ...newDish, id: Date.now() });
                  setMenuData(updated);
                  setNewDish({ title: "", label: "", description: "", image: "", time: "Sáng" });
                }}
              >
                Thêm món
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Gợi ý thực đơn */}
        {selectedCombo ? (
          Object.entries(selectedCombo).map(([label, combos]) => (
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
                            <Button
                              size="small"
                              color="error"
                              onClick={() => {
                                const updated = { ...menuData };
                                const firstLabel = Object.keys(menuData)[0];
                                updated[firstLabel] = updated[firstLabel].filter(
                                  (d) => d.id !== item.id
                                );
                                setMenuData(updated);
                              }}
                            >
                              Xóa
                            </Button>
                          </Box>
                        )}
                      />
                    </Box>
                  );
                })}
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
