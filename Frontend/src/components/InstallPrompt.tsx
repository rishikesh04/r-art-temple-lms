import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Extending standard Event interface for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Update UI notify the user they can install the PWA
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 pb-6 md:pb-8 flex justify-center pointer-events-none"
        >
          <div className="w-full max-w-sm bg-white rounded-t-2xl md:rounded-2xl shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)] p-5 border border-slate-100 pointer-events-auto">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#ff5722] text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-sm shrink-0 border border-orange-600/20">
                R
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 truncate tracking-tight">R Art Temple LMS</h3>
                <p className="text-xs text-slate-500 font-medium">Install for a seamless experience</p>
              </div>
            </div>
            
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowPrompt(false)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors shadow-sm"
              >
                Dismiss
              </button>
              <button
                onClick={handleInstallClick}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white bg-[#ff5722] hover:brightness-105 shadow-sm transition-all"
              >
                Install App
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
