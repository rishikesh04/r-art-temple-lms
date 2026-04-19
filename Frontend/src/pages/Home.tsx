import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import InnovationVideo from '../assets/Innovation (1).mp4';
import Beaker from '../assets/beaker chemistry-bro.svg';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
  };

  // SPA-friendly: when navigating back to '/', restart video
  useEffect(() => {
    if (location.pathname !== '/') return;
    const v = videoRef.current;
    if (!v) return;
    try {
      v.currentTime = 0;
      const p = v.play();
      if (p && typeof (p as Promise<void>).catch === 'function') {
        (p as Promise<void>).catch(() => {
          // autoplay might be blocked; ignore silently
        });
      }
    } catch {
      // ignore
    }
  }, [location.pathname]);

  return (
    <main className="w-full max-w-7xl mx-auto px-6 py-16 md:py-24 overflow-hidden relative">
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
      
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-24">
        
        {/* Left Side: Text */}
        <motion.div 
          className="w-full lg:w-1/2"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-4 py-1 border-2 border-brand-black bg-brand-orange text-brand-black font-bold text-sm uppercase tracking-wider mb-6 shadow-solid-sm">
            Exclusive Coaching LMS
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-brand-black leading-[1.1] mb-6">
            Master Math & Science with <span className="text-brand-orange relative whitespace-nowrap">
              Precision.
              <svg className="absolute w-full h-4 -bottom-2 left-0 text-brand-black" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
              </svg>
            </span>
          </h1>
          <p className="text-lg font-medium text-brand-black/80 max-w-xl mb-8">
            The ultimate digital arena for approved students. Take rigorous tests, analyze your performance, and climb the ranks in a distraction-free environment.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-brand-orange border-2 border-brand-black font-bold text-lg shadow-solid hover:-translate-y-1 hover:-translate-x-1 hover:shadow-solid-hover active:translate-y-0 active:translate-x-0 active:shadow-none transition-all"
            >
              Join the Platform
            </button>
          </div>
        </motion.div>

        {/* Right Side: innovation video (plays once) */}
        <div className="w-full lg:w-1/2 relative">
          <div className="relative mx-auto max-w-xl overflow-hidden">
            <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border-2 border-brand-black bg-brand-orange px-3 py-1 text-xs font-black uppercase tracking-widest text-brand-black shadow-solid-sm">
              <img src={Beaker} alt="" className="h-5 w-5" />
              Innovation Lab
            </div>

            <video
              src={InnovationVideo}
              autoPlay
              muted
              playsInline
              ref={videoRef}
              className="h-[360px] w-full object-cover rounded-2xl"
            />
          </div>
        </div>

      </div>

      {/* Animated Features Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {/* Feature 1 */}
        <motion.div variants={cardVariants} className="bg-white border-4 border-brand-black p-8 shadow-solid hover:-translate-y-2 hover:-translate-x-2 hover:shadow-solid-hover transition-all duration-300">
          <div className="w-14 h-14 bg-brand-orange border-2 border-brand-black rounded-full shadow-solid-sm mb-6 flex items-center justify-center">
            <span className="font-bold text-xl text-white">1</span>
          </div>
          <h3 className="font-bold text-2xl mb-3">Live Assessments</h3>
          <p className="font-medium text-brand-black/80 leading-relaxed">
            Take timed, secure tests designed specifically for your class level. Strict environment, real results.
          </p>
        </motion.div>

        {/* Feature 2 */}
        <motion.div variants={cardVariants} className="bg-white border-4 border-brand-black p-8 shadow-solid hover:-translate-y-2 hover:-translate-x-2 hover:shadow-solid-hover transition-all duration-300">
          <div className="w-14 h-14 bg-brand-orange border-2 border-brand-black rounded-full shadow-solid-sm mb-6 flex items-center justify-center">
            <span className="font-bold text-xl text-white">2</span>
          </div>
          <h3 className="font-bold text-2xl mb-3">Deep Analytics</h3>
          <p className="font-medium text-brand-black/80 leading-relaxed">
            Review detailed reports post-test. Understand the correct answers, explanations, and your accuracy percentage.
          </p>
        </motion.div>

        {/* Feature 3 */}
        <motion.div variants={cardVariants} className="bg-white border-4 border-brand-black p-8 shadow-solid hover:-translate-y-2 hover:-translate-x-2 hover:shadow-solid-hover transition-all duration-300">
          <div className="w-14 h-14 bg-brand-orange border-2 border-brand-black rounded-full shadow-solid-sm mb-6 flex items-center justify-center">
            <span className="font-bold text-xl text-white">3</span>
          </div>
          <h3 className="font-bold text-2xl mb-3">Private Access</h3>
          <p className="font-medium text-brand-black/80 leading-relaxed">
            No public noise. Only admin-approved students gain entry, ensuring a focused, high-quality learning ecosystem.
          </p>
        </motion.div>
      </motion.div>

    </main>
  );
}