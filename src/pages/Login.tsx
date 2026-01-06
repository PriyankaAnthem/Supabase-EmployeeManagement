import logo from '/public/logo.png'; // or '@/assets/logo.png' if you store it in src/assets
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '@/contexts/LoginContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';


const Login = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // ✅ new states for admin code verification
  const [showCodeStep, setShowCodeStep] = useState(false);
  const [adminCode, setAdminCode] = useState('');

  const { login, logout, user } = useLogin();
  const { toast } = useToast();
  const inactivityTimer = useRef<number | null>(null);
  const navigate = useNavigate();

  // ✅ navigate only once when user is logged in
  useEffect(() => {
    if (user && window.location.pathname !== '/dashboard') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);
  const validateEmail = (email: string) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|info|org|net|co|io)$/;
  return regex.test(email);
};


  // ✅ Signup (New Admin)
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: emailOrUsername,
        password,
      });
      if (error) throw error;

      const { error: dbError } = await supabase.from('tbladmins').insert([
        { email: emailOrUsername, password, user_name: emailOrUsername, role: 'admin' },
      ]);
      if (dbError) throw dbError;

      toast({
        title: 'Signup Success',
        description: 'Account created. Check your email for verification link.',
      });
      setShowSignup(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Login
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // ✅ email validation
  if (!validateEmail(emailOrUsername)) {
    toast({
      title: "Invalid Email",
      description: "Please enter a valid email like example@gmail.com",
      variant: "destructive",
    });
    return;
  }

  setLoading(true);
  try {
    const { data, error } = await supabase
      .from('tbladmins')
      .select('*')
      .eq('email', emailOrUsername)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Admin not found');
    if (data.password !== password) throw new Error('Incorrect password');

    toast({ title: 'Login Success', description: `Welcome ${data.user_name || 'Admin'}` });
    localStorage.setItem('admin_id', data.id);
    localStorage.setItem('admin_role', data.role || 'admin');

    await login(data.email, password);
  } catch (err: any) {
    toast({ title: 'Login Error', description: err.message, variant: 'destructive' });
  } finally {
    setLoading(false);
  }
};


  // ✅ Forgot Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!resetEmail) {
      toast({ title: 'Error', description: 'Enter your email', variant: 'destructive' });
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('tbladmins')
        .select('email')
        .eq('email', resetEmail)
        .maybeSingle();

      if (!data) {
        toast({
          title: 'Error',
          description: 'This account is not registered.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: 'http://localhost:8080/new-password',
      });
      if (error) throw error;

      toast({ title: 'Success', description: 'Check your inbox for the reset link!' });
      setResetEmail('');
      setShowReset(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Auto Logout after 5 mins of Inactivity
  useEffect(() => {
    if (!user) return;

    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = window.setTimeout(() => {
        toast({
          title: 'Session Expired',
          description: 'You were logged out due to inactivity.',
          variant: 'destructive',
        });
        logout();
        navigate('/login', { replace: true });
      }, 5 * 60 * 1000);
    };

    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, resetTimer));

    resetTimer();

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [user, logout, navigate, toast]);

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

      <h1 className="text-blue-700 text-3xl font-bold mb-8">Admin Portal</h1>

      <Card
        className="w-full max-w-md shadow-2xl rounded-3xl border border-white/30 backdrop-blur-md"
        style={{ background: 'linear-gradient(-45deg, #ffffff, #c9d0fb)' }}
      >
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            {showReset ? 'Reset Password' : showSignup ? 'Sign Up' : 'Login'}
          </CardTitle>
          <CardDescription className="text-gray-600 mt-1">
            {showReset
              ? 'Enter your email to receive reset link.'
              : showSignup
              ? 'Create an admin account.'
              : 'Enter your credentials to access the admin dashboard.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 mt-4">
          {/* ✅ Conditional Forms */}
          {showReset ? (
            // Forgot Password Form
            <form onSubmit={handleResetPassword}>
              <Label>Email</Label>
             <Input
  type="email"
  value={emailOrUsername}
  onChange={(e) => {
    const v = e.target.value;

    // allow only valid email characters
    if (/^[a-zA-Z0-9@._-]*$/.test(v)) {
      setEmailOrUsername(v);
    }
  }}
  required
/>


              <div className="flex items-center justify-center mt-4">
                <Button type="submit" disabled={loading} className="w-64 bg-[#001F7A] text-white hover:bg-[#002f9a] transition">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Reset Email'}
                </Button>
              </div>
              <div className="mt-2 text-right">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowReset(false);
                  }}
                  className="text-sm text-gray-600 hover:underline"
                >
                  Back to Login
                </a>
              </div>
            </form>
          ) : showSignup ? (
            // Signup Form
            <form onSubmit={handleSignup}>
              <Label>Email</Label>
              <Input
                type="email"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
              />
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={10} /> : <Eye size={10} />}
                </button>
              </div>

              <div className="flex items-center justify-center mt-6">
                <Button type="submit" disabled={loading} className="w-64 bg-[#001F7A] text-white hover:bg-[#002f9a] transition">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
                </Button>
              </div>
              <div className="mt-2 text-center">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowSignup(false);
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Back to Login
                </a>
              </div>
            </form>
          ) : (
            // Login Form
            <form onSubmit={handleSubmit}>
              <Label>Email</Label>
              <Input
                type="email"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
              />
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                  placeholder="Enter your password"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 cursor-pointer text-gray-600 hover:text-gray-800"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>

              <div className="flex items-center justify-center mt-6">
                <Button type="submit" disabled={loading} className="w-64 bg-[#001F7A] text-white hover:bg-[#002f9a] transition">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
                </Button>
              </div>
              <div className="mt-3 text-center flex flex-col gap-2">
                {/* ✅ Modified Sign Up link to open code verification */}
                {/*}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowCodeStep(true);
                  }}
                  className="text-sm text-gray-600 hover:underline"
                >
                  Don’t have an account? Sign Up
                </a>*/}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowReset(true);
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* ✅ Admin Code Verification Modal */}
      {showCodeStep && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80">
            <h2 className="text-lg font-semibold text-center text-gray-800 mb-3">
              Admin Code Verification
            </h2>
            <Input
              type="password"
              placeholder="Enter Admin Code"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              className="mb-4"
            />
            <div className="flex justify-between">
              <Button
                className="bg-gray-400 text-white hover:bg-gray-500"
                onClick={() => {
                  setShowCodeStep(false);
                  setAdminCode('');
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#001F7A] text-white hover:bg-[#002f9a]"
                onClick={() => {
                  if (adminCode === 'admin@123') {
                    toast({
                      title: 'Access Granted',
                      description: 'You may now sign up as an admin.',
                    });
                    setShowCodeStep(false);
                    setShowSignup(true);
                  } else {
                    toast({
                      title: 'Access Denied',
                      description: 'Invalid admin code.',
                      variant: 'destructive',
                    });
                  }
                }}
              >
                Verify
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
