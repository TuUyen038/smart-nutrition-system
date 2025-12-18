import React from "react";
import { Box, Chip, IconButton, LinearProgress, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MDTypography from "components/MDTypography";
import PropTypes from "prop-types";
import { EllipsisText } from "helpers/ellipsisText";

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

function IngredientTable({ loading, ingredients, onEdit, onDelete }) {
  return (
    <Box width="100%">
      {loading && <LinearProgress sx={{ mb: 1 }} />}

      <Box
        sx={{
          border: "1px solid",
          borderColor: "grey.300",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "background.paper",
          width: "100%",
        }}
      >
        <Box sx={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: 1000, // ✅ bảng nhiều cột => cần minWidth để scroll ngang
              borderCollapse: "collapse",
              tableLayout: "fixed",
            }}
          >
            {/* ✅ khóa width cột => header & body luôn khớp */}
            <colgroup>
              <col style={{ width: 200 }} />  {/* Tên (VI) */}
              <col style={{ width: 200 }} />  {/* Tên (EN) */}
              <col style={{ width: 80 }} />  {/* Nhóm */}
              <col style={{ width: 60 }} />   {/* Đơn vị */}
              <col style={{ width: 55 }} />   {/* Kcal */}
              <col style={{ width: 55 }} />   {/* P */}
              <col style={{ width: 55 }} />   {/* C */}
              <col style={{ width: 55 }} />   {/* F */}
              <col style={{ width: 75 }} />   {/* Đường */}
              <col style={{ width: 70 }} />   {/* Na */}
              <col style={{ width: 90 }} />  {/* Thao tác */}
            </colgroup>

            <thead style={{ display: "table-header-group" }}>
              <tr style={{ background: "#f5f5f5" }}>
                {[
                  "Tên (VI)",
                  "Tên (EN)",
                  "Nhóm",
                  "Đơn vị",
                  "Kcal",
                  "P (g)",
                  "C (g)",
                  "F (g)",
                  "Đường (g)",
                  "Na (mg)",
                  "Thao tác",
                ].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      display: "table-cell",
                      boxSizing: "border-box",
                      textAlign:
                        h === "Thao tác"
                          ? "center"
                          : ["Kcal", "P (g)", "C (g)", "F (g)", "Đường (g)", "Na (mg)"].includes(h)
                          ? "right"
                          : "left",
                      padding: "10px 12px",
                      borderBottom: "1px solid #d9d9d9",
                      borderRight: i === 10 ? "none" : "1px solid #e6e6e6",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <MDTypography variant="button" fontWeight="medium">
                      {h}
                    </MDTypography>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody style={{ display: "table-row-group" }}>
              {!loading && ingredients.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: 18, textAlign: "center" }}>
                    <MDTypography variant="button" color="text">
                      Chưa có nguyên liệu nào. Hãy thêm mới.
                    </MDTypography>
                  </td>
                </tr>
              ) : (
                ingredients.map((ing, idx) => {
                  const cat = ing.category || "other";
                  return (
                    <tr
                      key={ing._id || idx}
                      style={{
                        borderBottom: "1px solid #eee",
                        background: idx % 2 === 1 ? "rgba(0,0,0,0.01)" : "transparent",
                      }}
                    >
                      {/* VI */}
                      <td
                        style={{
                          display: "table-cell",
                          boxSizing: "border-box",
                          padding: "10px 12px",
                          borderRight: "1px solid #eee",
                        }}
                      >
                        <EllipsisText text={ing.name} variant="button" fontWeight="medium" />
                      </td>

                      {/* EN */}
                      <td
                        style={{
                          display: "table-cell",
                          boxSizing: "border-box",
                          padding: "10px 12px",
                          borderRight: "1px solid #eee",
                        }}
                      >
                        <EllipsisText text={ing.name_en || "-"} variant="caption" />
                      </td>

                      {/* Nhóm */}
                      <td
                        style={{
                          display: "table-cell",
                          boxSizing: "border-box",
                          padding: "10px 12px",
                          borderRight: "1px solid #eee",
                        }}
                      >
                        <Chip
                          label={CATEGORY_LABELS[cat] || "Khác"}
                          color={CATEGORY_COLORS[cat] || "default"}
                          size="small"
                          variant="outlined"
                        />
                      </td>

                      {/* Đơn vị */}
                      <td
                        style={{
                          display: "table-cell",
                          boxSizing: "border-box",
                          padding: "10px 12px",
                          borderRight: "1px solid #eee",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <MDTypography variant="caption" color="text">
                          {ing.unit || "g"}
                        </MDTypography>
                      </td>

                      {/* Kcal */}
                      <td style={{ padding: "10px 12px", borderRight: "1px solid #eee", textAlign: "right" }}>
                        <MDTypography variant="caption" color="text">
                          {ing.nutrition?.calories ?? "-"}
                        </MDTypography>
                      </td>

                      {/* P */}
                      <td style={{ padding: "10px 12px", borderRight: "1px solid #eee", textAlign: "right" }}>
                        <MDTypography variant="caption" color="text">
                          {ing.nutrition?.protein ?? "-"}
                        </MDTypography>
                      </td>

                      {/* C */}
                      <td style={{ padding: "10px 12px", borderRight: "1px solid #eee", textAlign: "right" }}>
                        <MDTypography variant="caption" color="text">
                          {ing.nutrition?.carbs ?? "-"}
                        </MDTypography>
                      </td>

                      {/* F */}
                      <td style={{ padding: "10px 12px", borderRight: "1px solid #eee", textAlign: "right" }}>
                        <MDTypography variant="caption" color="text">
                          {ing.nutrition?.fat ?? "-"}
                        </MDTypography>
                      </td>

                      {/* Đường */}
                      <td style={{ padding: "10px 12px", borderRight: "1px solid #eee", textAlign: "right" }}>
                        <MDTypography variant="caption" color="text">
                          {ing.nutrition?.sugar ?? "-"}
                        </MDTypography>
                      </td>

                      {/* Na */}
                      <td style={{ padding: "10px 12px", borderRight: "1px solid #eee", textAlign: "right" }}>
                        <MDTypography variant="caption" color="text">
                          {ing.nutrition?.sodium ?? "-"}
                        </MDTypography>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "6px 12px", textAlign: "center", whiteSpace: "nowrap" }}>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton size="small" onClick={() => onEdit(ing)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton size="small" color="error" onClick={() => onDelete(ing)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </Box>
      </Box>
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
