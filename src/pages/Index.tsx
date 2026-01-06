import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building, Users, Shield, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <div className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div
            className="inline-flex items-center justify-center w-20 h-20 bg-primary/30 rounded-full mb-6 shadow-lg transition-transform duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(-45deg, #ffffff, #c9d0fb)",
            }}
          >
            <Building className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-foreground">
            Employee Management System
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 mb-10 max-w-3xl mx-auto leading-relaxed">
            Comprehensive admin dashboard for managing employees, departments,
            and designations with powerful CRUD operations.
          </p>

          {/* ✅ Changed Button */}
          <div className="flex items-center justify-center mt-6">
            <Link to="/employee/login">
              <Button
                className="bg-[#001F7A] text-white px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-[#0029b0] transition text-sm"
                title="Click to select your role"
              >
                <Shield className="h-5 w-5" />
                Login
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {/* Employee Management Card */}
          <Card
            className="bg-primary/20 border border-primary/30 text-foreground rounded-2xl p-6 transform transition-transform hover:-translate-y-3 hover:scale-105 animate-fade-in"
            style={{
              animationDelay: "0.1s",
              background: "linear-gradient(-45deg, #ffffff, #c9d0fb)",
            }}
          >
            <CardHeader>
              <div className="w-16 h-16 bg-secondary/30 rounded-lg flex items-center justify-center mb-4 shadow-md">
                <Users className="w-8 h-8 text-foreground" />
              </div>
              <CardTitle className="text-xl font-bold text-foreground">
                Employee Management
              </CardTitle>
              <CardDescription className="text-foreground/80 mt-1">
                Complete CRUD operations for employee records.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-foreground/90 list-disc list-inside">
                <li>Add new employees with full details</li>
                <li>Edit existing employee information</li>
                <li>Delete employee records</li>
                <li>Search and filter employees</li>
              </ul>
            </CardContent>
          </Card>

          {/* Department Control Card */}
          <Card
            className="border border-primary/30 text-foreground rounded-2xl p-6 transform transition-transform hover:-translate-y-3 hover:scale-105 animate-fade-in"
            style={{
              animationDelay: "0.1s",
              background: "linear-gradient(-45deg, #ffffff, #c9d0fb)",
            }}
          >
            <CardHeader>
              <div className="w-16 h-16 bg-secondary/30 rounded-lg flex items-center justify-center mb-4 shadow-md">
                <Building className="w-8 h-8 text-foreground" />
              </div>
              <CardTitle className="text-xl font-bold text-foreground">
                Department Control
              </CardTitle>
              <CardDescription className="text-foreground/80 mt-1">
                Organize your workforce with comprehensive department
                management.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-foreground/90 list-disc list-inside">
                <li>Create and manage departments</li>
                <li>Set department locations</li>
                <li>Assign employees to departments</li>
                <li>Track department statistics</li>
              </ul>
            </CardContent>
          </Card>

          {/* Secure Access Card */}
          <Card
            className="bg-primary/20 border border-primary/30 text-foreground rounded-2xl p-6 transform transition-transform hover:-translate-y-3 hover:scale-105 animate-fade-in"
            style={{
              animationDelay: "0.1s",
              background: "linear-gradient(-45deg, #ffffff, #c9d0fb)",
            }}
          >
            <CardHeader>
              <div className="w-16 h-16 bg-secondary/30 rounded-lg flex items-center justify-center mb-4 shadow-md">
                <Shield className="w-8 h-8 text-foreground" />
              </div>
              <CardTitle className="text-xl font-bold text-foreground">
                Secure Access
              </CardTitle>
              <CardDescription className="text-foreground/80 mt-1">
                Role-based admin authentication with secure data management.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-foreground/90 list-disc list-inside">
                <li>Admin-only access control</li>
                <li>Secure authentication system</li>
                <li>Protected dashboard routes</li>
                <li>Session management</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Call-to-Action */}
        <div className="text-center mt-20">
          <p className="text-foreground/90 mb-6 text-lg md:text-xl drop-shadow-md">
            Ready to manage your workforce effectively?
          </p>
          <div className="flex items-center justify-center mt-6">
            <Link to="/employee/login">
              <Button
                className="bg-[#001F7A] text-white px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-[#0029b0] transition text-sm font-semibold"
                title="Get Started Now"
              >
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
