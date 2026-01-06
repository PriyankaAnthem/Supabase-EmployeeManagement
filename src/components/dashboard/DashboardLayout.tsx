// src/components/layout/DashboardLayout.jsx

import { LogOut, Menu, Users, Building2, Pin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';   // ⬅️ Added toast import

// 🔹 Sidebar Component
const SidebarNav = ({ isOpen, toggleSidebar }) => (
  <aside
    className={`fixed top-0 left-0 z-30 h-screen bg-white shadow-md border-r transition-all duration-300
      ${isOpen ? 'w-64 p-4' : 'w-0 p-0'} overflow-hidden`}
    style={{ background: 'linear-gradient(-45deg, #ffffff, #6C7ACF)' }}
  >
    {/* Sidebar Header */}
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-lg font-bold text-gray-800">Management Actions</h2>
    </div>

    {/* Sidebar Links */}
    <nav className="space-y-3">
      <Link
        to="/employees"
        className="flex items-center justify-between px-4 py-2 rounded-lg bg-gray-100 hover:bg-blue-100 hover:text-blue-800 transition"
      >
        <span className="flex items-center gap-2">
          <Users className="h-4 w-4" /> Manage Employees
        </span>
      </Link>

      <Link
        to="/departments"
        className="flex items-center justify-between px-4 py-2 rounded-lg bg-gray-100 hover:bg-blue-100 hover:text-blue-800 transition"
      >
        <span className="flex items-center gap-2">
          <Building2 className="h-4 w-4" /> Manage Departments
        </span>
      </Link>

      <Link
        to="/designations"
        className="flex items-center justify-between px-4 py-2 rounded-lg bg-gray-100 hover:bg-blue-100 hover:text-blue-800 transition"
      >
        <span className="flex items-center gap-2">
          <Pin className="h-4 w-4" /> Manage Designations
        </span>
      </Link>
    </nav>
  </aside>
);

// 🔹 Top Bar Component
const TopBar = ({ onSignOut, toggleSidebar }) => (
  <header className="sticky top-0 z-20 bg-card shadow-sm w-full">
    <div className="flex justify-between items-center px-6 py-4 border-b">
      <div className="flex items-center gap-4">
        {/* Toggle Button */}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="inline-flex">
          <Menu className="h-5 w-5" />
        </Button>

        {/* Branding */}
        <div className="h-8 w-8 bg-[#001F7A] text-white rounded-lg flex items-center justify-center font-bold">
          EMS
        </div>
        <div>
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          <p className="text-xs text-muted-foreground">Employee Management System</p>
        </div>
      </div>

      {/* Sign Out Button */}
      <Button className="bg-[#001F7A] text-white hover:bg-[#0029b0]" onClick={onSignOut}>
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </div>
  </header>
);

// 🔹 Main Layout Component
const DashboardLayout = ({ children }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar toggle state
  const { toast } = useToast(); // ⬅️ Toast hook

  const handleSignOut = async () => {
    await signOut(); // ✅ Keep your existing functionality
    toast({
      title: "Signed Out",
      description: "Successfully signed out",
      variant: "default", // or "success" if you have it
      duration: 2000,
    });
    navigate('/auth'); // ✅ Still navigates after signout
  };

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <SidebarNav isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <TopBar onSignOut={handleSignOut} toggleSidebar={toggleSidebar} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
