import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCategories from "./pages/admin/Categories";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminReports from "./pages/admin/Reports";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/home",
    Component: Home,
  },
  {
    path: "/catalog",
    Component: Catalog,
  },
  {
    path: "/product/:slug",
    Component: ProductDetail,
  },
  {
    path: "/cart",
    Component: Cart,
  },
  {
    path: "/checkout",
    Component: Checkout,
  },
  {
    path: "/orders",
    Component: Orders,
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
  {
    path: "/admin/categories",
    Component: AdminCategories,
  },
  {
    path: "/admin/products",
    Component: AdminProducts,
  },
  {
    path: "/admin/orders",
    Component: AdminOrders,
  },
  {
    path: "/admin/reports",
    Component: AdminReports,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
