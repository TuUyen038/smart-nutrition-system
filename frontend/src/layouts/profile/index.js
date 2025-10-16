import React, { useState } from "react";
import {
  Grid,
  Card,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Avatar,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import LineChart from "examples/Charts/LineChart";
import MDButton from "components/MDButton";
function Profile() {
  const [avatar, setAvatar] = useState(null);
  const [filters, setFilters] = useState({ goal: "", duration: "" });
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "Nguyễn Văn A",
    age: "25",
    gender: "Nam",
    height: "170",
    weight: "65",
    goal: "maintain",
    allergy: "Hải sản, Sữa bò, Đậu phộng",
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
    }
  };

  const handleChange = (field) => (e) => {
    setProfile({ ...profile, [field]: e.target.value });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          {/* Avatar và thông tin cá nhân */}
          <Grid item xs={12} md={4} lg={4}>
            {!isEditing ? (
              <Card sx={{ p: 3 }}>
                <MDBox display="flex" flexDirection="column" alignItems="center" mb={3}>
                  <Avatar rc={avatar} alt="Avatar" sx={{ width: 120, height: 120, mb: 2 }} />
                </MDBox>
                <MDBox>
                  <MDTypography variant="h6" mb={2}>
                    Thông tin người dùng
                  </MDTypography>

                  <Grid container spacing={1}>
                    <Grid item xs={3} display="flex" alignItems="center">
                      <MDTypography variant="h6" fontWeight="medium">
                        Họ tên:
                      </MDTypography>
                    </Grid>
                    <Grid item xs={9} display="flex" alignItems="center">
                      <MDTypography variant="button" color="text">
                        {profile.name}
                      </MDTypography>
                    </Grid>
                    {/* Tuổi */}
                    <Grid item xs={3} display="flex" alignItems="center">
                      <MDTypography variant="h6" fontWeight="medium">
                        Tuổi:
                      </MDTypography>
                    </Grid>
                    <Grid item xs={9} display="flex" alignItems="center">
                      <MDTypography variant="button" color="text">
                        {profile.age}
                      </MDTypography>
                    </Grid>

                    {/* Giới tính */}
                    <Grid item xs={3} display="flex" alignItems="center">
                      <MDTypography variant="h6" fontWeight="medium">
                        Giới tính:
                      </MDTypography>
                    </Grid>
                    <Grid item xs={9} display="flex" alignItems="center">
                      <MDTypography variant="button" color="text">
                        {profile.gender}
                      </MDTypography>
                    </Grid>

                    {/* Chiều cao */}
                    <Grid item xs={3} display="flex" alignItems="center">
                      <MDTypography variant="h6" fontWeight="medium">
                        Chiều cao:
                      </MDTypography>
                    </Grid>
                    <Grid item xs={9} display="flex" alignItems="center">
                      <MDTypography variant="button" color="text">
                        {profile.height} cm
                      </MDTypography>
                    </Grid>

                    {/* Cân nặng */}
                    <Grid item xs={3} display="flex" alignItems="center">
                      <MDTypography variant="h6" fontWeight="medium">
                        Cân nặng:
                      </MDTypography>
                    </Grid>
                    <Grid item xs={9} display="flex" alignItems="center">
                      <MDTypography variant="button" color="text">
                        {profile.weight} kg
                      </MDTypography>
                    </Grid>

                    {/* <Grid item xs={3} display="flex" alignItems="center">
                      <MDTypography variant="h6" fontWeight="medium">
                        Mục tiêu:
                      </MDTypography>
                    </Grid>
                    <Grid item xs={9} display="flex" alignItems="center">
                      <MDTypography variant="button" color="text">
                        Giảm cân
                      </MDTypography>
                    </Grid> */}

                    <Grid item xs={3} display="flex" alignItems="center">
                      <MDTypography variant="h6" fontWeight="medium">
                        Dị ứng:
                      </MDTypography>
                    </Grid>
                    <Grid item xs={9} display="flex" alignItems="center">
                      <MDTypography variant="button" color="text">
                        {profile.allergy || "Không có"}
                      </MDTypography>
                    </Grid>
                  </Grid>
                </MDBox>

                <MDButton variant="outlined" sx={{ mt: 3 }} onClick={() => setIsEditing(true)}>
                  Chỉnh sửa
                </MDButton>
              </Card>
            ) : (
              <Card sx={{ p: 3 }}>
                <MDBox display="flex" flexDirection="column" alignItems="center" mb={3}>
                  <Avatar rc={avatar} alt="Avatar" sx={{ width: 120, height: 120, mb: 2 }} />
                  <Button variant="outlined" component="label">
                    Chọn ảnh
                    <input hidden accept="image/*" type="file" onChange={handleAvatarChange} />
                  </Button>
                </MDBox>

                {/* Thông tin cá nhân */}
                <MDTypography variant="h6" mb={2}>
                  Thông tin cá nhân
                </MDTypography>
                <MDBox display="flex" flexDirection="column" gap={2}>
                  <TextField
                    label="Họ tên"
                    fullWidth
                    value={profile.name}
                    onChange={handleChange("name")}
                  />
                  <TextField
                    label="Tuổi"
                    fullWidth
                    value={profile.age}
                    onChange={handleChange("age")}
                  />
                  <TextField
                    label="Giới tính"
                    fullWidth
                    value={profile.gender}
                    onChange={handleChange("gender")}
                  />
                  <TextField
                    label="Chiều cao (cm)"
                    fullWidth
                    value={profile.height}
                    onChange={handleChange("height")}
                  />
                  <TextField
                    label="Cân nặng (kg)"
                    fullWidth
                    value={profile.weight}
                    onChange={handleChange("weight")}
                  />
                </MDBox>

                {/* Mục tiêu dinh dưỡng */}
                <Divider sx={{ my: 1.5 }} />
                <MDTypography variant="h6" mb={2}>
                  Mục tiêu dinh dưỡng
                </MDTypography>
                <FormControl fullWidth>
                  <InputLabel id="goal-label">Mục tiêu</InputLabel>
                  <Select
                    labelId="goal-label"
                    id="goal"
                    value={filters.goal}
                    onChange={(e) => setFilters({ ...filters, goal: e.target.value })}
                    label="Mục tiêu"
                    sx={{
                      padding: "12px 1px 0.75rem !important",
                      "& .MuiOutlinedInput-input": { padding: "12px 0.75rem" },
                    }}
                  >
                    <MenuItem value="giam_can">Giảm cân</MenuItem>
                    <MenuItem value="tang_co">Tăng cơ</MenuItem>
                    <MenuItem value="can_bang">Cân bằng</MenuItem>
                    <MenuItem value="an_chay">Ăn chay</MenuItem>
                  </Select>
                </FormControl>

                {/* Tiền sử dị ứng */}
                <Divider sx={{ my: 1.5 }} />
                <MDTypography variant="h6" mb={2}>
                  Tiền sử dị ứng
                </MDTypography>
                <TextField
                  label="Thực phẩm dị ứng"
                  fullWidth
                  multiline
                  rows={3}
                  value={profile.allergy}
                  onChange={handleChange("allergy")}
                />
              </Card>
            )}
          </Grid>
          {/* Biểu đồ và nút hành động */}
          <Grid item xs={12} md={8} lg={8}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="h6" mb={0}>
                Biểu đồ theo dõi
              </MDTypography>
              <LineChart />
              <Divider sx={{ my: 2 }} />
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default Profile;
