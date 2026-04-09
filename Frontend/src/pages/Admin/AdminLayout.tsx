import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Database, FileText, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import AdminIllustration from '../../assets/Innovation-bro.svg';

export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu when a link is clicked on mobile
  const closeMenu = () => setIsMobileMenuOpen(false);

  // The Sidebar Content (reused for mobile and desktop)
  const SidebarContent = () => (
    <>
      <div className="p-6 border-b-4 border-brand-black bg-brand-orange flex justify-between items-center">
        <h2 className="font-black text-xl tracking-widest uppercase text-brand-black">Command</h2>
        {/* Mobile Close Button */}
        <button className="md:hidden" onClick={closeMenu}>
          <X size={28} className="text-brand-black" />
        </button>
      </div>
      
      <nav className="flex flex-col p-4 gap-2 flex-1">
        <NavLink to="/admin" end onClick={closeMenu} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 font-bold uppercase text-sm border-2 transition-all ${isActive ? 'bg-brand-black text-white border-brand-black shadow-solid-sm translate-x-1' : 'bg-white text-brand-black border-transparent hover:border-brand-black'}`}>
          <LayoutDashboard size={20} /> Overview
        </NavLink>
        <NavLink to="/admin/students" onClick={closeMenu} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 font-bold uppercase text-sm border-2 transition-all ${isActive ? 'bg-brand-black text-white border-brand-black shadow-solid-sm translate-x-1' : 'bg-white text-brand-black border-transparent hover:border-brand-black'}`}>
          <Users size={20} /> Students
        </NavLink>
        <NavLink to="/admin/questions" onClick={closeMenu} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 font-bold uppercase text-sm border-2 transition-all ${isActive ? 'bg-brand-black text-white border-brand-black shadow-solid-sm translate-x-1' : 'bg-white text-brand-black border-transparent hover:border-brand-black'}`}>
          <Database size={20} /> Question Bank
        </NavLink>
        <NavLink to="/admin/tests" onClick={closeMenu} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 font-bold uppercase text-sm border-2 transition-all ${isActive ? 'bg-brand-black text-white border-brand-black shadow-solid-sm translate-x-1' : 'bg-white text-brand-black border-transparent hover:border-brand-black'}`}>
          <FileText size={20} /> Test Manager
        </NavLink>
      </nav>
    </>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-brand-white relative overflow-hidden">
      
      {/* Static illustration accent (no animation) */}
      <img
        src={AdminIllustration}
        alt=""
        className="pointer-events-none hidden lg:block absolute -right-24 bottom-0 w-[620px] max-w-none opacity-25"
      />

      {/* --- MOBILE HEADER (Visible only on small screens) --- */}
      <div className="md:hidden bg-white border-b-4 border-brand-black p-4 flex justify-between items-center z-20 sticky top-0">
        <h2 className="font-black text-lg tracking-widest uppercase">Admin Panel</h2>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-1 border-2 border-brand-black shadow-solid-sm active:translate-y-1 active:shadow-none bg-brand-orange">
          <Menu size={24} className="text-brand-black" />
        </button>
      </div>

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex w-64 bg-white border-r-4 border-brand-black flex-col z-20">
        <SidebarContent />
      </aside>

      {/* --- MOBILE SLIDE-IN MENU --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Dark Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="md:hidden fixed inset-0 bg-brand-black/60 z-40 backdrop-blur-sm"
            />
            {/* Slide-in Sidebar */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="md:hidden fixed top-0 left-0 bottom-0 w-3/4 max-w-sm bg-white border-r-4 border-brand-black flex flex-col z-50 shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto relative z-10 p-4 md:p-0">
        <motion.div key={location.pathname} className="h-full">
          <Outlet /> 
        </motion.div>
      </main>

    </div>
  );
}