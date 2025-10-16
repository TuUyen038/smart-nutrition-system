import React, { useEffect, useState } from "react";
import { Grid, AppBar, Tabs, Tab, Card } from "@mui/material";
import Icon from "@mui/material/Icon";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import breakpoints from "assets/theme/base/breakpoints";

function CustomSwitchTabs() {
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // A function that sets the orientation state of the tabs.
    function handleTabsOrientation() {
      return window.innerWidth < breakpoints.values.sm
        ? setTabsOrientation("vertical")
        : setTabsOrientation("horizontal");
    }

    window.addEventListener("resize", handleTabsOrientation);

    // Call the handleTabsOrientation function to set the state with the initial value.
    handleTabsOrientation();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleTabsOrientation);
  }, [tabsOrientation]);

  const handleSetTabValue = (event, newValue) => setTabValue(newValue);

  return (
    <MDBox position="relative" mb={5}>
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} md={6} lg={4} sx={{ ml: "auto" }}>
          <AppBar position="static">
            <Tabs orientation={tabsOrientation} value={tabValue} onChange={handleSetTabValue}>
              <Tab
                label="Bữa"
                icon={
                  <Icon fontSize="small" sx={{ mt: -0.25 }}>
                    home
                  </Icon>
                }
              />
              <Tab
                label="Ngày"
                icon={
                  <Icon fontSize="small" sx={{ mt: -0.25 }}>
                    email
                  </Icon>
                }
              />
              <Tab
                label="Tuần"
                icon={
                  <Icon fontSize="small" sx={{ mt: -0.25 }}>
                    settings
                  </Icon>
                }
              />
            </Tabs>
          </AppBar>
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default CustomSwitchTabs;
