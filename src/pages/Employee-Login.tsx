import logo from '/public/logo.png'; 
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";


const EmployeeLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({ email: "", password: "" });
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [loading, setLoading] = useState(false);
  const inactivityTimer = useRef<number | null>(null);

  // 🔐 Password rule
  const generatePassword = (employee: any) => {
  const empCode = employee.employee_code || "";
  const phone = employee.phone || "";
  
  // handle both "dob" and "date_of_birth" field names
  const dobValue = employee.dob || employee.date_of_birth || "";
  
  let year = "0000";
  if (dobValue) {
    const parsedDate = new Date(dobValue);
    if (!isNaN(parsedDate.getTime())) {
      year = parsedDate.getFullYear().toString();
    }
  }

  const last3 = empCode.slice(-3);
  const last4 = phone.slice(-4);

  return `${last3}#${last4}@${year}`;
};
const validateEmail = (email: string) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|info|org|net|co|io)$/;
  return regex.test(email);
};

  // ✅ LOGIN
  // ✅ LOGIN
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
   if (!validateEmail(form.email)) {
    toast({
      title: "Invalid Email",
      description: "Please enter a valid email like example@gmail.com",
      variant: "destructive",
    });
    return;
  }
  setLoading(true);
  try {
    const emailToCheck = form.email.trim().toLowerCase();

    // fetch admin and employee in parallel
    const [{ data: adminData, error: adminError }, { data: empAuth, error: empError }] =
      await Promise.all([
        supabase.from("tbladmins").select("id").eq("email", emailToCheck).maybeSingle(),
        supabase.from("tblemployees").select("*").eq("email", emailToCheck).maybeSingle(),
      ]);

    if (adminError) throw adminError;
    if (empError) {
      // if empError is present, continue to throw "Account not found." below
      // but we still want to check if adminData exists — however requirement is to error only when both exist.
    }

    // Only throw conflict when email exists in BOTH tables
    if (adminData && empAuth) {
      throw new Error("An admin account exists with this email.");
    }

    // Proceed with normal employee login flow
    if (!empAuth) throw new Error("Account not found.");
    if (empAuth.status !== "Active") throw new Error("Account is inactive.");

    const expected = generatePassword(empAuth);
    if (form.password !== expected) throw new Error("Invalid password format.");

    localStorage.setItem("employee", JSON.stringify(empAuth));
    toast({ title: "Login Successful", description: "Welcome back!" });
    navigate("/employee/Dashboard");
  } catch (err: any) {
    toast({ title: "Login Failed", description: err.message, variant: "destructive" });
  } finally {
    setLoading(false);
  }
};



  // ✅ REGISTER
  // ✅ REGISTER
