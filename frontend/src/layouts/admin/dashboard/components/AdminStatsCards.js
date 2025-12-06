import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";

import DefaultInfoCard from "examples/Cards/InfoCards/DefaultInfoCard";
import adminStatsData from "../data/adminStatsData";

function AdminStatsCards() {
  return (
    <MDBox>
      <Grid container spacing={3}>
        {adminStatsData.map((stat) => (
          <Grid key={stat.title} item xs={12} sm={6} md={3}>
            <DefaultInfoCard
              icon={stat.icon}
              title={stat.title}
              description={stat.description}
              value={stat.value}
            />
          </Grid>
        ))}
      </Grid>
    </MDBox>
  );
}

export default AdminStatsCards;
