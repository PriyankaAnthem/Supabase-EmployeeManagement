// src/App.tsx
import { useEffect, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import EmployeeNavbar from "@/components/ui/EmployeeNavbar";

import { LoginProvider, useLogin } from "@/contexts/LoginContext";
import { useFormNavigation } from "@/hooks/useFormNavigation";

// ✅ Admin Pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employees";
import Departments from "@/pages/Departments";
import Designations from "@/pages/Designations";
import NewPassword from "@/pages/NewPassword";

import Requests from "@/pages/Request";
import ApproveLeave from "@/pages/ApproveLeave";
import AssignTask from "@/pages/EmployeeActions/AssignTask";
import TasksStatus from "@/pages/TasksStatus"; 
import EmployeeDocument from "@/pages/EmployeeDocument";
import Notification from  "@/pages/Notification";
import TrackAttendance from "./pages/EmployeeActions/TrackAttendance";

// ✅ Employee Pages
import EmployeeLogin from "@/pages/Employee-Login";
import EmployeeDashboard from "@/pages/employee/EmployeeDashboard";
import ResetPasswords from "@/pages/employee/ResetPaswwords";
import MyProfile from "@/pages/employee/MyProfile";
import ApplyLeave  from "@/pages/employee/ApplyLeave";
import TaskStatus from "./pages/employee/TaskStatus";
import UploadDocument from "./pages/employee/UploadDocument";
import MonthlyReport from "./pages/employee/MonthlyReport";
// ----------------------------------------------------
// 🔒 ADMIN PROTECTED ROUTE
// ----------------------------------------------------
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useLogin();
  if (loading) return null;
  return user ? children : <Navigate to="/admin-login" replace />;
};

// ----------------------------------------------------
// 👷 EMPLOYEE PROTECTED ROUTE
// ----------------------------------------------------
const EmployeeProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const employee = JSON.parse(localStorage.getItem("employee") || "null");
  if (!employee) return <Navigate to="/employee/login" replace />;
  return children;
};

// ----------------------------------------------------
// 💤 ADMIN INACTIVITY HANDLER
// ----------------------------------------------------
const AdminInactivityHandler = ({ children }: { children: React.ReactNode }) => {
  const { logout } = useLogin();
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/admin-login", { replace: true });
  };

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(handleLogout, 5 * 60 * 1000); // 5 min
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, []);

  return <>{children}</>;
};

// ----------------------------------------------------
// 💤 EMPLOYEE INACTIVITY HANDLER
// ----------------------------------------------------
const EmployeeInactivityHandler = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("employee");
    navigate("/employee/login", { replace: true });
  };

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(handleLogout, 5 * 60 * 1000); // 5 min
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, []);

  return <>{children}</>;
};

// ----------------------------------------------------
// 🌐 APP ROUTES
// ----------------------------------------------------
const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<Index />} />
    
    <Route path="/admin-login" element={<Login />} />
    <Route path="/new-password" element={<NewPassword />} />

    {/* Admin Routes */}
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/employees"
      element={
        <ProtectedRoute>
          <Employees />
        </ProtectedRoute>
      }
    />
    <Route
      path="/departments"
      element={
        <ProtectedRoute>
          <Departments />
        </ProtectedRoute>
      }
    />
    <Route
      path="/designations"
      element={
        <ProtectedRoute>
          <Designations />
        </ProtectedRoute>
      }
    />
    <Route
      path="/requests"
      element={
        <ProtectedRoute>
          <Requests />
        </ProtectedRoute>
      }
    />
    <Route
  path="/approve-leave"
  element={
    <ProtectedRoute>
      <ApproveLeave />
    </ProtectedRoute>
  }
/>
 <Route
  path="/employee-document/:id"
  element={
    <ProtectedRoute>
      <EmployeeDocument />
    </ProtectedRoute>
  }
/>

<Route
  path="/employee-action/assign-task"
  element={
    <ProtectedRoute>
      <AssignTask />
    </ProtectedRoute>
  }
/>
<Route
  path="/tasks-status"
  element={
    <ProtectedRoute>
      <TasksStatus />
    </ProtectedRoute>
  }
/>
<Route
  path="/notification"
  element={
    <ProtectedRoute>
      <Notification />
    </ProtectedRoute>
  }
/>
<Route
  path="/employee-actions/track-attendance/:id"
  element={
    <ProtectedRoute>
      <TrackAttendance />
    </ProtectedRoute>
  }
/>

    {/* Employee Routes */}
    <Route path="/employee/login" element={<EmployeeLogin />} />
    <Route
      path="/employee/dashboard"
      element={
        <EmployeeProtectedRoute>
          <EmployeeInactivityHandler>
            <EmployeeDashboard />
          </EmployeeInactivityHandler>
        </EmployeeProtectedRoute>
      }
    />
    <Route
  path="/employee/my-profile"
  element={
    <EmployeeProtectedRoute>
      <EmployeeInactivityHandler>
        <MyProfile />
      </EmployeeInactivityHandler>
    </EmployeeProtectedRoute>
  }
/>
<Route
  path="/employee/apply-leave"
  element={
    <EmployeeProtectedRoute>
      <EmployeeInactivityHandler>
        <ApplyLeave />
      </EmployeeInactivityHandler>
    </EmployeeProtectedRoute>
  }
/>
<Route
  path="/employee/task-status"
  element={
    <EmployeeProtectedRoute>
      <EmployeeInactivityHandler>
        <TaskStatus />
      </EmployeeInactivityHandler>
    </EmployeeProtectedRoute>
  }
/>
<Route
  path="/employee/upload-document"
  element={
    <EmployeeProtectedRoute>
      <EmployeeInactivityHandler>
        <UploadDocument />
      </EmployeeInactivityHandler>
    </EmployeeProtectedRoute>
  }
/>
<Route
  path="/employee/monthly-report"
  element={
    <EmployeeProtectedRoute>
      <EmployeeInactivityHandler>
        <MonthlyReport />
      </EmployeeInactivityHandler>
    </EmployeeProtectedRoute>
  }
/>

    <Route path="/employee/reset-password" element={<ResetPasswords />} />

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

// ----------------------------------------------------
// 🌟 MAIN APP (with dynamic Navbars)
// ----------------------------------------------------
const queryClient = new QueryClient();

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
 const isEmployeeRoute = /^\/employee(\/|$)/i.test(location.pathname);
  useEffect(() => {
    console.log("Current Path:", location.pathname);
    console.log("Is Employee Route?", isEmployeeRoute);
  }, [location]);

 


  return (
    <>
      {isEmployeeRoute ? <EmployeeNavbar /> : <Navbar />}
      {children}
      <Footer />
    </>
  );
};


const App = () => {
  useFormNavigation();

  return (
    <QueryClientProvider client={queryClient}>
      <LoginProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AdminInactivityHandler>
              <Layout>
                <AppRoutes />
              </Layout>
            </AdminInactivityHandler>
          </BrowserRouter>
        </TooltipProvider>
      </LoginProvider>
    </QueryClientProvider>
  );
};

export default App;
