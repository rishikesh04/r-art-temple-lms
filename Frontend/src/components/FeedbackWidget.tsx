import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bug, Lightbulb, HelpCircle, Loader2 } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { getApiMessage } from '../utils/apiMessage';
import { useAuth } from '../context/AuthContext';

type FeedbackType = 'Bug' | 'Feature' | 'Question';

export default function FeedbackWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>('Bug');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Only show to logged in users
  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus('loading');
    try {
      await axiosInstance.post('/feedback', { type, message });
      setStatus('success');
      setTimeout(() => {
        setIsOpen(false);
        // Reset state after closing animation
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
          setType('Bug');
        }, 300);
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(getApiMessage(err, 'Failed to send feedback.'));
    }
  };

  const types: { value: FeedbackType; icon: React.ReactNode; label: string }[] = [
    { value: 'Bug', icon: <Bug size={14} />, label: 'Report Bug' },
    { value: 'Feature', icon: <Lightbulb size={14} />, label: 'Suggest Feature' },
    { value: 'Question', icon: <HelpCircle size={14} />, label: 'Question' },
  ];

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-xl ring-4 ring-white/50 transition-colors hover:bg-slate-800"
              aria-label="Give Feedback"
            >
              <MessageSquare size={24} />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 right-0 w-[min(calc(100vw-3rem),380px)] overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-xl ring-1 ring-slate-900/5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
                <div>
                  <h3 className="font-semibold tracking-tight text-slate-900">Feedback & Support</h3>
                  <p className="mt-0.5 text-xs text-slate-500">Help us improve the platform.</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-slate-400 transition hover:bg-slate-200/50 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <Send size={24} className="ml-1" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900">Message Sent!</h4>
                  <p className="mt-2 text-sm text-slate-500">Thank you for your valuable feedback.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col p-5">
                  <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {types.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setType(t.value)}
                        className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${
                          type === t.value
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {t.icon}
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      type === 'Bug'
                        ? "What isn't working as expected?"
                        : type === 'Feature'
                        ? "What would you like to see added?"
                        : "How can we help you?"
                    }
                    className="min-h-[120px] w-full resize-none rounded-xl border-none bg-slate-50 p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
                    required
                  />

                  {status === 'error' && (
                    <p className="mt-3 text-[11px] font-medium text-red-600">{errorMsg}</p>
                  )}

                  <div className="mt-5 flex items-center justify-between">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      Built by a Solo Student Dev
                    </div>
                    
                    <button
                      type="submit"
                      disabled={status === 'loading' || !message.trim()}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#ff5722] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#ff5722]/30 transition-all hover:bg-[#e64a19] disabled:opacity-60"
                    >
                      {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      {status === 'loading' ? 'Sending' : 'Submit'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
