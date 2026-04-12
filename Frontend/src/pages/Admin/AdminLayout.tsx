import { useState } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Database, 
  FileText, 
  BarChart3, 
  Menu, 
  X, 
  ChevronRight,
  LogOut,
  Bell,
  Settings,
  Home as HomeIcon
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/admin', name: 'Overview', icon: LayoutDashboard, end: true },
    { path: '/admin/students', name: 'Students', icon: Users },
    { path: '/admin/tests', name: 'Tests', icon: FileText },
    { path: '/admin/results', name: 'Results', icon: BarChart3 },
    { path: '/admin/questions', name: 'Bank', icon: Database },
  ];

  const secondaryItems = [
    { name: 'Notifications', icon: Bell },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F8FAFC]">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex w-72 flex-col fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-30 transition-all duration-300">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-200">
            R
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-slate-900 leading-tight">Admin Portal</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Art Temple LMS</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Core Management</p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `
                group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200
                ${isActive 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className={location.pathname === item.path ? 'text-brand-orange' : 'group-hover:text-brand-orange transition-colors'} />
                <span className="font-semibold text-sm">{item.name}</span>
              </div>
              {location.pathname === item.path && (
                <motion.div layoutId="activeNav" className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
              )}
            </NavLink>
          ))}

          <div className="pt-8 opacity-50">
            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">System</p>
            {secondaryItems.map((item) => (
              <button
                key={item.name}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 transition-colors"
                disabled
              >
                <item.icon size={20} />
                <span className="font-semibold text-sm">{item.name}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 mt-auto border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 p-3 mb-3">
            <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center font-bold text-slate-700 shadow-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Administrator'}</span>
              <span className="text-[10px] font-medium text-slate-500 truncate">System Managed</span>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* --- MOBILE CONTENT --- */}
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen relative">
        
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 transition-all duration-300">
          <div className="px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-orange-100">
                R
              </div>
              <span className="font-bold text-slate-900 tracking-tight">Admin Portal</span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 pb-24 md:p-12 md:pb-12 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* --- MOBILE BOTTOM NAV --- */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.end && location.pathname === '/admin');
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-brand-orange' : 'text-slate-400'}`}
              >
                <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-orange-50' : ''}`}>
                  <item.icon size={22} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-tight">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}