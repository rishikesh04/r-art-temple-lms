import { motion } from 'framer-motion';

export default function Home() {
  // Animation variants for staggering the cards
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
              {/* Decorative underline */}
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

        {/* Right Side: The "Motion" Graphic (Inspired by your image) */}
        <motion.div 
          className="w-full lg:w-1/2 relative h-[400px] flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Continuous floating animation */}
          <motion.div 
            animate={{ y: [-15, 15, -15] }} 
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="relative"
          >
            {/* The Main "Pie/Shield" Graphic Representation */}
            <div className="w-64 h-64 bg-white border-8 border-brand-black rounded-full relative shadow-solid flex items-center justify-center overflow-hidden">
               {/* Orange Slice */}
               <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-brand-orange border-b-8 border-l-8 border-brand-black origin-bottom-left transform -rotate-12"></div>
               {/* Shield/Check Icon */}
               <div className="absolute left-6 top-1/2 -translate-y-1/2 w-20 h-24 bg-white border-4 border-brand-black rounded-b-full shadow-solid-sm flex items-center justify-center z-10">
                  <div className="w-10 h-10 border-b-4 border-r-4 border-brand-black transform rotate-45 -translate-y-2"></div>
               </div>
            </div>
            
            {/* Animated Cursor */}
            <motion.svg 
              animate={{ x: [0, -20, 0], y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute -bottom-8 -right-8 w-20 h-20 text-white drop-shadow-[4px_4px_0_rgba(17,17,17,1)]" 
              viewBox="0 0 24 24" fill="currentColor" stroke="#111" strokeWidth="2"
            >
              <path d="M4 4l7.07 17 2.51-7.39L21 11.07z"/>
            </motion.svg>
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
            <span className="font-bold text-xl">1</span>
          </div>
          <h3 className="font-bold text-2xl mb-3">Live Assessments</h3>
          <p className="font-medium text-brand-black/80 leading-relaxed">
            Take timed, secure tests designed specifically for your class level. Strict environment, real results.
          </p>
        </motion.div>

        {/* Feature 2 */}
        <motion.div variants={cardVariants} className="bg-white border-4 border-brand-black p-8 shadow-solid hover:-translate-y-2 hover:-translate-x-2 hover:shadow-solid-hover transition-all duration-300">
          <div className="w-14 h-14 bg-brand-orange border-2 border-brand-black rounded-full shadow-solid-sm mb-6 flex items-center justify-center">
            <span className="font-bold text-xl">2</span>
          </div>
          <h3 className="font-bold text-2xl mb-3">Deep Analytics</h3>
          <p className="font-medium text-brand-black/80 leading-relaxed">
            Review detailed reports post-test. Understand the correct answers, explanations, and your accuracy percentage.
          </p>
        </motion.div>

        {/* Feature 3 */}
        <motion.div variants={cardVariants} className="bg-white border-4 border-brand-black p-8 shadow-solid hover:-translate-y-2 hover:-translate-x-2 hover:shadow-solid-hover transition-all duration-300">
          <div className="w-14 h-14 bg-brand-orange border-2 border-brand-black rounded-full shadow-solid-sm mb-6 flex items-center justify-center">
            <span className="font-bold text-xl">3</span>
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