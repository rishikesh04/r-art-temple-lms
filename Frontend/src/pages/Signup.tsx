import { useMemo, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Phone, GraduationCap, Lock, CheckCircle2, ArrowRight, Loader2, X, ChevronDown } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import LearningBro from '../assets/Learning-bro.svg';

type ClassLevel = '6' | '7' | '8' | '9' | '10' | '';

export default function Signup() {
  const navigate = useNavigate();
  const classLevels = useMemo<Exclude<ClassLevel, ''>[]>(() => ['6', '7', '8', '9', '10'], []);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [classLevel, setClassLevel] = useState<ClassLevel>('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const canSubmit =
    name.trim().length >= 2 &&
    email.trim().length > 0 &&
    phone.trim().length >= 10 &&
    classLevel !== '' &&
    password.length >= 6 &&
    !isLoading;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (classLevel === '') {
      setError('Please select your class');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await axiosInstance.post('/auth/signup', {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        classLevel,
      });
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4 relative overflow-hidden font-['Inter']">
      
      {/* Background Orbs */}
      <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] bg-[#ff5722]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] bg-[#ff5722]/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-6xl flex items-center justify-center gap-12 lg:gap-20 relative z-10">
        
        {/* Right Side Card (Form) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg"
        >
          {/* Header */}
          <div className="text-center mb-8 px-4">
             <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Create Account</h1>
             <p className="text-slate-500 font-medium mt-2">Join our learning platform and start your journey today</p>
          </div>

          {/* Signup Card */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 relative">
            
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

            <form onSubmit={handleSignup} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ff5722] transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 ring-1 ring-slate-200 focus:ring-2 focus:ring-[#ff5722] outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ff5722] transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 ring-1 ring-slate-200 focus:ring-2 focus:ring-[#ff5722] outline-none transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ff5722] transition-colors">
                      <Phone size={18} />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 ring-1 ring-slate-200 focus:ring-2 focus:ring-[#ff5722] outline-none transition-all"
                      placeholder="9999999999"
                    />
                  </div>
                </div>
                <div className="space-y-1.5" ref={dropdownRef}>
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Class</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full bg-slate-50 rounded-2xl py-3.5 pl-12 pr-4 text-left font-bold ring-1 ring-slate-200 transition-all flex items-center justify-between group
                        ${isDropdownOpen ? 'ring-2 ring-[#ff5722] bg-white' : 'hover:bg-slate-100'}
                        ${classLevel ? 'text-slate-900' : 'text-slate-400'}
                      `}
                    >
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors">
                         <GraduationCap size={18} />
                      </div>
                      <span>{classLevel ? `Class ${classLevel}` : 'Choose...'}</span>
                      <ChevronDown size={18} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-[#ff5722]' : 'text-slate-400'}`} />
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden py-2"
                        >
                          {classLevels.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                setClassLevel(c);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full px-6 py-3 text-left text-sm font-bold transition-all flex items-center justify-between
                                ${classLevel === c ? 'bg-[#ff5722]/5 text-[#ff5722]' : 'text-slate-600 hover:bg-slate-50'}
                              `}
                            >
                              Class {c}
                              {classLevel === c && <div className="w-1.5 h-1.5 rounded-full bg-[#ff5722]" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ff5722] transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-12 text-slate-900 font-medium placeholder:text-slate-400 ring-1 ring-slate-200 focus:ring-2 focus:ring-[#ff5722] outline-none transition-all"
                    placeholder="Min. 6 characters"
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
                disabled={!canSubmit}
                className="w-full bg-[#ff5722] text-white py-4 mt-2 rounded-2xl font-black text-lg shadow-[0_10px_20px_rgba(255,87,34,0.15)] hover:shadow-[0_15px_30px_rgba(255,87,34,0.25)] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Create Account <ArrowRight size={20} />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm font-medium text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-[#ff5722] font-black hover:underline underline-offset-4">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Left Side: Illustration (Hidden on mobile) */}
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden lg:block lg:w-1/2"
        >
          <img 
             src={LearningBro} 
             alt="Start Learning" 
             className="w-full h-auto drop-shadow-[0_20px_50px_rgba(255,87,34,0.1)]"
          />
        </motion.div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowSuccessModal(false)}
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl text-center"
            >
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="absolute right-6 top-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>

              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                <CheckCircle2 size={40} />
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">Registration Success!</h2>
              <p className="text-slate-500 font-medium leading-relaxed mb-8">
                Your account has been created. To maintain security, an admin will review and approve your access shortly.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/login');
                  }}
                  className="flex-1 py-4 bg-[#ff5722] text-white rounded-2xl font-black uppercase tracking-wide shadow-lg shadow-[#ff5722]/20 hover:shadow-[#ff5722]/30 transition-all active:scale-95"
                >
                  Go to Login
                </button>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase tracking-wide hover:bg-slate-100 transition-all active:scale-95"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

