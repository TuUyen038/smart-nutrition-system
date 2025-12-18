// src/layouts/admin/recipes/components/RecipeTable.jsx
import React from "react";
import { Box, IconButton, Tooltip, LinearProgress } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import PropTypes from "prop-types";

const CATEGORY_LABEL = {
  main: "Món chính",
  side: "Món phụ",
  dessert: "Tráng miệng",
  drink: "Đồ uống",
};

function Ellipsis({ text, variant = "caption", fontWeight }) {
  const safe = text ?? "-";
  return (
    <Tooltip title={safe} placement="top" arrow>
      <span
        style={{
          display: "block",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "100%",
        }}
      >
        <MDTypography variant={variant} fontWeight={fontWeight} noWrap>
          {safe}
        </MDTypography>
      </span>
    </Tooltip>
  );
}

Ellipsis.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  variant: PropTypes.string,
  fontWeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default function RecipeTable({ loading, recipes, onEdit, onDelete }) {
  return (
    <MDBox mt={2}>
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
        {/* scroll ngang nếu màn hình hẹp */}
        <Box sx={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: 860,
              borderCollapse: "collapse",
              tableLayout: "fixed",
            }}
          >
            <colgroup>
              <col style={{ width: "40%" }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 180 }} />
              <col style={{ width: 120 }} />
            </colgroup>

            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                {["Tên món", "Danh mục", "Khẩu phần", "Người tạo", "Thao tác"].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      textAlign: i === 2 ? "left" : i === 4 ? "center" : "left",
                      padding: "10px 12px",
                      borderBottom: "1px solid #d9d9d9",
                      borderRight: i === 4 ? "none" : "1px solid #e6e6e6",
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

            <tbody>
              {!loading && recipes.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 18, textAlign: "center" }}>
                    <MDTypography variant="button" color="text">
                      Chưa có món ăn nào.
                    </MDTypography>
                  </td>
                </tr>
              ) : (
                recipes.map((recipe) => (
                  <tr key={recipe._id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "10px 12px", borderRight: "1px solid #eee" }}>
                      <Ellipsis text={recipe.name} variant="button"  />
                    </td>

                    <td style={{ padding: "10px 12px", borderRight: "1px solid #eee" }}>
                      <Ellipsis text={CATEGORY_LABEL[recipe.category] || "-"} />
                    </td>

                    <td
                      style={{
                        padding: "10px 12px",
                        borderRight: "1px solid #eee",
                        textAlign: "left",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <MDTypography variant="caption" color="text">
                        {recipe.servings || 1}
                      </MDTypography>
                    </td>

                    <td style={{ padding: "10px 12px", borderRight: "1px solid #eee" }}>
                      <Ellipsis text={recipe.createdBy || "admin"} />
                    </td>

                    <td style={{ padding: "6px 12px", textAlign: "center", whiteSpace: "nowrap" }}>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton size="small" onClick={() => onEdit(recipe)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton size="small" color="error" onClick={() => onDelete(recipe)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Box>
      </Box>
    </MDBox>
  );
}

RecipeTable.propTypes = {
  loading: PropTypes.bool,
  recipes: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string,
      category: PropTypes.string,
      servings: PropTypes.number,
      createdBy: PropTypes.string,
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

RecipeTable.defaultProps = { loading: false };
