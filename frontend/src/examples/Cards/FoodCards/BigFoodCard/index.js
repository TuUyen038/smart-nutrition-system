import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { Chip, Divider, Grid, IconButton } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useState } from "react";

function BigFoodCard({ image, label, title, description, category, action }) {
  const [liked, setLiked] = useState(false);

  const handleToggle = () => {
    setLiked(!liked);
  };
  return (
    <Card
      sx={{
        width: '100%',
        height: 'auto',
        minHeight: 400,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: 3,
        boxShadow: 3,
        overflow: "hidden",
        transition: "0.3s",
        cursor: action ? "pointer" : "default",
        "&:hover": {
          boxShadow: 6,
        },
      }}
      
    >
      <CardMedia
        component="img"
        image={image}
        alt={title}
        sx={{
          width: "90%",
          objectFit: "cover",
        }}
      />

      <Divider sx={{ mb: 0 }} />

      <CardContent sx={{ flexGrow: 1, pt: 0.1, width: '100%' }}>
        <MDBox >
          <MDTypography
            variant="button"
            fontWeight="regular"
            color="text"
            textTransform="capitalize"
          >
            {label}
          </MDTypography>

          <MDBox mb={1}>
            <MDTypography
              component={
                action?.type === "internal" ? Link : action?.type === "external" ? "a" : "div"
              }
              to={action?.type === "internal" ? action?.route : undefined}
              href={action?.type === "external" ? action?.route : undefined}
              target={action?.type === "external" ? "_blank" : undefined}
              rel={action?.type === "external" ? "noreferrer" : undefined}
              variant="h5"
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
          </MDBox>

          <MDBox mb={3}>
            <MDTypography
              variant="button"
              fontWeight="light"
              color="text"
              sx={{
                display: "-webkit-box",
                overflow: "hidden",
                textOverflow: "ellipsis",
                WebkitLineClamp: 6,
                WebkitBoxOrient: "vertical",
                lineHeight: 1.4, 
                maxHeight: "8.4em",
              }}
            >
              {description}
            </MDTypography>
          </MDBox>

          {category && <Chip label={category} color="success" variant="outline" sx={{ mt: 2 }} />}
          <Grid container spacing={1} sx={{ mt: 1 }} gap={1} flexDirection='row' justifyContent="space-between">
            <Grid item>
              <MDBox display="flex" gap={2}>
                {/* <MDButton
                  variant="outlined"
                  color="info"
                >
                  Phân tích dinh dưỡng
                </MDButton> */}
                <MDButton
                  variant="outlined"
                  color="info"
                >
                  Thêm vào thực đơn
                </MDButton>
              </MDBox>
              
            </Grid>
            <Grid item>
              <IconButton onClick={handleToggle}>
                <FavoriteIcon
                  sx={{
                    color: liked ? "red" : "gray",
                    transition: "color 0.2s ease",
                  }}
                />
              </IconButton>
            </Grid>
          </Grid>

        </MDBox>
      </CardContent>

      {action?.label && (
        <CardActions sx={{ px: 2, pb: 2 }}>
          {action.type === "internal" ? (
            <MDButton
              component={Link}
              to={action.route}
              variant="outlined"
              size="small"
              color={action.color}
              fullWidth
            >
              {action.label}
            </MDButton>
          ) : (
            <MDButton
              component="a"
              href={action.route}
              target="_blank"
              rel="noreferrer"
              variant="outlined"
              size="small"
              color={action.color}
              fullWidth
            >
              {action.label}
            </MDButton>
          )}
        </CardActions>
      )}
    </Card>
  );
}

BigFoodCard.propTypes = {
  image: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  category: PropTypes.string,

  action: PropTypes.shape({
    type: PropTypes.oneOf(["external", "internal"]), // optional
    route: PropTypes.string,                          // optional
    color: PropTypes.oneOf([
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "error",
      "light",
      "dark",
      "white",
    ]),
    label: PropTypes.string,
    onClick: PropTypes.func,
  }),
};

BigFoodCard.defaultProps = {
  action: null,
};

export default BigFoodCard;
