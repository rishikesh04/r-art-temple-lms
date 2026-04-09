import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';

function App() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-brand-orange selection:text-white">
      
      {/* Bold, thick-bordered Navbar */}
      <nav className="w-full bg-white border-b-4 border-brand-black px-6 md:px-12 py-5 z-50 flex justify-between items-center sticky top-0">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          {/* Logo Icon with solid shadow */}
          <div className="w-10 h-10 bg-brand-orange border-2 border-brand-black shadow-solid-sm flex items-center justify-center font-bold text-xl text-brand-black transition-transform group-hover:-translate-y-1 group-hover:shadow-solid">
            R
          </div>
          <span className="font-bold text-2xl tracking-tight text-brand-black">
            Art Temple
          </span>
        </Link>
        
        {/* Links */}
        <div className="hidden md:flex gap-8 font-semibold text-brand-black">
          <Link to="/" className="hover:text-brand-orange transition-colors">Platform</Link>
          <Link to="/dashboard" className="hover:text-brand-orange transition-colors">Student Hub</Link>
        </div>

        {/* Brutalist Button */}
        <Link to="/login" className="px-6 py-2.5 bg-white border-2 border-brand-black shadow-solid-sm font-bold text-sm uppercase tracking-wide hover:-translate-y-1 hover:-translate-x-1 hover:shadow-solid active:translate-y-0 active:translate-x-0 active:shadow-none transition-all">
          Sign In
        </Link>
      </nav>

      {/* Page Content */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<div className="p-20 text-center text-2xl font-bold">Sign In Page Next</div>} />
          <Route path="/dashboard" element={<div className="p-20 text-center text-2xl font-bold">Dashboard Next</div>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;