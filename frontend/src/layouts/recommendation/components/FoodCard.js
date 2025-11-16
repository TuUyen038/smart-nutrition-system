// components/FoodCard.jsx
import React from "react";
import { Card, CardContent, CardActions, Box, Typography, Avatar, Chip } from "@mui/material";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import PropTypes from "prop-types";
import MDTypography from "components/MDTypography";

const FoodCard = ({ title, calories, image, children }) => {
  // Nếu image là string (URL) thì render <img>, nếu là JSX thì render trực tiếp
  const renderAvatarContent =
    typeof image === "string" ? (
      <img
        src={image}
        alt={title}
        style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
      />
    ) : (
      image
    );

  return (
    <Card
  sx={{
    height: "100%",
    display: "flex",
    flexDirection: "column",
    bgcolor: "white",           // giữ trắng
    border: "1px solid rgba(0,0,0,0.08)", // viền nhẹ tách card
    borderRadius: 2,
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    transform: "translateY(-2px)",
    transition: "all 0.2s ease-in-out",
  }

  }}
>

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box display="flex" alignItems="center" mb={1}>
          <Avatar
            sx={{
              bgcolor: "primary.light",
              mr: 1.5,
              fontSize: "1.5rem",
              width: 48,
              height: 48,
            }}
          >
            {renderAvatarContent}
          </Avatar>
          <Box>
            <MDTypography

              variant="h6"
              textTransform="capitalize"
              sx={{
                display: "-webkit-box",
                overflow: "hidden",
                textOverflow: "ellipsis",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                width: "100%",
              }}
            >
              {title}
            </MDTypography>
            <Chip
              label={`${calories} kcal`}
              size="small"
              variant="outlined" // outline
              sx={{
                fontSize: "0.75rem",
                height: 20,
                mt: 0.5,
                borderColor: "rgba(255, 165, 0, 0.5)", 
                color: "rgba(255, 140, 0, 0.8)",       
                backgroundColor: "rgba(255, 255, 255, 0.1)", 
              }}
            />
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>{children}</CardActions>
    </Card>
  );
};

FoodCard.propTypes = {
  title: PropTypes.string.isRequired,
  calories: PropTypes.number.isRequired,
  image: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  children: PropTypes.node,
};

export default FoodCard;
