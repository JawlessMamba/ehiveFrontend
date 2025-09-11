import { createBrowserRouter } from "react-router-dom";
import AddAsset from "../components/AddAsset";
import Dashboard from "../components/Dashboard";
import AssetHistory from "../components/AssetHistory";
import Reports from "../components/Reports";
import Categories from "../pages/Categories";
import Inventory from '../pages/Inventory';
import ProtectedRoute from "../components/login/ProtectedRoute";
import SignIn from "../components/login/SignIn";
import SignUp from "../components/login/SignUp";
import ManageUsers from "../components/admin/ManageUsers"; // NEW IMPORT

export const router = createBrowserRouter([
  {
    path: "/",
    element:
         <ProtectedRoute>
         <Dashboard />,
         </ProtectedRoute>
  },

  {
    path: "/login",
    element: <SignIn />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  
  // NEW ROUTE FOR MANAGE USERS
  {
    path: "/manage-users",
    element: 
      <ProtectedRoute>
        <ManageUsers />
      </ProtectedRoute>,
  },

  {
    path: "/add-asset",
    element: <AddAsset />,
  },

  {
    path: "/inventory",
    element: <Inventory />,
  },

  {
    path: "/categories",
    element: <Categories />,
  },

  {
    path: "/asset-history",
    element: <AssetHistory />,
  },
  {
    path: "/reports",
    element: <Reports />,
  },
]);