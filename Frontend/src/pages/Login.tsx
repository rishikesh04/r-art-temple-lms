import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import LearningPana from '../assets/Learning-pana.svg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      login(res.data.user);
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4 relative overflow-hidden font-['Inter']">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#ff5722]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ff5722]/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl flex items-center justify-center gap-12 lg:gap-20 relative z-10">
        
        {/* Left Side: Illustration (Hidden on mobile) */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden lg:block lg:w-1/2"
        >
          <img 
             src={LearningPana} 
             alt="Access Learning" 
             className="w-full h-auto drop-shadow-[0_20px_50px_rgba(255,87,34,0.1)]"
          />
        </motion.div>

        {/* Right Side: Login Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 relative">
            
            <div className="mb-8">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
              <p className="text-slate-500 font-medium mt-2">Sign in to continue your learning journey</p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 border border-rose-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ff5722] transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 ring-1 ring-slate-200 focus:ring-2 focus:ring-[#ff5722] outline-none transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Password</label>
                  <Link to="/forgot-password" title="Coming soon!" className="text-[11px] font-bold text-[#ff5722] hover:underline">Forgot password?</Link>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ff5722] transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-12 text-slate-900 font-medium placeholder:text-slate-400 ring-1 ring-slate-200 focus:ring-2 focus:ring-[#ff5722] outline-none transition-all"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#ff5722] text-white py-4 rounded-2xl font-black text-lg shadow-[0_10px_20px_rgba(255,87,34,0.15)] hover:shadow-[0_15px_30px_rgba(255,87,34,0.25)] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Sign In <ArrowRight size={20} />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-sm font-medium text-slate-500">
                New to our platform?{' '}
                <Link to="/signup" className="text-[#ff5722] font-black hover:underline underline-offset-4">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-relaxed">
        Secure Access &bull; Student Dashboard &bull; Admin Panel
      </div>
    </main>
  );
}