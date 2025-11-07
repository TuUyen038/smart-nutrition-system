import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { Breadcrumbs as MuiBreadcrumbs } from "@mui/material";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import routesConfig from "routes";

function Breadcrumbs({ icon, light }) {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const getRouteName = (segment, index) => {
    // Nếu là id (MongoDB hoặc UUID)
    if (/^[a-f0-9]{6,}$/i.test(segment) || !isNaN(segment)) {
      const parent = pathnames[index - 1];
      const match = routesConfig.find((r) => r.route.includes(`/${parent}/:id`));
      return match ? match.name : "Chi tiết";
    }

    // Tìm trong routesConfig theo key hoặc route
    const found = routesConfig.find(
      (r) => r.key === segment || r.route.replace("/", "") === segment
    );
    return found ? found.name : segment;
  };

  return (
    <MDBox mr={{ xs: 0, xl: 8 }}>
      <MuiBreadcrumbs
        sx={{
          "& .MuiBreadcrumbs-separator": {
            color: ({ palette: { white, grey } }) =>
              light ? white.main : grey[600],
          },
        }}
      >
        {/* Icon trang chủ */}
        <Link to="/">
          <MDTypography
            component="span"
            variant="body2"
            color={light ? "white" : "dark"}
            opacity={light ? 0.8 : 0.5}
            sx={{ lineHeight: 0 }}
          >
            <Icon>{icon}</Icon>
          </MDTypography>
        </Link>

        {/* Các phần của đường dẫn */}
        {pathnames.map((value, index) => {
          const isLast = index === pathnames.length - 1;
          const name = getRouteName(value, index);
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;

          return isLast ? (
            <MDTypography
              key={to}
              variant="button"
              fontWeight="regular"
              textTransform="capitalize"
              color={light ? "white" : "dark"}
              sx={{ lineHeight: 0 }}
            >
              {name}
            </MDTypography>
          ) : (
            <Link to={to} key={to}>
              <MDTypography
                component="span"
                variant="button"
                fontWeight="regular"
                textTransform="capitalize"
                color={light ? "white" : "dark"}
                opacity={light ? 0.8 : 0.5}
                sx={{ lineHeight: 0 }}
              >
                {name}
              </MDTypography>
            </Link>
          );
        })}
      </MuiBreadcrumbs>

      {/* Tiêu đề hiện tại */}
      {pathnames.length > 0 && (
        <MDTypography
          fontWeight="bold"
          textTransform="capitalize"
          variant="h6"
          color={light ? "white" : "dark"}
          noWrap
        >
          {getRouteName(pathnames[pathnames.length - 1], pathnames.length - 1)}
        </MDTypography>
      )}
    </MDBox>
  );
}

Breadcrumbs.defaultProps = {
  light: false,
};

Breadcrumbs.propTypes = {
  icon: PropTypes.node.isRequired,
  light: PropTypes.bool,
};

export default Breadcrumbs;
