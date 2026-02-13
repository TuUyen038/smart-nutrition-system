import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
} from "@mui/material";
import PropTypes from "prop-types";

// Các components của Material Dashboard
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";

function TopRecipesTable({ topRecipes = [] }) {
  if (!topRecipes || topRecipes.length === 0) {
    return (
      <MDBox p={3} textAlign="center">
        <MDTypography variant="button" color="text" fontWeight="regular">
          Chưa có dữ liệu thống kê
        </MDTypography>
      </MDBox>
    );
  }

  // Style chung để đảm bảo Header và Body đồng nhất
  const cellStyle = {
    padding: "12px 16px",
    borderBottom: ({ borders: { borderWidth, borderColor } }) =>
      `${borderWidth[1]} solid ${borderColor}`,
  };

  return (
    <TableContainer sx={{ boxShadow: "none", overflow: "auto" }}>
      <Table sx={{ minWidth: "650px" }}>
        <TableHead sx={{ display: "table-header-group" }}>
          <TableRow>
            <TableCell align="center" width="5%" sx={cellStyle}>
              <MDTypography variant="button" fontWeight="bold" color="secondary" opacity={0.7}>
                #
              </MDTypography>
            </TableCell>
            <TableCell align="left" width="40%" sx={cellStyle}>
              <MDTypography variant="button" fontWeight="bold" color="secondary" opacity={0.7}>
                Tên món ăn
              </MDTypography>
            </TableCell>
            <TableCell align="left" width="20%" sx={cellStyle}>
              <MDTypography variant="button" fontWeight="bold" color="secondary" opacity={0.7}>
                Người tạo
              </MDTypography>
            </TableCell>
            <TableCell align="center" width="15%" sx={cellStyle}>
              <MDTypography variant="button" fontWeight="bold" color="secondary" opacity={0.7}>
                Lượt dùng
              </MDTypography>
            </TableCell>
            <TableCell align="right" width="20%" sx={cellStyle}>
              <MDTypography variant="button" fontWeight="bold" color="secondary" opacity={0.7}>
                Năng lượng
              </MDTypography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {topRecipes.map((row, idx) => (
            <TableRow key={row._id || row.id || idx}>
              <TableCell align="center" sx={cellStyle}>
                <MDTypography variant="caption" color="text" fontWeight="medium">
                  {idx + 1}
                </MDTypography>
              </TableCell>
              <TableCell align="left" sx={cellStyle}>
                <MDTypography variant="button" fontWeight="medium" display="block">
                  {row.name || "N/A"}
                </MDTypography>
              </TableCell>
              <TableCell align="left" sx={cellStyle}>
                <MDTypography variant="caption" color="text">
                  {row.author || "Hệ thống"}
                </MDTypography>
              </TableCell>
              <TableCell align="center" sx={cellStyle}>
                <MDTypography variant="caption" color="text" fontWeight="medium">
                  {row.usageCount?.toLocaleString("vi-VN") || 0}
                </MDTypography>
              </TableCell>
              <TableCell align="right" sx={cellStyle}>
                <MDTypography variant="caption" color="text" fontWeight="medium">
                  {row.avgCalories ? `${row.avgCalories} kcal` : "---"}
                </MDTypography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

TopRecipesTable.propTypes = {
  topRecipes: PropTypes.arrayOf(
    PropTypes.shape({
      // Hỗ trợ cả id chuỗi hoặc object id từ MongoDB
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
      _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
      
      name: PropTypes.string.isRequired, 
      author: PropTypes.string,           
      usageCount: PropTypes.number,       
      avgCalories: PropTypes.number,      
    })
  ),
};

TopRecipesTable.defaultProps = {
  topRecipes: [],
};

export default TopRecipesTable;