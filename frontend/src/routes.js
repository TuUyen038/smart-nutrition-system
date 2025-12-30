import Dashboard from "layouts/user/dashboard";
import FoodDetect from "layouts/user/food-detect";
import History from "layouts/user/history";
import Recommendation from "layouts/user/recommendation";
import Profile from "layouts/user/profile";
import SignIn from "layouts/user/authentication/sign-in";
import SignUp from "layouts/user/authentication/sign-up";
import ForgotPassword from "layouts/user/authentication/forgot-password";
import Analyze from "layouts/user/analyze-recipe";
import MenuCreation from "layouts/user/menu";
import MenuEditor from "layouts/user/menu/menu-editor";
import RecipeDetail from "layouts/user/recipe-detail";
// @mui icons
import Icon from "@mui/material/Icon";
import { ROLES } from "constants/roles";
import AdminDashboard from "layouts/admin/dashboard";
import IngredientManagement from "layouts/admin/ingredient/index.js";
import RecipeManagement from "layouts/admin/recipe/index.js";
import AdminRecipeDetail from "layouts/admin/recipe/recipe-detail/index.js";
import UserManagement from "layouts/admin/user/index.js";
const routes = [
  {
    type: "collapse",
    name: "Món ăn",
    key: "admin-recipes",
    icon: <Icon fontSize="small">science</Icon>,
    route: "/admin/recipres",
    component: <RecipeManagement />,
    requiresAuth: true,
    allowedRoles: [ROLES.ADMIN],
    layout: "admin",
    showInSidebar: true,
  },
  {
    type: "collapse",
    name: "Nguyên liệu",
    key: "admin-ingredients",
    icon: <Icon fontSize="small">science</Icon>,
    route: "/admin/ingredients",
    component: <IngredientManagement />,
    requiresAuth: true,
    allowedRoles: [ROLES.ADMIN],
    layout: "admin",
    showInSidebar: true,
  },
  {
    type: "collapse",
    name: "Người dùng",
    key: "admin-users",
    icon: <Icon fontSize="small">people</Icon>,
    route: "/admin/users",
    component: <UserManagement />,
    requiresAuth: true,
    allowedRoles: [ROLES.ADMIN],
    layout: "admin",
    showInSidebar: true,
  },
  {
    type: "collapse",
    name: "Quản trị",
    key: "admin-dashboard",
    icon: <Icon fontSize="small">admin_panel_settings</Icon>,
    route: "/admin",
    component: <AdminDashboard />,
    requiresAuth: true,
    allowedRoles: [ROLES.ADMIN],
    layout: "admin",
    showInSidebar: true,
  },
  {
    type: "collapse",
    name: "Trang chủ",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
    requiresAuth: true,
    allowedRoles: [ROLES.USER, ROLES.ADMIN],
    layout: "user",
    showInSidebar: true,
  },
  {
    name: "Chỉnh sửa thực đơn",
    key: "menu-editor",
    route: "/edit-menu",
    component: <MenuEditor />,
    requiresAuth: true,
    allowedRoles: [ROLES.USER, ROLES.ADMIN],
    layout: "user",
    showInSidebar: false, // trang “ẩn”, chỉ mở khi redirect
  },
  {
    type: "collapse",
    name: "Nhận diện món ăn",
    key: "detect-food",
    icon: <Icon fontSize="small">fastfood</Icon>,
    route: "/detect-food",
    component: <FoodDetect />,
    requiresAuth: true,
    allowedRoles: [ROLES.USER, ROLES.ADMIN],
    layout: "user",
    showInSidebar: true,
  },
  {
    type: "collapse",
    name: "Phân tích công thức",
    key: "analyze-recipe",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/analyze-recipe",
    component: <Analyze />,
    requiresAuth: true,
    allowedRoles: [ROLES.USER, ROLES.ADMIN],
    layout: "user",
    showInSidebar: true,
  },
  {
    type: "collapse",
    name: "Thực đơn",
    key: "meal-plan",
    icon: <Icon fontSize="small">event_note</Icon>,
    route: "/meal-plan",
    component: <Recommendation />,
    requiresAuth: true,
    allowedRoles: [ROLES.USER, ROLES.ADMIN],
    layout: "user",
    showInSidebar: true,
  },
  {
    type: "collapse",
    name: "Lịch sử ăn uống",
    key: "history",
    icon: <Icon fontSize="small">history</Icon>,
    route: "/history",
    component: <History />,
    requiresAuth: true,
    allowedRoles: [ROLES.USER, ROLES.ADMIN],
    layout: "user",
    showInSidebar: true,
  },
  {
    type: "collapse",
    name: "Thông tin cá nhân",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
    requiresAuth: true,
    allowedRoles: [ROLES.USER, ROLES.ADMIN],
    layout: "user",
    showInSidebar: true,
  },
  // Auth pages (public)
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
    requiresAuth: false,
    layout: "auth",
    showInSidebar: false, // thường không hiện trong sidebar chính
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
    requiresAuth: false,
    layout: "auth",
    showInSidebar: false,
  },
  {
    type: "collapse",
    name: "Forgot Password",
    key: "forgot-password",
    icon: <Icon fontSize="small">lock_reset</Icon>,
    route: "/authentication/forgot-password",
    component: <ForgotPassword />,
    requiresAuth: false,
    layout: "auth",
    showInSidebar: false,
  },
  // Route chi tiết (không show sidebar)
  {
    key: "recipe-detail",
    name: "Chi tiết món ăn",
    route: "/recipes/:id",
    breadcrumb: "Chi tiết món ăn",
    component: <RecipeDetail />,
    requiresAuth: true,
    allowedRoles: [ROLES.USER, ROLES.ADMIN],
    layout: "user",
    showInSidebar: false,
  },
  {
    key: "admin-recipe-detail",
    name: "Chi tiết món ăn (Admin)",
    route: "/admin/recipes/:id",
    breadcrumb: "Chi tiết món ăn",
    component: <AdminRecipeDetail />,
    requiresAuth: true,
    allowedRoles: [ROLES.ADMIN],
    layout: "admin",
    showInSidebar: false,
  },
];

export default routes;
