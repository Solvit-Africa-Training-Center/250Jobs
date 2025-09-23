import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  if (loading) return <div className="pt-24 px-6">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  const role = (user?.role || "").toLowerCase();
  if (role !== "admin") return <Navigate to="/" replace />;
  return children;
}

