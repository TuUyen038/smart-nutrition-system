// src/layouts/admin/ingredients/components/IngredientTable.jsx
import React from "react";
import {
  Box,
  Chip,
  IconButton,
  LinearProgress,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MDTypography from "components/MDTypography";
import PropTypes from "prop-types";

const CATEGORY_LABELS = {
  protein: "Protein",
  carb: "Carb",
  fat: "Chất béo",
  vegetable: "Rau củ",
  fruit: "Trái cây",
  dairy: "Sữa & chế phẩm",
  seasoning: "Gia vị",
  beverage: "Thức uống",
  other: "Khác",
};

const CATEGORY_COLORS = {
  protein: "primary",
  carb: "success",
  fat: "warning",
  vegetable: "success",
  fruit: "secondary",
  dairy: "info",
  seasoning: "default",
  beverage: "info",
  other: "default",
};

// Định nghĩa cột 1 lần để header & row dùng chung
const columns = [
  { id: "name", header: "Tên (VI)", align: "left" },
  { id: "name_en", header: "Tên (EN)", align: "left" },
  { id: "category", header: "Nhóm", align: "left" },
  { id: "unit", header: "Đơn vị", align: "left" },
  { id: "calories", header: "Kcal", align: "right" },
  { id: "protein", header: "P (g)", align: "right" },
  { id: "carbs", header: "C (g)", align: "right" },
  { id: "fat", header: "F (g)", align: "right" },
  { id: "sugar", header: "Đường (g)", align: "right" },
  { id: "sodium", header: "Na (mg)", align: "right" },
  { id: "actions", header: "Thao tác", align: "center" },
];

// Layout grid dùng chung cho header & row
// 2 cột tên rộng, 1 cột nhóm, 1 cột đơn vị, 6 cột số, 1 cột thao tác
const GRID_TEMPLATE =
  "minmax(160px, 2.2fr) minmax(160px, 2.2fr) 1.2fr 0.7fr 0.7fr 0.7fr 0.7fr 0.7fr 0.9fr 0.9fr 0.9fr";

const getTextAlign = (align) => {
  if (align === "right") return "right";
  if (align === "center") return "center";
  return "left";
};

function IngredientTable({ loading, ingredients, onEdit, onDelete }) {
  return (
    <Box width="100%">
      {loading && <LinearProgress sx={{ mb: 1 }} />}

      {/* HEADER */}
      <Box
        display="grid"
        gridTemplateColumns={GRID_TEMPLATE}
        columnGap={2}
        px={2}
        py={1.5}
        sx={{
          borderRadius: "12px 12px 0 0",
          bgcolor: "#f5f5f5",
        }}
      >
        {columns.map((col) => (
          <Box
            key={col.id}
            sx={{
              textAlign: getTextAlign(col.align),
              whiteSpace: "nowrap",
            }}
          >
            <MDTypography variant="button" fontWeight="medium">
              {col.header}
            </MDTypography>
          </Box>
        ))}
      </Box>

      <Divider />

      {/* EMPTY STATE */}
      {ingredients.length === 0 && !loading && (
        <Box px={2} py={3} textAlign="center">
          <MDTypography variant="button" color="text">
            Chưa có nguyên liệu nào. Hãy thêm mới.
          </MDTypography>
        </Box>
      )}

      {/* ROWS */}
      {ingredients.map((ing, index) => (
        <React.Fragment key={ing._id || index}>
          <Box
            display="grid"
            gridTemplateColumns={GRID_TEMPLATE}
            columnGap={2}
            px={2}
            py={1}
            alignItems="center"
            sx={{
              "&:nth-of-type(2n)": {
                bgcolor: "rgba(0,0,0,0.01)",
              },
            }}
          >
            {/* Tên (VI) */}
            <Box sx={{ textAlign: "left", overflow: "hidden" }}>
              <MDTypography
                variant="button"
                fontWeight="medium"
                sx={{
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                {ing.name}
              </MDTypography>
            </Box>

            {/* Tên (EN) */}
            <Box sx={{ textAlign: "left", overflow: "hidden" }}>
              <MDTypography
                variant="caption"
                color="text"
                sx={{
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                {ing.name_en || "-"}
              </MDTypography>
            </Box>

            {/* Nhóm */}
            <Box sx={{ textAlign: "left" }}>
              {(() => {
                const cat = ing.category || "other";
                return (
                  <Chip
                    label={CATEGORY_LABELS[cat] || "Khác"}
                    color={CATEGORY_COLORS[cat] || "default"}
                    size="small"
                    variant="outlined"
                  />
                );
              })()}
            </Box>

            {/* Đơn vị */}
            <Box sx={{ textAlign: "left" }}>
              <MDTypography variant="caption" color="text">
                {ing.unit || "g"}
              </MDTypography>
            </Box>

            {/* Kcal */}
            <Box sx={{ textAlign: "right" }}>
              <MDTypography variant="caption" color="text">
                {ing.nutrition?.calories ?? "-"}
              </MDTypography>
            </Box>

            {/* P */}
            <Box sx={{ textAlign: "right" }}>
              <MDTypography variant="caption" color="text">
                {ing.nutrition?.protein ?? "-"}
              </MDTypography>
            </Box>

            {/* C */}
            <Box sx={{ textAlign: "right" }}>
              <MDTypography variant="caption" color="text">
                {ing.nutrition?.carbs ?? "-"}
              </MDTypography>
            </Box>

            {/* F */}
            <Box sx={{ textAlign: "right" }}>
              <MDTypography variant="caption" color="text">
                {ing.nutrition?.fat ?? "-"}
              </MDTypography>
            </Box>

            {/* Đường */}
            <Box sx={{ textAlign: "right" }}>
              <MDTypography variant="caption" color="text">
                {ing.nutrition?.sugar ?? "-"}
              </MDTypography>
            </Box>

            {/* Na */}
            <Box sx={{ textAlign: "right" }}>
              <MDTypography variant="caption" color="text">
                {ing.nutrition?.sodium ?? "-"}
              </MDTypography>
            </Box>

            {/* Thao tác */}
            <Box sx={{ textAlign: "center" }}>
              <IconButton size="small" onClick={() => onEdit(ing)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(ing)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Divider />
        </React.Fragment>
      ))}
    </Box>
  );
}

IngredientTable.propTypes = {
  loading: PropTypes.bool,
  ingredients: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      name_en: PropTypes.string,
      unit: PropTypes.string,
      category: PropTypes.string,
      nutrition: PropTypes.shape({
        calories: PropTypes.number,
        protein: PropTypes.number,
        fat: PropTypes.number,
        carbs: PropTypes.number,
        fiber: PropTypes.number,
        sugar: PropTypes.number,
        sodium: PropTypes.number,
      }),
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default IngredientTable;
