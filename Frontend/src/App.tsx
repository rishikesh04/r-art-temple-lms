import { Routes, Route, Link, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import StudentManagement from './pages/Admin/StudentManagement';
import StudentDashboard from './pages/Student/StudentDashboard';
import TestsList from './pages/Student/TestsList';
import TestDetailsPage from './pages/Student/TestDetails';
import AttemptTestPage from './pages/Student/AttemptTest';
import { Menu, UserCircle, LogOut, ChevronDown, LogIn, UserPlus, LayoutDashboard } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Prevent background page from shifting/scrolling when menu is open
  useEffect(() => {
    if (!isMobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobileNavOpen]);

  return (
    <div className="min-h-screen flex flex-col selection:bg-brand-orange selection:text-white">
      
      {/* NAVBAR */}
      <nav className="w-full bg-white border-b-4 border-brand-black px-4 md:px-12 py-4 md:py-5 z-50 sticky top-0">
        <div className="mx-auto w-full max-w-7xl flex items-center justify-between gap-3">
          {/* Mobile: hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileNavOpen((v) => !v)}
            className="md:hidden h-11 w-11 inline-flex items-center justify-center border-2 border-brand-black shadow-solid-sm bg-white"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group md:flex-1 md:justify-start justify-center">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-orange border-2 border-brand-black shadow-solid-sm flex items-center justify-center font-bold text-lg md:text-xl text-brand-black transition-transform group-hover:-translate-y-1 group-hover:shadow-solid">
              R
            </div>
            <span className="font-bold text-xl md:text-2xl tracking-tight text-brand-black hidden sm:block">
              Art Temple
            </span>
          </Link>
        
          <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden md:flex gap-8 font-semibold text-brand-black uppercase text-sm tracking-widest">
            <Link to="/" className="hover:text-brand-orange transition-colors">Platform</Link>
            {user && (
              <NavLink 
                to={user.role === 'admin' ? '/admin' : '/dashboard'} 
                className={({ isActive }) =>
                  `transition-colors px-4 py-2 border-2 ${isActive ? 'bg-brand-black text-white border-brand-black shadow-solid-sm' : 'border-transparent text-brand-black hover:border-brand-black'}`
                }
              >
                Hub
              </NavLink>
            )}
          </div>

          {/* DYNAMIC PROFILE/LOGIN AREA */}
          {!user ? (
            <>
              {/* Desktop buttons */}
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="h-11 inline-flex items-center justify-center px-5 bg-white border-2 border-brand-black shadow-solid-sm font-bold text-sm uppercase tracking-wide hover:-translate-y-1 hover:-translate-x-1 hover:shadow-solid active:translate-y-0 active:translate-x-0 active:shadow-none transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="h-11 inline-flex items-center justify-center px-5 bg-brand-orange border-2 border-brand-black shadow-solid-sm font-bold text-sm uppercase tracking-wide hover:-translate-y-1 hover:-translate-x-1 hover:shadow-solid active:translate-y-0 active:translate-x-0 active:shadow-none transition-all"
                >
                  Sign Up
                </Link>
              </div>

              {/* Mobile: show Login + Signup buttons in navbar (not inside menu) */}
              <div className="md:hidden flex items-center gap-2">
                <Link
                  to="/login"
                  className="h-11 inline-flex items-center justify-center px-4 border-2 border-brand-black shadow-solid-sm bg-white font-black uppercase text-xs tracking-wide"
                >
                  <LogIn size={16} />
                  <span className="ml-2">Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="h-11 inline-flex items-center justify-center px-4 border-2 border-brand-black shadow-solid-sm bg-brand-orange font-black uppercase text-xs tracking-wide"
                >
                  <UserPlus size={16} />
                  <span className="ml-2">Signup</span>
                </Link>
              </div>
            </>
          ) : (
            <div className="relative flex items-center gap-2">
              {/* Profile Avatar Button */}
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="h-11 md:h-12 inline-flex items-center gap-2 px-3 md:px-4 bg-brand-gray/20 border-2 border-brand-black shadow-solid-sm hover:-translate-y-1 hover:shadow-solid active:translate-y-0 active:shadow-none transition-all rounded-full"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white border-2 border-brand-black shadow-solid-sm font-black text-lg text-brand-black uppercase">
                  {user.name.charAt(0)}
                </span>
                <span className="hidden md:block max-w-[10rem] truncate font-black uppercase text-sm text-brand-black">
                  {user.name}
                </span>
                <ChevronDown size={16} className="text-brand-black" />
              </button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    {/* Invisible overlay to close menu when clicking outside */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-14 md:top-16 w-64 bg-white border-4 border-brand-black shadow-solid z-50 flex flex-col"
                    >
                      <div className="p-4 border-b-4 border-brand-black bg-brand-orange/20">
                        <p className="font-black text-lg uppercase truncate">{user.name}</p>
                        <p className="font-semibold text-sm text-brand-black/70 truncate">{user.email}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 bg-brand-black text-white text-xs font-bold uppercase tracking-widest border border-brand-black">
                          {user.role}
                        </span>
                      </div>
                      
                      <div className="p-2">
                        <button className="w-full flex items-center gap-3 px-4 py-3 font-bold text-sm hover:bg-brand-gray/20 transition-colors uppercase">
                          <UserCircle size={18} /> Account Details
                        </button>
                        <button 
                          onClick={() => { logout(); setIsProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 font-bold text-sm text-red-600 hover:bg-red-50 transition-colors uppercase mt-1"
                        >
                          <LogOut size={18} /> Disconnect
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
        </div>
      </nav>

      {/* Mobile menu overlay (does NOT push page down) */}
      {isMobileNavOpen ? (
        <div className="md:hidden fixed inset-0 z-40">
          <button
            type="button"
            className="absolute inset-0 bg-brand-black/60"
            aria-label="Close menu"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="absolute left-0 right-0 top-[88px] border-b-4 border-brand-black bg-white px-4 py-3 shadow-solid">
            <div className="grid gap-2">
              <Link
                to="/"
                onClick={() => setIsMobileNavOpen(false)}
                className="flex items-center justify-between border-2 border-brand-black px-4 py-3 font-black uppercase shadow-solid-sm"
              >
                Platform <LayoutDashboard size={18} />
              </Link>

              {user ? (
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  onClick={() => setIsMobileNavOpen(false)}
                  className="flex items-center justify-between bg-brand-orange border-2 border-brand-black px-4 py-3 font-black uppercase shadow-solid-sm"
                >
                  Hub <LayoutDashboard size={18} />
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* PAGES */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />

          <Route path="/tests" element={
            <ProtectedRoute allowedRole="student">
              <TestsList />
            </ProtectedRoute>
          } />
          <Route path="/tests/:id" element={
            <ProtectedRoute allowedRole="student">
              <TestDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/tests/:id/attempt" element={
            <ProtectedRoute allowedRole="student">
              <AttemptTestPage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="questions" element={<div className="p-10 font-black text-3xl uppercase">Question Bank Next</div>} />
            <Route path="tests" element={<div className="p-10 font-black text-3xl uppercase">Test Manager Next</div>} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;