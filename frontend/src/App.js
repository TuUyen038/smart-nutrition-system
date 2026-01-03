import { useState, useEffect, useMemo } from "react";

// react-router components
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";

// Material Dashboard 2 React themes
import theme from "assets/theme";

// Material Dashboard 2 React Dark Mode themes
import themeDark from "assets/theme-dark";

// RTL plugins
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Material Dashboard 2 React routes
import routes from "routes";

// Material Dashboard 2 React contexts
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";
import { ToastProvider } from "context/ToastContext";

// Auth & Protected Route
import { isAuthenticated, getMe, getUser } from "services/authApi";
import ProtectedRoute from "components/ProtectedRoute";

// Images
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const { pathname } = useLocation();

  // Cache for the rtl
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });

    setRtlCache(cacheRtl);
  }, []);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Change the openConfigurator state
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  // Verify authentication when app loads
  useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated()) {
        setIsVerifying(false);
        return;
      }

      try {
        // Verify token by calling getMe API
        await getMe();
      } catch (error) {
        console.error("Token verification failed:", error);
        // Token invalid, clear auth data
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAuth();
  }, []);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        // Wrap route with ProtectedRoute if requires auth
        const element = route.requiresAuth ? (
          <ProtectedRoute allowedRoles={route.allowedRoles} requiresAuth={route.requiresAuth}>
            {route.component}
          </ProtectedRoute>
        ) : (
          route.component
        );

        return <Route exact path={route.route} element={element} key={route.key} />;
      }

      return null;
    });

  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  // Show loading while verifying auth
  if (isVerifying) {
    return (
      <ThemeProvider theme={darkMode ? themeDark : theme}>
        <CssBaseline />
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <MDBox textAlign="center">
            <MDBox
              component="div"
              sx={{
                width: "4rem",
                height: "4rem",
                border: "4px solid",
                borderColor: "info.main",
                borderTopColor: "transparent",
                borderRadius: "50%",
                "@keyframes spin": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" },
                },
                animation: "spin 1s linear infinite",
                mx: "auto",
                mb: 2,
              }}
            />
            <MDTypography variant="body2" color="text">
              Đang kiểm tra phiên đăng nhập...
            </MDTypography>
          </MDBox>
        </MDBox>
      </ThemeProvider>
    );
  }

  // Filter routes for sidebar based on user role
  const getFilteredRoutes = () => {
    if (!isAuthenticated()) {
      // Chỉ hiển thị public routes và có showInSidebar
      return routes.filter((route) => !route.requiresAuth && route.showInSidebar !== false);
    }

    const user = getUser();
    if (!user) return [];

    return routes.filter((route) => {
      // Chỉ hiển thị routes có showInSidebar !== false
      if (route.showInSidebar === false) return false;

      // Show routes that don't require auth
      if (!route.requiresAuth) return true;

      // Show routes that match user's role
      if (route.allowedRoles && route.allowedRoles.length > 0) {
        return route.allowedRoles.includes(user.role);
      }

      // Show routes that require auth but no specific role
      return true;
    });
  };

  const filteredRoutes = getFilteredRoutes();

  return (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      <ToastProvider>
        {layout === "dashboard" && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
              brandName="NutriCare"
              routes={filteredRoutes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
            <Configurator />
            {configsButton}
          </>
        )}
        {layout === "vr" && <Configurator />}
        <Routes>
          {getRoutes(routes)}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </ToastProvider>
    </ThemeProvider>
  );
}
