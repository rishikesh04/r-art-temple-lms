import { motion } from 'framer-motion';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <main className="w-full max-w-7xl mx-auto px-6 py-16 md:py-24 overflow-hidden">
      
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
            <button className="px-8 py-4 bg-brand-orange border-2 border-brand-black font-bold text-lg shadow-solid hover:-translate-y-1 hover:-translate-x-1 hover:shadow-solid-hover active:translate-y-0 active:translate-x-0 active:shadow-none transition-all">
              Join the Platform
            </button>
          </div>
        </motion.div>

        {/* Right Side: Animated Math & Science Graphic */}
        <motion.div 
          className="w-full lg:w-1/2 relative h-[400px] flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Main Floating Container */}
          <motion.div 
            animate={{ y: [-12, 12, -12] }} 
            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
            className="relative w-72 h-72"
          >
            {/* Orange Backdrop Square */}
            <div className="absolute inset-0 bg-brand-orange border-[6px] border-brand-black rounded-3xl rotate-6 shadow-solid"></div>
            
            {/* White Front Square */}
            <div className="absolute inset-0 bg-white border-[6px] border-brand-black rounded-3xl -rotate-3 shadow-solid flex flex-col items-center justify-center overflow-hidden">
                
                {/* The Pi Symbol (Math) */}
                <div className="absolute top-4 left-6 text-6xl font-black text-brand-black drop-shadow-[3px_3px_0_rgba(255,87,34,1)]">π</div>

                {/* The Atom (Science) */}
                <svg className="w-32 h-32 text-brand-black z-10" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6">
                  <ellipse cx="50" cy="50" rx="40" ry="15" transform="rotate(30 50 50)" />
                  <ellipse cx="50" cy="50" rx="40" ry="15" transform="rotate(-30 50 50)" />
                  <circle cx="50" cy="50" r="8" fill="currentColor" />
                </svg>

                {/* The Triangle Ruler (Math) */}
                <svg className="absolute bottom-[-10px] right-[-10px] w-32 h-32 text-brand-orange fill-brand-orange stroke-brand-black" viewBox="0 0 100 100" strokeWidth="6" strokeLinejoin="round">
                  <path d="M10 90 L90 90 L10 10 Z" />
                  <circle cx="30" cy="70" r="6" fill="white" stroke="currentColor" strokeWidth="4"/>
                </svg>
            </div>
            
            {/* Floating '+' Symbol */}
            <motion.div 
              animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }} 
              transition={{ repeat: Infinity, duration: 3 }} 
              className="absolute -top-6 -right-6 bg-white border-[4px] border-brand-black w-14 h-14 rounded-full flex items-center justify-center font-bold text-3xl shadow-solid-sm text-brand-orange z-20"
            >
              +
            </motion.div>

            {/* Floating '%' Symbol */}
            <motion.div 
              animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }} 
              transition={{ repeat: Infinity, duration: 3.5, delay: 0.5 }} 
              className="absolute -bottom-4 -left-6 bg-brand-orange border-[4px] border-brand-black w-14 h-14 rounded-full flex items-center justify-center font-bold text-2xl shadow-solid-sm text-white z-20"
            >
              %
            </motion.div>

          </motion.div>
        </motion.div>

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