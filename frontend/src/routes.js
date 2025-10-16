import Dashboard from "layouts/dashboard";
import FoodDetect from "layouts/food-detect";
import History from "layouts/history";
import Recommendation from "layouts/recommendation";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import Analyze from "layouts/analyze-recipe";
import MenuCreation from "layouts/menu";
import MenuEditor from "layouts/menu/menu-editor";
// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Trang chủ",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    name: "Chỉnh sửa thực đơn",
    key: "menu-editor",
    route: "/edit-menu",
    component: <MenuEditor />,
  },
  {
    type: "collapse",
    name: "Nhận diện món ăn",
    key: "detect-food",
    icon: <Icon fontSize="small">fastfood</Icon>,
    route: "/detect-food",
    component: <FoodDetect />,
  },
  {
    type: "collapse",
    name: "Phân tích công thức",
    key: "analyze-recipe",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/analyze-recipe",
    component: <Analyze />,
  },
  {
    type: "collapse",
    name: "Lịch sử ăn uống",
    key: "history",
    icon: <Icon fontSize="small">history</Icon>,
    route: "/history",
    component: <History />,
  },
  {
    type: "collapse",
    name: "Gợi ý thực đơn",
    key: "recommendation",
    icon: <Icon fontSize="small">auto_awesome</Icon>,
    route: "/recommendation",
    component: <Recommendation />,
  },
  {
    type: "collapse",
    name: "Thông tin cá nhân",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
  },
];

export default routes;
