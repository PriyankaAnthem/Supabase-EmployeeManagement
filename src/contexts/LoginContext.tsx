import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminUser {
  id: string;
  email: string;
  user_name: string;
  role: string;
}

interface LoginContextType {
  user: AdminUser | null;
  loading: boolean;
  signUp: (email: string, password: string, userName: string) => Promise<{ error: any; message?: string }>;
  login: (emailOrUsername: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
}

const LoginContext = createContext<LoginContextType | undefined>(undefined);

export const useLogin = () => {
  const context = useContext(LoginContext);
  if (!context) throw new Error('useLogin must be used within a LoginProvider');
  return context;
};

export const LoginProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('admin_session');
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  // ------------------------
  // Sign Up
  // ------------------------
  const signUp = async (email: string, password: string, userName: string) => {
    try {
      const { error } = await supabase.from('tbladmins').insert({
        email: email.trim().toLowerCase(),
        password, // hash in production!
        user_name: userName,
        role: 'admin',
      });

      return { error };
    } catch (err: any) {
      return { error: { message: err.message || 'Signup failed' } };
    }
  };

  // ------------------------
  // Login
  // ------------------------
  const login = async (emailOrUsername: string, password: string) => {
    try {
      let query = supabase.from('tbladmins').select('id, email, user_name, password, role');

      if (emailOrUsername.includes('@')) {
        query = query.eq('email', emailOrUsername.toLowerCase());
      } else {
        query = query.eq('user_name', emailOrUsername);
      }

      const { data: adminData, error } = await query.maybeSingle();
      if (error || !adminData) return { error: { message: 'Admin not found' } };
      if (adminData.password !== password) return { error: { message: 'Incorrect password' } };

      // ✅ Update context and localStorage
      const adminUser: AdminUser = {
        id: adminData.id,
        email: adminData.email,
        user_name: adminData.user_name,
        role: adminData.role,
      };
      setUser(adminUser);
      localStorage.setItem('admin_session', JSON.stringify(adminUser));

      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message || 'Login failed' } };
    }
  };

  // ------------------------
  // Logout
  // ------------------------
  const logout = async () => {
    setUser(null);
    localStorage.removeItem('admin_session');
  };

  return (
    <LoginContext.Provider value={{ user, loading, signUp, login, logout }}>
      {children}
    </LoginContext.Provider>
  );
};
