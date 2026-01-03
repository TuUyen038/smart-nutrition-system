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
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Chip,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
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
  LOGOUT: "default",
  VERIFY: "success",
  UNVERIFY: "warning",
  PASSWORD_RESET_REQUEST: "warning",
  PASSWORD_RESET: "info",
};

const RESOURCE_TYPE_COLORS = {
  User: "primary",
  Recipe: "success",
  Ingredient: "info",
  DailyMenu: "warning",
  MealPlan: "secondary",
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
    userEmail: "",
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
              <FormControl fullWidth size="small">
                <InputLabel>Hành động</InputLabel>
                <Select
                  value={filters.action}
                  label="Hành động"
                  onChange={(e) => handleFilterChange("action", e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="CREATE">CREATE</MenuItem>
                  <MenuItem value="UPDATE">UPDATE</MenuItem>
                  <MenuItem value="DELETE">DELETE</MenuItem>
                  <MenuItem value="LOGIN">LOGIN</MenuItem>
                  <MenuItem value="LOGOUT">LOGOUT</MenuItem>
                  <MenuItem value="VERIFY">VERIFY</MenuItem>
                  <MenuItem value="UNVERIFY">UNVERIFY</MenuItem>
                  <MenuItem value="PASSWORD_RESET_REQUEST">PASSWORD_RESET_REQUEST</MenuItem>
                  <MenuItem value="PASSWORD_RESET">PASSWORD_RESET</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Loại tài nguyên</InputLabel>
                <Select
                  value={filters.resourceType}
                  label="Loại tài nguyên"
                  onChange={(e) => handleFilterChange("resourceType", e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="User">User</MenuItem>
                  <MenuItem value="Recipe">Recipe</MenuItem>
                  <MenuItem value="Ingredient">Ingredient</MenuItem>
                  <MenuItem value="DailyMenu">DailyMenu</MenuItem>
                  <MenuItem value="MealPlan">MealPlan</MenuItem>
                  <MenuItem value="Auth">Auth</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Email người dùng"
                value={filters.userEmail}
                onChange={(e) => handleFilterChange("userEmail", e.target.value)}
                placeholder="Tìm theo email..."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.5}>
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
            <Grid item xs={12} sm={6} md={2.5}>
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
              <Box>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    tableLayout: "auto",
                  }}
                >
                  <colgroup>
                    <col style={{ width: 160 }} /> {/* Thời gian */}
                    <col style={{ width: 200 }} /> {/* Người thực hiện */}
                    <col style={{ width: 100 }} /> {/* Hành động */}
                    <col style={{ width: 120 }} /> {/* Loại tài nguyên */}
                    <col style={{ width: 180 }} /> {/* Tên tài nguyên */}
                    <col style={{ width: 140 }} /> {/* IP Address */}
                    <col style={{ width: 100 }} /> {/* Kết quả */}
                    <col style={{ width: 100 }} /> {/* Lý do */}
                    <col style={{ width: 80 }} /> {/* Chi tiết */}
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
                        "Chi tiết",
                      ].map((h, i) => (
                        <th
                          key={h}
                          style={{
                            display: "table-cell",
                            boxSizing: "border-box",
                            textAlign: h === "Chi tiết" ? "center" : "left",
                            padding: "12px 8px",
                            borderBottom: "2px solid #d9d9d9",
                            borderRight: i === 8 ? "none" : "1px solid #e6e6e6",
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
                            borderRight: "1px solid #eee",
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

                        {/* Chi tiết */}
                        <td
                          style={{
                            display: "table-cell",
                            boxSizing: "border-box",
                            padding: "12px 8px",
                            textAlign: "center",
                          }}
                        >
                          <Tooltip title="Xem chi tiết">
                            <IconButton
                              size="small"
                              onClick={() => {
                                // TODO: Mở dialog xem chi tiết
                                console.log("View details:", log);
                              }}
                              sx={{ color: "info.main", padding: "4px" }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
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
