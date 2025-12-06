import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
} from "@mui/material";

import MDTypography from "components/MDTypography";
import topRecipesData from "../data/topRecipesData";

function TopRecipesTable() {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <MDTypography variant="button" fontWeight="medium">
                #
              </MDTypography>
            </TableCell>
            <TableCell>
              <MDTypography variant="button" fontWeight="medium">
                Tên món
              </MDTypography>
            </TableCell>
            <TableCell>
              <MDTypography variant="button" fontWeight="medium">
                Người tạo
              </MDTypography>
            </TableCell>
            <TableCell align="right">
              <MDTypography variant="button" fontWeight="medium">
                Số lần xuất hiện trong thực đơn
              </MDTypography>
            </TableCell>
            <TableCell align="right">
              <MDTypography variant="button" fontWeight="medium">
                Trung bình kcal/phần
              </MDTypography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {topRecipesData.map((row, idx) => (
            <TableRow key={row.id || row.name}>
              <TableCell>
                <MDTypography variant="caption">{idx + 1}</MDTypography>
              </TableCell>
              <TableCell>
                <MDTypography variant="button" fontWeight="medium">
                  {row.name}
                </MDTypography>
              </TableCell>
              <TableCell>
                <MDTypography variant="caption" color="text">
                  {row.author}
                </MDTypography>
              </TableCell>
              <TableCell align="right">
                <MDTypography variant="caption" color="text">
                  {row.usageCount.toLocaleString("vi-VN")}
                </MDTypography>
              </TableCell>
              <TableCell align="right">
                <MDTypography variant="caption" color="text">
                  {row.avgCalories} kcal
                </MDTypography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default TopRecipesTable;
