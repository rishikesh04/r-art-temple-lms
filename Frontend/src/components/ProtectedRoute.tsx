import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactElement } from 'react';

interface ProtectedRouteProps {
  children: ReactElement;
  allowedRole?: 'student' | 'admin';
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // Show a brutalist loading screen while checking backend
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-4xl font-black uppercase border-4 border-brand-black p-4 shadow-solid animate-pulse">
          Loading Data...
        </div>
      </div>
    );
  }

  // Not logged in? Kick to login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required, check it
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  // Students must be approved!
  if (user.role === 'student' && user.status !== 'approved') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white border-4 border-brand-black p-8 shadow-solid max-w-md">
          <h2 className="text-3xl font-black mb-4">ACCOUNT PENDING</h2>
          <p className="font-medium text-lg">Your account is waiting for Admin approval. Please check back later.</p>
        </div>
      </div>
    );
  }

  // If they pass all checks, show them the page!
  return children;
}