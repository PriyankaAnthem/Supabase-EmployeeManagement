import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import logo from '/public/logo.png'; 
const Role = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role: string) => {
    if (role === "Employee") {
      toast.success("Redirecting to Employee Login...");
      navigate("/employee/login");
    } else if (role === "Admin") {
      toast.success("Redirecting to Admin Login...");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
    <button
      onClick={() => navigate(-1)} // navigates back to previous page
      className="absolute top-6 left-6 flex items-center gap-2 group"
       style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
    >
      <img
        src="/logo.png"
       
       alt="Company Logo" className="h-12 w-auto"
          
    />
      
    </button>

      <h1 className="text-blue-700 text-3xl font-bold mb-8">Select Role</h1>
      <Card
        className="w-full max-w-md shadow-2xl rounded-3xl border border-white/30 backdrop-blur-md"
        style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
      >
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">Choose Your Role</CardTitle>
          <CardDescription className="text-gray-600 mt-1">
            Proceed to your login portal.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4">
            <Button
              className="w-full bg-[#001F7A] text-white hover:bg-[#002f9a]"
              onClick={() => handleRoleSelect("Employee")}
            >
              Employee
            </Button>

            <Button
              className="w-full bg-[#001F7A] text-white hover:bg-[#002f9a]"
              onClick={() => handleRoleSelect("Admin")}
            >
              Admin
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Role;
