import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      
      // Save user to global state
      login(res.data.user);
      
      // Redirect based on role
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md bg-white border-4 border-brand-black p-8 shadow-solid"
      >
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black uppercase mb-2">System Login</h1>
          <p className="font-medium text-brand-black/70">Enter your credentials to access the arena.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-brand-black text-red-600 font-bold text-sm shadow-solid-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block font-bold uppercase text-sm mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border-2 border-brand-black focus:outline-none focus:shadow-solid-sm transition-shadow font-medium"
              placeholder="student@example.com"
            />
          </div>

          <div>
            <label className="block font-bold uppercase text-sm mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-2 border-brand-black focus:outline-none focus:shadow-solid-sm transition-shadow font-medium"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 bg-brand-orange border-2 border-brand-black font-bold text-lg shadow-solid hover:-translate-y-1 hover:-translate-x-1 hover:shadow-solid-hover active:translate-y-0 active:translate-x-0 active:shadow-none transition-all disabled:opacity-70"
          >
            {isLoading ? 'AUTHENTICATING...' : 'ENTER'}
          </button>
        </form>
      </motion.div>
    </main>
  );
}