const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    // 🆕 Check if email exists in tbladmins also
    const { data: adminExists } = await supabase
      .from("tbladmins")
      .select("admin_id")
      .eq("email", form.email)
      .maybeSingle();

    if (adminExists) throw new Error("An admin account exists with this email.");

    const { data: emp, error: empError } = await supabase
      .from("tblemployees")
      .select("*")
      .eq("email", form.email)
      .single();

    if (empError || !emp) throw new Error("Email not found in employee records.");

    const generatedPassword = generatePassword(emp);

    const { error: insertError } = await supabase.from("tblemployeeauth").insert([
      {
        employee_id: emp.employee_id,
        email: form.email,
        password: generatedPassword,
        status: "Active",
        role: "employee",
        employee_code: emp.employee_code,
        phone: emp.phone,
        dob: emp.date_of_birth,
      },
    ]);

    if (insertError) throw insertError;

    toast({
      title: "Registration Successful",
      description: `Your account has been created. Use password: ${generatedPassword}`,
    });

    setMode("login");
  } catch (err: any) {
    toast({ title: "Error", description: err.message, variant: "destructive" });
  } finally {
    setLoading(false);
  }
};


  // ✅ FORGOT PASSWORD (send reset request)
  const handleForgotPassword = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    const { data: empAuth, error } = await supabase
      .from("tblemployeeauth")
      .select("employee_id")
      .eq("email", form.email)
      .single();

    if (error || !empAuth) throw new Error("Account not found.");

    // Step 1: Create the password reset request
    const { data: inserted, error: insertError } = await supabase
      .from("tblpasswordresets")
      .insert([
        {
          email: form.email,
          employee_id: empAuth.employee_id,
          status: "Pending",
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    toast({
      title: "Request Sent",
      description: "Admin will review your password reset request shortly.",
    });

    // Step 2: Subscribe to real-time updates for this record
    const channel = supabase
      .channel("password_reset_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tblpasswordresets",
          filter: `id=eq.${inserted.id}`,
        },
        (payload) => {
          console.log("Realtime update:", payload);
          const newStatus = payload.new.status;
          if (newStatus === "Approved") {
            toast({
              title: "Approved",
              description: "Your password reset request has been approved!",
            });
            channel.unsubscribe();
            navigate("/employee/reset-password", { state: { email: form.email } });
          } else if (newStatus === "Rejected") {
            toast({
              title: "Rejected",
              description: "Your password reset request was rejected by admin.",
              variant: "destructive",
            });
            channel.unsubscribe();
          }
        }
      )
      .subscribe();

    // Clean up subscription when leaving
    return () => {
      channel.unsubscribe();
    };
  } catch (err: any) {
    toast({ title: "Error", description: err.message, variant: "destructive" });
  } finally {
    setLoading(false);
  }
};


  // 🕒 Auto logout for inactivity
  const resetInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = window.setTimeout(() => {
      toast({
        title: "Session Expired",
        description: "You were logged out due to inactivity.",
        variant: "destructive",
      });
      localStorage.removeItem("employee");
      navigate("/employee/login");
    }, 5 * 60 * 1000);
  };

  useEffect(() => {
    const events = ["mousemove", "mousedown", "keypress", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetInactivityTimer));
    resetInactivityTimer();
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      events.forEach((e) => window.removeEventListener(e, resetInactivityTimer));
    };
  }, []);

  // 🧱 UI
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">

       <button
      onClick={() => navigate("/")} // navigates back to previous page
      className="absolute top-6 left-6 flex items-center gap-2 group"
       style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
    >
      <img
        src="/logo.png"
       
       alt="Company Logo" className="h-12 w-auto"
      />
      
    </button>
      <h1 className="text-blue-700 text-3xl font-bold mb-8">Employee Portal</h1>

      <Card
        className="w-full max-w-md shadow-2xl rounded-3xl border border-white/30 backdrop-blur-md"
        style={{ background: "linear-gradient(-45deg, #ffffff, #c9d0fb)" }}
      >
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            {mode === "login"
              ? "Employee Login"
              : mode === "register"
              ? "Register Employee Account"
              : "Forgot Password"}
          </CardTitle>
          <CardDescription className="text-gray-600 mt-1">
            {mode === "login"
              ? "Enter credentials to access your dashboard."
              : mode === "register"
              ? "Create your employee account."
              : "Request password reset approval from admin."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 mt-4">
          <form
            onSubmit={
              mode === "login"
                ? handleLogin
                : mode === "register"
                ? handleRegister
                : handleForgotPassword
            }
          >
            <div>
              <Label>Email</Label>
               <Input
  type="email"
  value={form.email}
  onChange={(e) => {
    const v = e.target.value;

    // allow only characters valid for emails
    if (/^[a-zA-Z0-9@._-]*$/.test(v)) {
      setForm({ ...form, email: v });
    }
  }}
  required
/>

            </div>

            {mode === "login" && (
  <div className="relative">
    <Label>Password</Label>
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
        className="pr-10"
      />
      <span
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500 hover:text-gray-700"
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </span>
    </div>
    <p className="text-xs text-gray-600 mt-1">
      Hint: Last 3 digits of Employee code + # + last 4 digits of phone number + @ + birth year i.e 999#0000@1857
    </p>
  </div>
)}

            <div className="flex items-center justify-center mt-6">
              <Button
                type="submit"
                disabled={loading}
                className="w-64 bg-[#001F7A] text-white hover:bg-[#002f9a] transition"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : mode === "login"
                ? "Sign In"
                : mode === "register"
                ? "Register"
                : "Send Request"}
              </Button>
            </div>

            {/* 🔁 Toggle buttons */}
            <div className="mt-4 text-center space-y-2">
              {mode !== "login" && (
                <Button
                  variant="outline"
                  onClick={() => setMode("login")}
                  className="w-64 bg-[#001F7A] text-white hover:bg-[#002f9a] transition"
                >
                  Back to Login
                </Button>
              )}
              {mode === "login" && (
                <>
                <div>

                  </div>
                  {/*
                  <Button
                    variant="outline"
                    onClick={() => setMode("forgot")}
                    className="w-64 bg-[#001F7A] text-white hover:bg-[#002f9a] transition"
                  >
                    Forgot Password?
                  </Button>*/}
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeLogin;
