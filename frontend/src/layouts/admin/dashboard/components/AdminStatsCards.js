import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import PropTypes from "prop-types";

import DefaultInfoCard from "examples/Cards/InfoCards/DefaultInfoCard";

function AdminStatsCards({ stats }) {
  if (!stats) return null;

  const statsData = [
    {
      title: "Người dùng",
      value: stats.totalUsers?.toLocaleString("vi-VN") || "0",
      description: "Tổng số tài khoản đã đăng ký",
      icon: "groups",
      color: "info",
    },
    {
      title: "Công thức",
      value: stats.totalRecipes?.toLocaleString("vi-VN") || "0",
      description: "Số công thức đang hoạt động",
      icon: "restaurant_menu",
      color: "success",
    },
    {
      title: "Thực đơn đã tạo",
      value: stats.totalMealPlans?.toLocaleString("vi-VN") || "0",
      description: "Tổng số thực đơn cá nhân",
      icon: "event_note",
      color: "warning",
    },
    {
      title: "Món phổ biến",
      value: stats.mostPopularRecipe || "Chưa có",
      description: "Món ăn được xuất hiện nhiều nhất",
      icon: "star",
      color: "error",
    },
  ];

  return (
    <MDBox>
      <Grid container spacing={3}>
        {statsData.map((stat) => (
          <Grid 
            key={stat.title} 
            item 
            xs={12}    // 1 cột trên mobile
            sm={6}     // 2 cột trên tablet
            md={3}     // 4 cột trên desktop
            sx={{ display: "flex" }} // Quan trọng: Giúp Grid Item trở thành Flex container
          >
            {/* Bọc Card để ép chiều cao 100% */}
            <MDBox width="100%" sx={{ "& > div": { height: "100%" } }}>
              <DefaultInfoCard
                color={stat.color}
                icon={stat.icon}
                title={stat.title}
                description={stat.description}
                value={stat.value}
              />
            </MDBox>
          </Grid>
        ))}
      </Grid>
    </MDBox>
  );
}

AdminStatsCards.propTypes = {
  stats: PropTypes.shape({
    totalUsers: PropTypes.number,
    totalRecipes: PropTypes.number,
    totalMealPlans: PropTypes.number,
    mostPopularRecipe: PropTypes.string,
  }),
};

export default AdminStatsCards;