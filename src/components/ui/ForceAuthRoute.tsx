// ForceAuthRoute.tsx
import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  children: JSX.Element;
}

const ForceAuthRoute = ({ children }: Props) => {
  const { signOut } = useAuth();

  useEffect(() => {
    // On fresh load, clear any existing user session in context
    signOut();
  }, [signOut]);

  // Immediately redirect to auth page
  return <Navigate to="/auth" replace />;
};

export default ForceAuthRoute;
