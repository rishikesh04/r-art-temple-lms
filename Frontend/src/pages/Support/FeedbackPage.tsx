import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bug, Lightbulb, HelpCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { getApiMessage } from '../../utils/apiMessage';
import doneTick from '../../assets/done-tick.gif';

type FeedbackType = 'Bug' | 'Feature' | 'Question';

export default function FeedbackPage() {
  const navigate = useNavigate();
  const [type, setType] = useState<FeedbackType>('Bug');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus('loading');
    try {
      await axiosInstance.post('/feedback', { type, message });
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(getApiMessage(err, 'Failed to send feedback.'));
    }
  };

  const types: { value: FeedbackType; icon: React.ReactNode; label: string; color: string }[] = [
    { value: 'Bug', icon: <Bug size={20} />, label: 'Report a Bug', color: 'bg-red-50 text-red-600 border-red-100' },
    { value: 'Feature', icon: <Lightbulb size={20} />, label: 'Suggest Feature', color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { value: 'Question', icon: <HelpCircle size={20} />, label: 'General Help', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  ];

  if (status === 'success') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-[2.5rem] p-12 shadow-2xl border border-slate-100 max-w-md w-full"
        >
          <div className="w-40 h-40 mx-auto mb-8 flex items-center justify-center">
            <img src={doneTick} alt="Success" className="max-w-full max-h-full object-contain" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Message Sent!</h2>
          <p className="text-slate-500 mb-10 text-lg leading-relaxed">Thank you for helping us make R Art Temple better. We've received your feedback!</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-[#ff5722] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/30 hover:brightness-105 active:scale-[0.98] transition-all"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="group mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">Go Back</span>
        </button>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 md:p-10">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Feedback</h1>
            <p className="mt-2 text-slate-500 text-lg">Have a suggestion or encountered an issue? Let us know!</p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-8">
              <div>
                <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">What's on your mind?</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {types.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all ${type === t.value
                          ? 'border-[#ff5722] bg-orange-50/50 text-[#ff5722]'
                          : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      {t.icon}
                      <span className="font-semibold text-sm">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Details</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    type === 'Bug'
                      ? "Describe the issue... (e.g., 'The timer stopped working on my last test')"
                      : type === 'Feature'
                        ? "What feature would make your experience better?"
                        : "How can we assist you today?"
                  }
                  className="w-full min-h-[200px] p-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-[#ff5722] focus:bg-white focus:outline-none transition-all text-slate-900 text-lg"
                  required
                />
              </div>

              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100"
                >
                  {errorMsg}
                </motion.div>
              )}

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-full">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Built and maintained by a Solo Student Developer
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading' || !message.trim()}
                  className="w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-3 bg-[#ff5722] text-white py-4 px-8 rounded-2xl font-bold shadow-lg shadow-orange-500/30 hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {status === 'loading' ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                  {status === 'loading' ? 'Sending...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
