import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TechnicianHeader from "./components/Technicians/TechnicianHeader";
import AdminHeader from "./components/Admin/AdminHeader";
import TechProfile from "./components/Technicians/TechProfile";
import TechnicianDashboard from "./app/Technician/TechnicianDashboard";
import Subscription from "./components/Technicians/Subscription";
import AIAssistant from "./components/Technicians/AIAssistant";
import ChatPage from "./components/chat/ChatPage";
import Login from "./app/Auth/Login";
import Register from "./app/Auth/Register";
import ResetPassword from "./app/Auth/ResetPassword";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useLocation } from "react-router-dom";
import EmployerHeader from "./components/Employers/EmployerHeader";
import EmployerDashboard from "./app/Employers/EmployerDashboard";
import EmployerProfile from "./components/Employers/EmployerProfile";
import RoleHome from "./routes/RoleHome";
import EmployerRoute from "./routes/EmployerRoute";
import AdminRoute from "./routes/AdminRoute";
import AdminDashboard from "./app/Admin/AdminDashboard";
import AdminUsers from "./app/Admin/AdminUsers";
import AdminTechnicians from "./app/Admin/AdminTechnicians";
import AdminSubscriptions from "./app/Admin/AdminSubscriptions";
import TechnicianRoute from "./routes/TechnicianRoute";
import { useTheme } from "./context/ThemeContext";
import ScrollToTop from "./components/ScrollToTop";
// import EmployerHeader from "./components/Employers/EmployerHeader";
// import EmployerDashboard from "./app/Employers/EmployerDashboard";




function App() {
  const location = useLocation();
  const hideHeader = ["/login", "/register", "/reset-password"].includes(location.pathname);
  const isEmployer = location.pathname.startsWith("/employer");
  const isAdmin = location.pathname.startsWith("/admin");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
   <>
   {/* Technician */}

    {!hideHeader && (isAdmin ? <AdminHeader /> : isEmployer ? <EmployerHeader /> : <TechnicianHeader />)} 
      <div
        className={`min-h-screen no-anchor ${!hideHeader ? 'pt-16' : ''} ${!hideHeader ? (isDark ? 'bg-gray-900 text-gray-100' : 'bg-[#F8FCFF] text-gray-900') : ''}`}
      >
        <ScrollToTop />
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/" element={<ProtectedRoute><RoleHome/></ProtectedRoute>} />
        <Route path="/techprofile" element={<TechnicianRoute><TechProfile /></TechnicianRoute>} />
        <Route path="/subscription" element={<TechnicianRoute><Subscription /></TechnicianRoute>} />
        <Route path="/Assistant" element={<TechnicianRoute><AIAssistant /></TechnicianRoute>} />
        <Route path="/message" element={<TechnicianRoute><ChatPage /></TechnicianRoute>} /> 

        {/* Employer */}
        <Route path="/employer/dashboard" element={<EmployerRoute><EmployerDashboard /></EmployerRoute>} />
        <Route path="/employer/messages" element={<EmployerRoute><ChatPage /></EmployerRoute>} />
        <Route path="/employer/profile" element={<EmployerRoute><EmployerProfile /></EmployerRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/technicians" element={<AdminRoute><AdminTechnicians /></AdminRoute>} />
        <Route path="/admin/subscriptions" element={<AdminRoute><AdminSubscriptions /></AdminRoute>} />
      </Routes>
      </div>



      {/* Employer  */}
       {/* <EmployerHeader /> 
      <Routes>
        <Route path="/employer/dashboard" element={<EmployerDashboard />} />
       <Route path="/employer/assistant" element={<AIAssistant />} />
         <Route path="" element={""} />
         <Route path="" element={""} />
         <Route path="" element={""} /> 
      </Routes> */}

    </>
  );
}

export default App;
