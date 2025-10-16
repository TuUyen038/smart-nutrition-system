import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

function DefaultFoodCard({ image, label, title, description, action }) {
  return (
    <Card
      sx={{
        width: 240, // hoặc "15rem"
        height: 290, // hoặc "22.5rem"
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRadius: 3,
        boxShadow: 3,
        overflow: "hidden",
        transition: "0.3s",
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
          height: 130,
          objectFit: "cover",
        }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <MDBox mt={1} mx={0.5}>
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

          <MDBox mb={2} lineHeight={0}>
            <MDTypography
              variant="button"
              fontWeight="light"
              color="text"
              sx={{
                display: "-webkit-box",
                overflow: "hidden",
                textOverflow: "ellipsis",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                height: "42px",
              }}
            >
              {description}
            </MDTypography>
          </MDBox>
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

DefaultFoodCard.propTypes = {
  image: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  action: PropTypes.shape({
    type: PropTypes.oneOf(["external", "internal"]),
    route: PropTypes.string,
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
  }),
};
DefaultFoodCard.defaultProps = {
  action: null,
};

export default DefaultFoodCard;
