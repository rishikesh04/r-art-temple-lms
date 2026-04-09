import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login'; 
import ProtectedRoute from './components/ProtectedRoute'; 
import { useAuth } from './context/AuthContext'; 
import AdminDashboard from './pages/Admin/AdminDashboard';

function App() {
  // 4. This asks the AuthContext: "Hey, is anyone logged in? And give me the logout function!"
  const { user, logout } = useAuth(); 

  return (
    <div className="min-h-screen flex flex-col selection:bg-brand-orange selection:text-white">
      
      {/* --- NAVBAR --- */}
      <nav className="w-full bg-white border-b-4 border-brand-black px-6 md:px-12 py-5 z-50 flex justify-between items-center sticky top-0">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-brand-orange border-2 border-brand-black shadow-solid-sm flex items-center justify-center font-bold text-xl text-brand-black transition-transform group-hover:-translate-y-1 group-hover:shadow-solid">R</div>
          <span className="font-bold text-2xl tracking-tight text-brand-black">Art Temple</span>
        </Link>
        
        <div className="hidden md:flex gap-8 font-semibold text-brand-black">
          <Link to="/" className="hover:text-brand-orange transition-colors">Platform</Link>
          
          {/* REACT LOGIC: Only show the "Hub" link IF a user exists */}
          {user && (
            <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="hover:text-brand-orange transition-colors">
              Hub
            </Link>
          )}
        </div>

        {/* REACT LOGIC: If NO user, show "Sign In". If YES user, show "Log Out" */}
        {!user ? (
          <Link to="/login" className="px-6 py-2.5 bg-white border-2 border-brand-black shadow-solid-sm font-bold text-sm uppercase tracking-wide hover:-translate-y-1 hover:-translate-x-1 hover:shadow-solid active:translate-y-0 active:translate-x-0 active:shadow-none transition-all">
            Sign In
          </Link>
        ) : (
          <button onClick={logout} className="px-6 py-2.5 bg-brand-black text-white border-2 border-brand-black shadow-solid-sm font-bold text-sm uppercase tracking-wide hover:-translate-y-1 hover:-translate-x-1 hover:shadow-solid active:translate-y-0 active:translate-x-0 active:shadow-none transition-all">
            Log Out
          </button>
        )}
      </nav>

      {/* --- PAGES (ROUTES) --- */}
      <div className="flex-1">
        <Routes>
          {/* Public Pages anyone can see */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Page: Only approved students can see this */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRole="student">
              <div className="p-20 text-center text-4xl font-black uppercase">Student Hub Coming Next</div>
            </ProtectedRoute>
          } />
          
          {/* Protected Page: Only Admins can see this */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRole="admin">
             <AdminDashboard /> 
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </div>
  );
}

export default App;