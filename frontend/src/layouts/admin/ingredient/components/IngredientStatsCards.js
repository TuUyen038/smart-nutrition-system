import { Card, Grid } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Icon from "@mui/material/Icon";
import PropTypes from "prop-types";

function IngredientStatsCards({ stats, loading }) {
  if (loading) {
    return (
      <Grid container spacing={3} mb={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="body2" color="text">
                  Đang tải...
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  const categoryCounts = stats?.byCategory || [];
  const topCategory = categoryCounts[0] || { categoryLabel: "N/A", count: 0 };

  const statCards = [
    {
      title: "Tổng nguyên liệu",
      value: stats?.total || 0,
      icon: "inventory_2",
      color: "info",
    },
    {
      title: "Nhóm phổ biến",
      value: topCategory.categoryLabel,
      icon: "category",
      color: "success",
      subtitle: `${topCategory.count} nguyên liệu`,
    },
    {
      title: "Nhóm nhiều nhất",
      value: categoryCounts.length > 0 ? categoryCounts[0].count : 0,
      icon: "trending_up",
      color: "warning",
      subtitle: categoryCounts.length > 0 ? categoryCounts[0].categoryLabel : "",
    },
    {
      title: "Số nhóm",
      value: categoryCounts.length,
      icon: "folder",
      color: "primary",
    },
  ];

  return (
    <Grid container spacing={3} mb={3}>
      {statCards.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card>
            <MDBox p={3}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center">
                <MDBox>
                  <MDTypography variant="button" color="text" fontWeight="medium">
                    {stat.title}
                  </MDTypography>
                  <MDTypography variant="h5" fontWeight="bold">
                    {stat.value}
                  </MDTypography>
                  {stat.subtitle && (
                    <MDTypography variant="caption" color="text">
                      {stat.subtitle}
                    </MDTypography>
                  )}
                </MDBox>
                <MDBox
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  width="4rem"
                  height="4rem"
                  borderRadius="lg"
                  sx={{ bgcolor: `${stat.color}.main`, opacity: 0.15 }}
                >
                  <Icon sx={{ color: `${stat.color}.main`, fontSize: "2rem" }}>
                    {stat.icon}
                  </Icon>
                </MDBox>
              </MDBox>
            </MDBox>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

IngredientStatsCards.propTypes = {
  stats: PropTypes.shape({
    total: PropTypes.number,
    byCategory: PropTypes.arrayOf(
      PropTypes.shape({
        category: PropTypes.string,
        categoryLabel: PropTypes.string,
        count: PropTypes.number,
      })
    ),
  }),
  loading: PropTypes.bool,
};

export default IngredientStatsCards;

