import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // For demo purposes, always allow access since we're only showing admin screens
  return children;
}