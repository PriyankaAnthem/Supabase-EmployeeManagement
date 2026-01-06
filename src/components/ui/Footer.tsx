import React from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "@/contexts/LoginContext";

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useLogin(); // ✅ From your context for Admin login

  const handleLinkClick = (e: React.MouseEvent, guestPath: string) => {
    e.preventDefault();

    // ✅ If Admin logged in (handled by context)
    if (user) {
      navigate("/dashboard");
      return;
    }

    // ✅ If Employee logged in (from localStorage)
    const employeeData = localStorage.getItem("employee");
    if (employeeData) {
      navigate("/employee/dashboard");
      return;
    }
    const currentPath = location.pathname;
    const restrictedPaths = ["/", "/admin-login", "/employee/login"];
    if (restrictedPaths.includes(currentPath)) {
      navigate("/");
      return;
    }

    // ✅ Otherwise, allow navigation to guest pages
 

    // ✅ If not logged in — go to actual privacy or terms page
    navigate(guestPath);
  };

  return (
    <footer
      className="border-t shadow-md mt-6"
      style={{
        background: "linear-gradient(-45deg, #ffffff, #c9d0fb)",
      }}
    >
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center text-sm text-gray-700">
        <p className="mb-2 md:mb-0">
          © {new Date().getFullYear()} Management System. All rights reserved.
        </p>

        <div className="flex space-x-4">
          <a
            href="/privacy"
            onClick={(e) => handleLinkClick(e, "/privacy")}
            className="hover:text-[#001F7A] transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            onClick={(e) => handleLinkClick(e, "/terms")}
            className="hover:text-[#001F7A] transition-colors"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
