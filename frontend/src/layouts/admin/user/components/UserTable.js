import React from "react";
import { Box, Chip, IconButton, LinearProgress, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MDTypography from "components/MDTypography";
import PropTypes from "prop-types";
import { EllipsisText } from "helpers/ellipsisText";

const GENDER_LABELS = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
};

const GENDER_COLORS = {
  male: "primary",
  female: "secondary",
  other: "default",
};

const GOAL_LABELS = {
  lose_weight: "Giảm cân",
  maintain_weight: "Duy trì",
  gain_weight: "Tăng cân",
};

const GOAL_COLORS = {
  lose_weight: "error",
  maintain_weight: "success",
  gain_weight: "warning",
};

function UserTable({ loading, users, onEdit, onDelete }) {
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
              borderCollapse: "collapse",
              tableLayout: "auto",
            }}
          >
            <colgroup>
              <col style={{ width: "18%" }} /> {/* Tên */}
              <col style={{ width: "25%" }} /> {/* Email */}
              <col style={{ width: "10%" }} />  {/* Giới tính */}
              <col style={{ width: "8%" }} />  {/* Tuổi */}
              {/* Chiều cao và Cân nặng đã bị ẩn để bảo vệ quyền riêng tư */}
              <col style={{ width: "12%" }} /> {/* Mục tiêu */}
              <col style={{ width: "17%" }} /> {/* Dị ứng */}
              <col style={{ width: "10%" }} />  {/* Thao tác */}
            </colgroup>

            <thead style={{ display: "table-header-group" }}>
              <tr style={{ background: "#f5f5f5" }}>
                {[
                  "Tên",
                  "Email",
                  "Giới tính",
                  "Tuổi",
                  // "Chiều cao (cm)", // Ẩn để bảo vệ quyền riêng tư
                  // "Cân nặng (kg)", // Ẩn để bảo vệ quyền riêng tư
                  "Mục tiêu",
                  "Dị ứng",
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
                          : h === "Tuổi"
                          ? "right"
                          : "left",
                      padding: "10px 12px",
                      borderBottom: "1px solid #d9d9d9",
                      borderRight: i === 5 ? "none" : "1px solid #e6e6e6",
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
              {!loading && users.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: 18, textAlign: "center" }}>
                    <MDTypography variant="button" color="text">
                      Chưa có người dùng nào.
                    </MDTypography>
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => {
                  const gender = user.gender || "other";
                  const goal = user.goal || null;
                  const allergies = user.allergies || [];

                  return (
                    <tr
                      key={user._id || idx}
                      style={{
                        borderBottom: "1px solid #eee",
                        background: idx % 2 === 1 ? "rgba(0,0,0,0.01)" : "transparent",
                      }}
                    >
                      {/* Tên */}
                      <td
                        style={{
                          display: "table-cell",
                          boxSizing: "border-box",
                          padding: "10px 12px",
                          borderRight: "1px solid #eee",
                        }}
                      >
                        <EllipsisText text={user.name || "-"} variant="button" fontWeight="medium" />
                      </td>

                      {/* Email */}
                      <td
                        style={{
                          display: "table-cell",
                          boxSizing: "border-box",
                          padding: "10px 12px",
                          borderRight: "1px solid #eee",
                        }}
                      >
                        <EllipsisText text={user.email || "-"} variant="caption" />
                      </td>

                      {/* Giới tính */}
                      <td
                        style={{
                          display: "table-cell",
                          boxSizing: "border-box",
                          padding: "10px 12px",
                          borderRight: "1px solid #eee",
                        }}
                      >
                        <Chip
                          label={GENDER_LABELS[gender] || "Khác"}
                          color={GENDER_COLORS[gender] || "default"}
                          size="small"
                          variant="outlined"
                        />
                      </td>

                      {/* Tuổi */}
                      <td style={{ padding: "10px 12px", borderRight: "1px solid #eee", textAlign: "right" }}>
                        <MDTypography variant="caption" color="text">
                          {user.age ?? "-"}
                        </MDTypography>
                      </td>

                      {/* Chiều cao và Cân nặng đã bị ẩn để bảo vệ quyền riêng tư */}
                      {/* Admin chỉ có thể xem khi chỉnh sửa user */}

                      {/* Mục tiêu */}
                      <td
                        style={{
                          display: "table-cell",
                          boxSizing: "border-box",
                          padding: "10px 12px",
                          borderRight: "1px solid #eee",
                        }}
                      >
                        {goal ? (
                          <Chip
                            label={GOAL_LABELS[goal] || goal}
                            color={GOAL_COLORS[goal] || "default"}
                            size="small"
                            variant="outlined"
                          />
                        ) : (
                          <MDTypography variant="caption" color="text">
                            -
                          </MDTypography>
                        )}
                      </td>

                      {/* Dị ứng */}
                      <td
                        style={{
                          display: "table-cell",
                          boxSizing: "border-box",
                          padding: "10px 12px",
                          borderRight: "1px solid #eee",
                        }}
                      >
                        {allergies.length > 0 ? (
                          <Tooltip title={allergies.join(", ")}>
                            <MDTypography variant="caption" color="text">
                              {allergies.length} dị ứng
                            </MDTypography>
                          </Tooltip>
                        ) : (
                          <MDTypography variant="caption" color="text">
                            -
                          </MDTypography>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "6px 12px", textAlign: "center", whiteSpace: "nowrap" }}>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton size="small" onClick={() => onEdit(user)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton size="small" color="error" onClick={() => onDelete(user)}>
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

UserTable.propTypes = {
  loading: PropTypes.bool,
  users: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      email: PropTypes.string,
      age: PropTypes.number,
      gender: PropTypes.string,
      height: PropTypes.number,
      weight: PropTypes.number,
      goal: PropTypes.string,
      allergies: PropTypes.arrayOf(PropTypes.string),
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default UserTable;

