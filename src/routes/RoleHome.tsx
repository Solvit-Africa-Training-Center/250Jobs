import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TechnicianDashboard from "../app/Technician/TechnicianDashboard";

export default function RoleHome() {
  const { user } = useAuth();
  const role = (user?.role || "").toLowerCase();
  if (role === "employer") {
    return <Navigate to="/employer/dashboard" replace />;
  }
  if (role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <TechnicianDashboard/>;
}
