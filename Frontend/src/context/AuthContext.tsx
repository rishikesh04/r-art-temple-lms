import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '../utils/axiosInstance';

// Define the shape of our User data
interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  classLevel?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // When the app loads, check if we already have a secure cookie session!
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await axiosInstance.get('/auth/me');
        if (res.data.user) {
          setUser(res.data.user);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = (userData: User) => setUser(userData);

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to easily use this context in any component
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};