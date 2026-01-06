// src/components/ui/Navbar.tsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  Users,
  Building,
  Briefcase,
  Home,
  Key,
  CalendarCheck,
  ClipboardList,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/contexts/LoginContext";
import { useToast } from "@/hooks/use-toast";

const Navbar: React.FC = () => {
  const { logout } = useLogin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const [isOpen] = useState(true);

  const managementRoutes = [
    "/dashboard",
    "/employees",
    "/departments",
    "/designations",
    "/requests",
    "/approve-leave",
    "/tasks-status",
     "/employee-action/assign-task",
     "/employee-document/:id",
  ];

  if (!managementRoutes.includes(location.pathname)) return null;

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/admin-login", { replace: true });
      toast({ title: "Success", description: "Signed out successfully" });
    } catch {
      toast({ title: "Error", description: "Could not sign out properly" });
    }
  };

  return (
    <>
      {isOpen && (
        <nav
          className="bg-card border-b shadow-sm"
          style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
        >
          <div className="w-full px-6 py-2 flex items-center justify-between gap-8">

            {/* Left: Logo + Links */}
            <div className="flex items-center space-x-6">
              {/* Logo */}
              <img src="/logo.png" alt="Company Logo" className="h-12 w-auto" />

              {/* Navigation Links */}
              <div className="flex items-center space-x-3 mr-6">
                {/* Dashboard */}
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md transition 
                    ${
                      location.pathname === "/dashboard"
                        ? "bg-[#001F7A] text-white hover:bg-[#0029b0] hover:text-white hover:scale-105 transition"
                        : "hover:bg-[#e6e9ff] hover:scale-105 hover:shadow-sm"
                    }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>

                {/* Employees */}
                <Link
                  to="/employees"
                  className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md transition 
                    ${
                      location.pathname === "/employees"
                        ? "bg-[#001F7A] text-white hover:bg-[#0029b0] hover:text-white hover:scale-105 transition"
                        : "hover:bg-[#e6e9ff] hover:scale-105 hover:shadow-sm"
                    }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Manage Employees</span>
                </Link>

                {/* Departments */}
                <Link
                  to="/departments"
                  className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md transition 
                    ${
                      location.pathname === "/departments"
                        ? "bg-[#001F7A] text-white hover:bg-[#0029b0] hover:text-white hover:scale-105 transition"
                        : "hover:bg-[#e6e9ff] hover:scale-105 hover:shadow-sm"
                    }`}
                >
                  <Building className="h-4 w-4" />
                  <span>Manage Departments</span>
                </Link>

                {/* Designations */}
                <Link
                  to="/designations"
                  className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md transition 
                    ${
                      location.pathname === "/designations"
                        ? "bg-[#001F7A] text-white hover:bg-[#0029b0] hover:text-white hover:scale-105 transition"
                        : "hover:bg-[#e6e9ff] hover:scale-105 hover:shadow-sm"
                    }`}
                >
                  <Briefcase className="h-4 w-4" />
                  <span>Manage Designations</span>
                </Link>

                {/* Reset Desk
                <Link
                  to="/requests"
                  className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md transition 
                    ${
                      location.pathname === "/requests"
                        ? "bg-[#001F7A] text-white"
                        : "hover:bg-[#e6e9ff] hover:scale-105 hover:shadow-sm"
                    }`}
                >
                  <Key className="h-4 w-4" />
                  <span>Reset Desk</span>
                </Link> */}

                {/* Leave Desk */}
                                {/* ✅ TaskBoard */}
              <Link
  to="/approve-leave"
  className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md transition 
    ${
      location.pathname === "/approve-leave"
        ? "bg-[#001F7A] text-white hover:bg-[#0029b0] hover:text-white hover:scale-105 transition"
        : "hover:bg-[#e6e9ff] hover:scale-105 hover:shadow-sm"
    }`}
>
  <CalendarCheck className="h-4 w-4" />
  <span>Leaves Approval</span>
</Link>

                {/* ✅ TaskBoard */}
                <Link
                  to="/tasks-status"
                  className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md transition 
                    ${
                      location.pathname === "/tasks-status"
                        ? "bg-[#001F7A] text-white hover:bg-[#0029b0] hover:text-white hover:scale-105 transition"
                        : "hover:bg-[#e6e9ff] hover:scale-105"
                    }`}
                >
                  <ClipboardList className="h-4 w-4" />
                  <span>Task Board</span>
                </Link>

                {/* ✅ Notifications */}
                
              </div>
            </div>

            {/* Right: Sign Out */}
            <div className="flex items-center">
              <Button
                className="bg-[#001F7A] text-white px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-[#0029b0] transition text-sm"
                title="Sign out"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </Button>
            </div>
          </div>
        </nav>
      )}
    </>
  );
};

export default Navbar;
