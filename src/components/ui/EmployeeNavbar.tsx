import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  Home,
  User,
  Upload,
  ClipboardCheck,
  FileText,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLogin } from "@/contexts/LoginContext";

const EmployeeNavbar: React.FC = () => {
  const { logout } = useLogin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const [isOpen] = useState(true);

  const employeeRoutes = [
    "/employee/dashboard",
    "/employee/my-profile",
    "/employee/document-upload",
    "/employee/apply-leave",
    "/employee/task-status",
    "/employee/upload-document",
    "/employee/monthly-report",
  ];

  // Hide Navbar if route not in employee routes
  if (!employeeRoutes.includes(location.pathname.toLowerCase())) return null;

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/employee/login", { replace: true });
      toast({ title: "Success", description: "Signed out successfully" });
    } catch {
      toast({ title: "Error", description: "Could not sign out properly" });
    }
  };

  return (
    <>
      {isOpen && (
        <nav
          className="bg-card border-b"
          style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
        >
          <div className="w-full max-w-full px-4 py-1 flex items-center justify-between">
            {/* Left: Logo + Navigation Links */}
            <div className="flex items-center space-x-6">
              {/* Company Logo */}
              <img
                src="/logo.png"
                alt="Company Logo"
                className="h-12 w-auto"
              />

              {/* Navigation Links */}
              <div className="flex items-center space-x-3">
                <Link
                  to="/employee/dashboard"
                  className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md transition 
                  ${location.pathname === "/employee/dashboard"
                      ? "bg-[#001F7A] text-white hover:bg-[#0029b0] hover:text-white hover:scale-105 transition"
                      : "text-[#001F7A]hover:bg-[#001F7A] hover:text-white hover:scale-105 "
                    }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>

                <Link
                  to="/employee/my-profile"
                  className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md transition 
                  ${location.pathname === "/employee/my-profile"
                      ? "bg-[#001F7A] text-white hover:bg-[#0029b0] hover:text-white hover:scale-105 transition"
                      : "text-[#001F7A]hover:bg-[#001F7A] hover:text-white hover:scale-105 hover:shadow-sm"
                    }`}
                >
                  <User className="h-4 w-4" />
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/employee/upload-document"
                  className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md transition 
                  ${location.pathname === "/employee/upload-document"
                      ? "bg-[#001F7A] text-white hover:bg-[#0029b0] hover:text-white hover:scale-105 transition"
                      : "text-[#001F7A]hover:bg-[#001F7A] hover:text-white hover:scale-105 hover:shadow-sm"
                    }`}
                >
                  <Upload className="h-4 w-4" />
                  <span>Documents</span>
                </Link>

                <Link
                  to="/employee/apply-leave"
                  className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md transition 
                  ${location.pathname === "/employee/apply-leave"
                      ? "bg-[#001F7A] text-white hover:bg-[#0029b0] hover:text-white hover: scale-105 transition"
                      : "text-[#001F7A]hover:bg-[#001F7A] hover:scale-105 hover:shadow-sm"
                    }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>My Leaves</span>
                </Link>

                <Link
                  to="/employee/task-status"
                  className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md transition 
                  ${location.pathname === "/employee/task-status"
                      ? "bg-[#001F7A] text-white hover:bg-[#0029b0] hover:text-white hover:scale-105 transition"
                      : "text-[#001F7A]hover:bg-[#001F7A] hover:scale-105 hover:shadow-sm"
                    }`}
                >
                  <ClipboardCheck className="h-4 w-4" />
                  <span>Task Status</span>
                </Link>
                <Link
                  to="/employee/monthly-report"
                  className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md transition 
                  ${location.pathname === "/employee/monthly-report"
                      ? "bg-[#001F7A] text-white hover:bg-[#0029b0] hover:text-white hover:scale-105 transition"
                      : "text-[#001F7A]hover:bg-[#001F7A] hover:scale-105 hover:shadow-sm"
                    }`}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Monthly Report</span>
                </Link>
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
                Logout
              </Button>
            </div>
          </div>
        </nav>
      )}
    </>
  );
};

export default EmployeeNavbar;
