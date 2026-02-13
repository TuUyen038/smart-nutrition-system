import React from "react";
import { Box, IconButton, LinearProgress, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MDTypography from "components/MDTypography";
import PropTypes from "prop-types";
import { EllipsisText } from "helpers/ellipsisText";
import Pagination from "components/shared/Pagination";

function IngredientTable({
  loading,
  ingredients,
  pagination,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
  onPageChange,
}) {
  const handleSort = (field) => {
    if (onSort) {
      const newOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
      onSort(field, newOrder);
    }
  };

  // eslint-disable-next-line react/prop-types
  const SortableHeader = ({ field, children, textAlign = "left" }) => {
    if (!onSort) {
      return (
        <th
          style={{
            display: "table-cell",
            boxSizing: "border-box",
            padding: "10px 12px",
            borderBottom: "1px solid #d9d9d9",
            fontWeight: 600,
            whiteSpace: "nowrap",
            textAlign,
          }}
        >
          {children}
        </th>
      );
    }

    return (
      <th
        style={{
          display: "table-cell",
          boxSizing: "border-box",
          padding: "10px 12px",
          borderBottom: "1px solid #d9d9d9",
          fontWeight: 600,
          whiteSpace: "nowrap",
          cursor: "pointer",
          textAlign,
        }}
        onClick={() => handleSort(field)}
      >
        <Box display="flex" alignItems="center" gap={0.5}>
          {children}
          {sortBy === field && <span>{sortOrder === "asc" ? "↑" : "↓"}</span>}
        </Box>
      </th>
    );
  };

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
              minWidth: 1000,
              borderCollapse: "collapse",
              tableLayout: "fixed",
            }}
          >
            <colgroup>
              <col style={{ width: 200 }} />
              <col style={{ width: 180 }} />
              <col style={{ width: 80 }} />
              <col style={{ width: 55 }} />
              <col style={{ width: 55 }} />
              <col style={{ width: 55 }} />
              <col style={{ width: 55 }} />
              <col style={{ width: 55 }} />
              <col style={{ width: 75 }} />
              <col style={{ width: 70 }} />
              <col style={{ width: 90 }} />
            </colgroup>

            <thead style={{ display: "table-header-group" }}>
              <tr style={{ background: "#f5f5f5" }}>
                <SortableHeader field="name">
                  <MDTypography variant="button" fontWeight="medium">
                    Tên (VI)
                  </MDTypography>
                </SortableHeader>
                <SortableHeader field="name_en">
                  <MDTypography variant="button" fontWeight="medium">
                    Tên (EN)
                  </MDTypography>
                </SortableHeader>
                <th style={{ padding: "10px 12px", borderBottom: "1px solid #d9d9d9" }}>
                  <MDTypography variant="button" fontWeight="medium">
                    Nguồn
                  </MDTypography>
                </th>
                <SortableHeader field="calories" textAlign="right">
                  <MDTypography variant="button" fontWeight="medium">
                    Kcal
                  </MDTypography>
                </SortableHeader>
                <SortableHeader field="protein" textAlign="right">
                  <Tooltip title="Protein (Đạm)" placement="top">
                    <MDTypography variant="button" fontWeight="medium" sx={{ cursor: "help" }}>
                      P (g)
                    </MDTypography>
                  </Tooltip>
                </SortableHeader>
                <SortableHeader field="carbs" textAlign="right">
                  <Tooltip title="Carbohydrate (Tinh bột)" placement="top">
                    <MDTypography variant="button" fontWeight="medium" sx={{ cursor: "help" }}>
                      C (g)
                    </MDTypography>
                  </Tooltip>
                </SortableHeader>
                <SortableHeader field="fat" textAlign="right">
                  <Tooltip title="Fat (Chất béo)" placement="top">
                    <MDTypography variant="button" fontWeight="medium" sx={{ cursor: "help" }}>
                      F (g)
                    </MDTypography>
                  </Tooltip>
                </SortableHeader>
                <th
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid #d9d9d9",
                    textAlign: "right",
                  }}
                >
                  <Tooltip title="Fiber (Chất xơ)" placement="top">
                    <MDTypography variant="button" fontWeight="medium" sx={{ cursor: "help" }}>
                      Fi (g)
                    </MDTypography>
                  </Tooltip>
                </th>
                <th
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid #d9d9d9",
                    textAlign: "right",
                  }}
                >
                  <Tooltip title="Sugar (Đường)" placement="top">
                    <MDTypography variant="button" fontWeight="medium" sx={{ cursor: "help" }}>
                      S (g)
                    </MDTypography>
                  </Tooltip>
                </th>
                <th
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid #d9d9d9",
                    textAlign: "right",
                  }}
                >
                  <Tooltip title="Sodium (Natri)" placement="top">
                    <MDTypography variant="button" fontWeight="medium" sx={{ cursor: "help" }}>
                      Na (mg)
                    </MDTypography>
                  </Tooltip>
                </th>
                <th
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid #d9d9d9",
                    textAlign: "center",
                  }}
                >
                  <MDTypography variant="button" fontWeight="medium">
                    Thao tác
                  </MDTypography>
                </th>
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
                  return (
                    <tr
                      key={ing._id || idx}
                      style={{
                        borderBottom: "1px solid #eee",
                        background: idx % 2 === 1 ? "rgba(0,0,0,0.01)" : "transparent",
                      }}
                    >
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

                      <td
                        style={{
                          display: "table-cell",
                          boxSizing: "border-box",
                          padding: "10px 12px",
                          borderRight: "1px solid #eee",
                        }}
                      >
                        <EllipsisText
                          text={ing.nutrition?.source || ing.source || "-"}
                          variant="caption"
                        />
                      </td>

                      <td
                        style={{
                          padding: "10px 12px",
                          borderRight: "1px solid #eee",
                          textAlign: "right",
                        }}
                      >
                        <MDTypography variant="caption" color="text">
                          {ing.nutrition?.calories ?? "-"}
                        </MDTypography>
                      </td>

                      <td
                        style={{
                          padding: "10px 12px",
                          borderRight: "1px solid #eee",
                          textAlign: "right",
                        }}
                      >
                        <MDTypography variant="caption" color="text">
                          {ing.nutrition?.protein ?? "-"}
                        </MDTypography>
                      </td>

                      <td
                        style={{
                          padding: "10px 12px",
                          borderRight: "1px solid #eee",
                          textAlign: "right",
                        }}
                      >
                        <MDTypography variant="caption" color="text">
                          {ing.nutrition?.carbs ?? "-"}
                        </MDTypography>
                      </td>

                      <td
                        style={{
                          padding: "10px 12px",
                          borderRight: "1px solid #eee",
                          textAlign: "right",
                        }}
                      >
                        <MDTypography variant="caption" color="text">
                          {ing.nutrition?.fat ?? "-"}
                        </MDTypography>
                      </td>

                      <td
                        style={{
                          padding: "10px 12px",
                          borderRight: "1px solid #eee",
                          textAlign: "right",
                        }}
                      >
                        <MDTypography variant="caption" color="text">
                          {ing.nutrition?.fiber ?? "-"}
                        </MDTypography>
                      </td>

                      <td
                        style={{
                          padding: "10px 12px",
                          borderRight: "1px solid #eee",
                          textAlign: "right",
                        }}
                      >
                        <MDTypography variant="caption" color="text">
                          {ing.nutrition?.sugar ?? "-"}
                        </MDTypography>
                      </td>

                      <td
                        style={{
                          padding: "10px 12px",
                          borderRight: "1px solid #eee",
                          textAlign: "right",
                        }}
                      >
                        <MDTypography variant="caption" color="text">
                          {ing.nutrition?.sodium ?? "-"}
                        </MDTypography>
                      </td>

                      <td
                        style={{ padding: "6px 12px", textAlign: "center", whiteSpace: "nowrap" }}
                      >
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

      {/* Pagination */}
      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      )}

      {/* Results count */}
      {pagination && (
        <Box mt={2} textAlign="center">
          <MDTypography variant="caption" color="text">
            Hiển thị {ingredients.length} / {pagination.total} nguyên liệu
          </MDTypography>
        </Box>
      )}
    </Box>
  );
}

IngredientTable.propTypes = {
  loading: PropTypes.bool,
  ingredients: PropTypes.array.isRequired,
  pagination: PropTypes.shape({
    page: PropTypes.number,
    limit: PropTypes.number,
    total: PropTypes.number,
    totalPages: PropTypes.number,
  }),
  sortBy: PropTypes.string,
  sortOrder: PropTypes.oneOf(["asc", "desc"]),
  onSort: PropTypes.func,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onPageChange: PropTypes.func,
};

export default IngredientTable;
