import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';
// No page-load animation (keep UX snappy + consistent).
import LearningBro from '../assets/Learning-bro.svg';
import LearningPana from '../assets/Learning-pana.svg';
import Beaker from '../assets/beaker chemistry-bro.svg';
import { Link } from 'react-router-dom';

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
    <main className="min-h-[calc(100vh-88px)] px-4 py-10 relative">
      {/* Orange corner fills (FF5722) like your sketch */}
      <div
        className="pointer-events-none absolute left-0 bottom-0 h-44 w-64 bg-brand-orange/25"
        style={{
          borderTopRightRadius: 80,
          backgroundImage:
            'repeating-linear-gradient(135deg, rgba(17,17,17,0.28) 0px, rgba(17,17,17,0.28) 6px, rgba(255,87,34,0.0) 6px, rgba(255,87,34,0.0) 14px)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 top-0 h-44 w-64 bg-brand-orange/25"
        style={{
          borderBottomLeftRadius: 80,
          backgroundImage:
            'repeating-linear-gradient(135deg, rgba(17,17,17,0.28) 0px, rgba(17,17,17,0.28) 6px, rgba(255,87,34,0.0) 6px, rgba(255,87,34,0.0) 14px)',
        }}
        aria-hidden="true"
      />

      {/* Static illustration background (no sketches, no animation) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Side illustrations become light watermarks on mobile */}
        <img
          src={LearningPana}
          alt=""
          className="absolute -left-28 top-10 w-[360px] max-w-none opacity-25 lg:opacity-95 lg:left-0 lg:top-24 lg:w-[420px]"
        />
        <img
          src={LearningBro}
          alt=""
          className="absolute -right-28 top-8 w-[360px] max-w-none opacity-25 lg:opacity-95 lg:right-0 lg:top-20 lg:w-[420px]"
        />
        <img
          src={Beaker}
          alt=""
          className="absolute left-1/2 -translate-x-1/2 bottom-[-120px] w-[520px] max-w-none opacity-15 lg:opacity-20 lg:bottom-[-160px]"
        />
      </div>

      <div className="mx-auto w-full max-w-6xl relative z-10 flex items-center justify-center">
        {/* Center: Form card */}
        <div className="w-full max-w-md bg-white border-4 border-brand-black p-8 shadow-solid relative">
          {/* Orange corner accents behind card */}
          <div className="absolute -left-6 -top-6 h-20 w-24 bg-brand-orange/30 border-4 border-brand-black shadow-solid-sm rounded-[22px] -z-10" />
          <div className="absolute -right-6 -bottom-6 h-20 w-24 bg-brand-orange/30 border-4 border-brand-black shadow-solid-sm rounded-[22px] -z-10" />

            <div className="mb-6">
              <div className="inline-block px-3 py-1 border-2 border-brand-black bg-brand-orange text-brand-black font-bold text-xs uppercase tracking-wider shadow-solid-sm">
                Student / Admin Access
              </div>
              <h1 className="mt-4 text-3xl sm:text-4xl font-black uppercase">System Login</h1>
              <p className="mt-2 font-medium text-brand-black/70">
                Use your email & password. Students must be admin-approved.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border-2 border-brand-black text-red-600 font-bold text-sm shadow-solid-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block font-bold uppercase text-sm mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border-2 border-brand-black focus:outline-none focus:shadow-solid-sm transition-shadow font-medium bg-white"
                  placeholder="student@example.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-sm mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border-2 border-brand-black focus:outline-none focus:shadow-solid-sm transition-shadow font-medium bg-white"
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            <div className="mt-6 border-t-2 border-brand-black/10 pt-4 text-sm font-medium">
              New student?{' '}
              <Link to="/signup" className="font-black underline underline-offset-4 hover:text-brand-orange">
                Create account
              </Link>
            </div>
          </div>
      </div>
    </main>
  );
}