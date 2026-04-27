import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Blocks unauthenticated users from /admin/*
export default function ProtectedRoute() {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;
  return <Outlet />;
}

// Guards routes that require role === "admin" or "super_admin"
export function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) return <Navigate to="/admin" replace />;
  return children;
}

// Guards routes hidden from "member" role (super_admin + admin + coordinator allowed)
export function NonMemberRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role === "member") return <Navigate to="/admin" replace />;
  return children;
}
