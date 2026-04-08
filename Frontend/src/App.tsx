import { Routes, Route } from 'react-router-dom';

function App() {
  // Helper to generate the little lines for the XP progress bar
  const renderProgressBar = () => {
    const segments = [];
    for (let i = 0; i < 40; i++) {
      // First 12 segments are gold (completed), rest are dark purple (uncompleted)
      const isActive = i < 12; 
      segments.push(
        <div 
          key={i} 
          className={`h-full w-1 ${isActive ? 'bg-[#FFB800] glow-purple' : 'bg-brand-500/20'}`}
        />
      );
    }
    return segments;
  };

  return (
    <div className="min-h-screen bg-brand-900 text-white flex flex-col relative">
      
      {/* Background X Grid Lines (Subtle) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
        <div className="absolute top-1/2 left-1/2 w-[150%] h-[1px] bg-brand-500 -translate-x-1/2 -translate-y-1/2 rotate-[25deg]"></div>
        <div className="absolute top-1/2 left-1/2 w-[150%] h-[1px] bg-brand-500 -translate-x-1/2 -translate-y-1/2 -rotate-[25deg]"></div>
        {/* Giant background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-brand-500/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-8 py-6 z-10 border-b border-white/5">
        <div className="text-3xl font-bold tracking-widest italic flex items-center gap-2">
          <span className="text-brand-400">R</span> ART
        </div>
        <div className="hidden md:flex gap-10 text-sm uppercase tracking-[0.2em] text-gray-400 font-semibold">
          <a href="#" className="hover:text-white transition-colors">Home</a>
          <a href="#" className="text-white border-b border-white pb-1">Academy</a>
          <a href="#" className="hover:text-white transition-colors">Codex</a>
          <a href="#" className="hover:text-white transition-colors">Leaderboard</a>
        </div>
        <div className="text-xs tracking-widest uppercase text-gray-400 hover:text-white cursor-pointer transition-colors">
          Join the Elite
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 mt-8">
        
        {/* Header Text */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-widest text-glow mb-2">
            WE'RE NEURAL POWERED!
          </h1>
          <p className="text-gray-400 uppercase tracking-[0.3em] text-sm font-semibold">
            The Academy lets you into the city of knowledge
          </p>
        </div>

        {/* The "Mech" Showcase Carousel */}
        <div className="flex items-center justify-center gap-4 w-full max-w-6xl">
          
          {/* Left Bracket */}
          <div className="hidden md:flex flex-col items-center justify-center w-64 h-80 bg-surface-dark border border-brand-500/30 clip-mech-left relative">
            <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 hover:border-white transition-all">
              ←
            </button>
          </div>

          {/* Center Cards Container */}
          <div className="flex gap-4">
            {/* Active Tier */}
            <div className="w-64 h-80 bg-surface-light border border-brand-400 clip-chamfer p-6 flex flex-col items-center justify-between glow-purple transform hover:-translate-y-2 transition-transform cursor-pointer">
              <h3 className="uppercase tracking-widest font-bold text-lg">Class 10 Core</h3>
              
              {/* Floating Item Placeholder (Replace with your own image later) */}
              <div className="w-32 h-32 bg-brand-900 border border-brand-500/50 clip-chamfer flex items-center justify-center relative group">
                 <div className="absolute inset-0 bg-brand-400/20 blur-md group-hover:bg-brand-400/40 transition-colors"></div>
                 <span className="font-bold tracking-widest text-brand-400 z-10">MATH_OBJ</span>
              </div>

              <button className="w-full py-2 border border-white/20 uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors font-bold">
                Enter Node
              </button>
            </div>

            {/* Locked Tier 1 */}
            <div className="w-64 h-80 bg-surface-dark border border-white/10 clip-chamfer p-6 flex flex-col items-center justify-between opacity-60">
              <h3 className="uppercase tracking-widest font-bold text-lg text-gray-400">Class 10 Pro</h3>
              <div className="text-4xl">🔒</div>
              <button className="w-full py-2 border border-white/10 uppercase tracking-widest text-xs text-gray-500 cursor-not-allowed font-bold">
                Locked
              </button>
            </div>

            {/* Locked Tier 2 */}
            <div className="hidden lg:flex w-64 h-80 bg-surface-dark border border-white/10 clip-chamfer p-6 flex flex-col items-center justify-between opacity-60">
              <h3 className="uppercase tracking-widest font-bold text-lg text-gray-400">Class 10 Elite</h3>
              <div className="text-4xl">🔒</div>
              <button className="w-full py-2 border border-white/10 uppercase tracking-widest text-xs text-gray-500 cursor-not-allowed font-bold">
                Locked
              </button>
            </div>
          </div>

          {/* Right Bracket */}
          <div className="hidden md:flex flex-col items-center justify-center w-64 h-80 bg-surface-dark border border-brand-500/30 clip-mech-right relative">
             <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 hover:border-white transition-all">
              →
            </button>
          </div>

        </div>
      </main>

      {/* Bottom Gamification Footer (XP Bar) */}
      <footer className="w-full px-8 py-8 z-10 mt-12 border-t border-white/5 bg-brand-900/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* XP Stats */}
          <div>
            <div className="text-brand-400 text-xs font-bold tracking-[0.2em] uppercase mb-1">Phase 1</div>
            <div className="text-3xl font-bold tracking-wider">XP: 7,520</div>
          </div>

          {/* Custom Segmented Progress Bar */}
          <div className="flex-1 max-w-2xl flex flex-col items-center gap-2">
            <div className="flex w-full justify-between text-[10px] text-gray-500 tracking-widest uppercase px-2">
              <span>Novice</span>
              <span>Scholar</span>
              <span>Master</span>
            </div>
            <div className="h-6 w-full flex gap-[2px]">
              {renderProgressBar()}
            </div>
          </div>

          {/* Level Stats */}
          <div className="text-right">
            <div className="text-gray-400 text-xs font-bold tracking-[0.2em] uppercase mb-1">Unlocked</div>
            <div className="text-3xl font-bold tracking-wider">LEVEL: 02</div>
          </div>

        </div>
      </footer>

    </div>
  );
}

export default App;