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
import ManageUsers from "../components/admin/ManageUsers";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <SignIn />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  
  // Admin route - this is where you'll be redirected after login
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },

  // Admin/User Management Route
  {
    path: "/manage-users",
    element: (
      <ProtectedRoute>
        <ManageUsers />
      </ProtectedRoute>
    ),
  },

  // Asset Management Routes
  {
    path: "/add-asset",
    element: (
      <ProtectedRoute>
        <AddAsset />
      </ProtectedRoute>
    ),
  },
  {
    path: "/inventory", 
    element: (
      <ProtectedRoute>
        <Inventory />
      </ProtectedRoute>
    ),
  },
  {
    path: "/categories",
    element: (
      <ProtectedRoute>
        <Categories />
      </ProtectedRoute>
    ),
  },
  {
    path: "/asset-history",
    element: (
      <ProtectedRoute>
        <AssetHistory />
      </ProtectedRoute>
    ),
  },
  {
    path: "/reports",
    element: (
      <ProtectedRoute>
        <Reports />
      </ProtectedRoute>
    ),
  },

  // Catch-all route - redirect any unknown routes to dashboard
  {
    path: "*",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
]);