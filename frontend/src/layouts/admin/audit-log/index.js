import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  Pagination,
  Chip,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { getAuditLogs } from "services/auditLogApi";
import { useToast } from "context/ToastContext";

const ACTION_COLORS = {
  CREATE: "success",
  UPDATE: "info",
  DELETE: "error",
  LOGIN: "primary",
  PASSWORD_RESET_REQUEST: "warning",
  PASSWORD_RESET: "info",
};

const RESOURCE_TYPE_COLORS = {
  User: "primary",
  Recipe: "success",
  Ingredient: "info",
  Auth: "default",
};

function AuditLogManagement() {
  const { showError } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1,
  });

  // Filters
  const [filters, setFilters] = useState({
    action: "",
    resourceType: "",
    startDate: "",
    endDate: "",
  });

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const result = await getAuditLogs(filters, page, pagination.limit);
      setLogs(result.logs || []);
      setPagination({
        page: result.page || page,
        limit: result.limit || pagination.limit,
        total: result.total || 0,
        totalPages: result.totalPages || 1,
      });
    } catch (err) {
      console.error("Fetch audit logs error:", err);
      showError(err.message || "Không thể tải danh sách audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePageChange = (event, newPage) => {
    fetchLogs(newPage);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} px={2}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="bold" mb={1}>
            Lịch sử hoạt động
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Theo dõi tất cả các hoạt động trong hệ thống
          </MDTypography>
        </MDBox>

        {/* Filters */}
        <Card sx={{ mb: 3, p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                label="Hành động"
                value={filters.action}
                onChange={(e) => handleFilterChange("action", e.target.value)}
                sx={{
                  label: {
                    pb: 1,
                  },
                  ".css-12n1zae-MuiInputBase-root-MuiOutlinedInput-root": {
                    lineHeight: "3.12",
                  },
                }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="CREATE">CREATE</MenuItem>
                <MenuItem value="UPDATE">UPDATE</MenuItem>
                <MenuItem value="DELETE">DELETE</MenuItem>
                <MenuItem value="LOGIN">LOGIN</MenuItem>
                <MenuItem value="PASSWORD_RESET_REQUEST">PASSWORD_RESET_REQUEST</MenuItem>
                <MenuItem value="PASSWORD_RESET">PASSWORD_RESET</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                label="Loại tài nguyên"
                value={filters.resourceType}
                onChange={(e) => handleFilterChange("resourceType", e.target.value)}
                sx={{
                  label: {
                    pb: 1,
                  },
                  ".css-12n1zae-MuiInputBase-root-MuiOutlinedInput-root": {
                    lineHeight: "3.12",
                  },
                }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="Recipe">Recipe</MenuItem>
                <MenuItem value="Ingredient">Ingredient</MenuItem>
                <MenuItem value="Auth">Auth</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Từ ngày"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Đến ngày"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Card>

        {/* Table */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress />
          </Box>
        ) : logs.length === 0 ? (
          <Alert severity="info">Không có dữ liệu</Alert>
        ) : (
          <>
            <Card>
              <Box sx={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    tableLayout: "auto",
                  }}
                >
                  <colgroup>
                    <col style={{ width: "12%" }} /> {/* Thời gian */}
                    <col style={{ width: "15%" }} /> {/* Người thực hiện */}
                    <col style={{ width: "10%" }} /> {/* Hành động */}
                    <col style={{ width: "13%" }} /> {/* Loại tài nguyên */}
                    <col style={{ width: "22%" }} /> {/* Tên tài nguyên */}
                    <col style={{ width: "11%" }} /> {/* IP Address */}
                    <col style={{ width: "8%" }} /> {/* Kết quả */}
                    <col style={{ width: "9%" }} /> {/* Lý do */}
                  </colgroup>

                  <thead style={{ display: "table-header-group" }}>
                    <tr style={{ background: "#f5f5f5" }}>
                      {[
                        "Thời gian",
                        "Người thực hiện",
                        "Hành động",
                        "Loại tài nguyên",
                        "Tên tài nguyên",
                        "IP Address",
                        "Kết quả",
                        "Lý do",
                      ].map((h, i) => (
                        <th
                          key={h}
                          style={{
                            display: "table-cell",
                            boxSizing: "border-box",
                            textAlign: "left",
                            padding: "12px 8px",
                            borderBottom: "2px solid #d9d9d9",
                            borderRight: i === 7 ? "none" : "1px solid #e6e6e6",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            fontSize: "0.8rem",
                          }}
                        >
                          <MDTypography variant="button" fontWeight="medium" fontSize="0.8rem">
                            {h}
                          </MDTypography>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {logs.map((log, idx) => (
                      <tr
                        key={log._id}
                        style={{
                          background: idx % 2 === 0 ? "#fff" : "#fafafa",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        {/* Thời gian */}
                        <td
                          style={{
                            display: "table-cell",
                            boxSizing: "border-box",
                            padding: "12px 8px",
                            borderRight: "1px solid #eee",
                          }}
                        >
                          <MDTypography
                            variant="caption"
                            color="text"
                            fontWeight="medium"
                            fontSize="0.75rem"
                          >
                            {formatDate(log.createdAt)}
                          </MDTypography>
                        </td>

                        {/* Người thực hiện */}
                        <td
                          style={{
                            display: "table-cell",
                            boxSizing: "border-box",
                            padding: "12px 8px",
                            borderRight: "1px solid #eee",
                          }}
                        >
                          <Box>
                            <MDTypography
                              variant="caption"
                              fontWeight="medium"
                              display="block"
                              fontSize="0.75rem"
                            >
                              {log.userId?.name || log.userEmail || "System"}
                            </MDTypography>
                            <MDTypography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              fontSize="0.7rem"
                            >
                              {log.userId?.email || log.userEmail || "-"}
                            </MDTypography>
                            {log.userId?.role && (
                              <Chip
                                label={log.userId.role}
                                size="small"
                                color={log.userId.role === "ADMIN" ? "error" : "default"}
                                sx={{ mt: 0.5, height: 18, fontSize: "0.6rem" }}
                              />
                            )}
                          </Box>
                        </td>

                        {/* Hành động */}
                        <td
                          style={{
                            display: "table-cell",
                            boxSizing: "border-box",
                            padding: "12px 8px",
                            borderRight: "1px solid #eee",
                          }}
                        >
                          <Chip
                            label={log.action}
                            color={ACTION_COLORS[log.action] || "default"}
                            size="small"
                            sx={{ fontWeight: 500, fontSize: "0.7rem", height: 24 }}
                          />
                        </td>

                        {/* Loại tài nguyên */}
                        <td
                          style={{
                            display: "table-cell",
                            boxSizing: "border-box",
                            padding: "12px 8px",
                            borderRight: "1px solid #eee",
                          }}
                        >
                          <Chip
                            label={log.resourceType}
                            color={RESOURCE_TYPE_COLORS[log.resourceType] || "default"}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.7rem", height: 24 }}
                          />
                        </td>

                        {/* Tên tài nguyên */}
                        <td
                          style={{
                            display: "table-cell",
                            boxSizing: "border-box",
                            padding: "12px 8px",
                            borderRight: "1px solid #eee",
                          }}
                        >
                          <MDTypography
                            variant="caption"
                            color="text"
                            sx={{
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontSize: "0.75rem",
                            }}
                            title={log.resourceName || "-"}
                          >
                            {log.resourceName || "-"}
                          </MDTypography>
                        </td>

                        {/* IP Address */}
                        <td
                          style={{
                            display: "table-cell",
                            boxSizing: "border-box",
                            padding: "12px 8px",
                            borderRight: "1px solid #eee",
                          }}
                        >
                          <MDTypography variant="caption" color="text.secondary" fontSize="0.7rem">
                            {log.ipAddress || "-"}
                          </MDTypography>
                        </td>

                        {/* Kết quả */}
                        <td
                          style={{
                            display: "table-cell",
                            boxSizing: "border-box",
                            padding: "12px 8px",
                            borderRight: "1px solid #eee",
                          }}
                        >
                          <Chip
                            label={log.success ? "OK" : "Lỗi"}
                            color={log.success ? "success" : "error"}
                            size="small"
                            sx={{ fontWeight: 500, fontSize: "0.7rem", height: 24 }}
                          />
                        </td>

                        {/* Lý do */}
                        <td
                          style={{
                            display: "table-cell",
                            boxSizing: "border-box",
                            padding: "12px 8px",
                          }}
                        >
                          <MDTypography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontSize: "0.7rem",
                            }}
                            title={log.reason || "-"}
                          >
                            {log.reason || "-"}
                          </MDTypography>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Card>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}

            <Box mt={2} textAlign="center">
              <Typography variant="caption" color="text.secondary">
                Hiển thị {logs.length} / {pagination.total} bản ghi
              </Typography>
            </Box>
          </>
        )}
      </MDBox>
    </DashboardLayout>
  );
}

export default AuditLogManagement;
