import { useEffect, useState } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import doneTick from '../../assets/done-tick.gif';
import waitingGif from '../../assets/waiting-for-result.gif';

const formatCountdown = (timeDiffMs: number) => {
  if (timeDiffMs <= 0) return '00:00:00';
  const totalSeconds = Math.floor(timeDiffMs / 1000);
  const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

export default function TestSubmittedPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const testEndTime = location.state?.testEndTime ? new Date(location.state.testEndTime).getTime() : null;
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!testEndTime) return;

    const updateTime = () => {
      const now = Date.now();
      const diff = testEndTime - now;
      if (diff <= 0) {
        // Test has ended, redirect to leaderboard
        navigate(`/tests/${id}/leaderboard`, { replace: true });
      } else {
        setTimeLeft(diff);
      }
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, [testEndTime, navigate, id]);

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col pt-[env(safe-area-inset-top,0px)]">
      {/* Top Mobile-like Header */}
      <div className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between z-10 sticky top-0 md:hidden">
        <div className="w-8" aria-hidden />
        <span className="text-lg font-semibold tracking-tight text-slate-900">{location.state?.testTitle ? location.state.testTitle : 'Test Info'}</span>
        <div className="w-8" aria-hidden />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 max-md:pb-32">
        <div className="w-full max-w-md bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 p-8 flex flex-col items-center text-center">

          <img src={doneTick} alt="Submitted" className="w-32 h-32 object-contain mb-2" />

          <h2 className="text-xl font-bold text-slate-800 mb-2 leading-snug">
            Test Submitted Successfully
          </h2>
          <p className="text-sm font-medium text-slate-500 mb-6">
            Result will be available when test ends
          </p>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 w-full flex flex-col items-center">
            <img src={waitingGif} alt="Waiting" className="w-24 h-24 object-contain mix-blend-multiply mb-3" />
            <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Time Remaining</div>
            <div className="text-2xl font-bold tabular-nums tracking-widest text-[#ff5722]">
              {timeLeft !== null ? formatCountdown(timeLeft) : '--:--:--'}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Floating Nav Action - mimicking wireframe dotted border */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-transparent px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] flex justify-center pointer-events-none">
        <div className="border border-dashed border-slate-400 rounded-3xl p-1 pointer-events-auto shadow-sm shadow-slate-200/20 bg-white/50 backdrop-blur-sm">
          <Link
            to="/dashboard"
            className="flex flex-col items-center justify-center gap-1 w-16 h-16 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-600 hover:text-[#ff5722] transition-colors"
          >
            <Home size={22} strokeWidth={2.5} className="text-[#ff5722]" aria-hidden />
            <span className="text-[10px] font-semibold text-slate-600">Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

