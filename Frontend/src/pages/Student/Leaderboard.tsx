import { useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

type LeaderboardRow = {
  rank: number;
  studentId: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTaken: number;
  submittedAt: string;
};

type LeaderboardResponse = {
  success: boolean;
  test: {
    id: string;
    title: string;
    subject: string;
    classLevel: string;
    totalMarks: number;
  };
  totalParticipants: number;
  leaderboard: LeaderboardRow[];
};

type MyAttemptsResponse = {
  success: boolean;
  attempts: Array<{
    id: string;
    test?: { _id?: string; id?: string; title?: string } | null;
  }>;
};

function attemptTestIdString(test: MyAttemptsResponse['attempts'][0]['test']) {
  if (!test || typeof test !== 'object') return null;
  const t = test as { _id?: string; id?: string };
  const raw = t._id ?? t.id;
  return raw != null ? String(raw) : null;
}

const formatTime = (secs: number) => {
  const s = Math.max(0, Math.floor(secs || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r}s`;
};

export default function StudentLeaderboardPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const myRowRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['leaderboard', testId],
    enabled: Boolean(testId),
    queryFn: async () => {
      const res = await axiosInstance.get(`/leaderboard/test/${testId}`);
      return res.data as LeaderboardResponse;
    },
  });

  const { data: myAttemptsData } = useQuery({
    queryKey: ['myAttempts'],
    queryFn: async () => {
      const res = await axiosInstance.get('/attempts/my-attempts', { params: { nopagination: 'true' } });
      return res.data as MyAttemptsResponse;
    },
  });

  const myAttemptId = useMemo(() => {
    if (!testId || !myAttemptsData?.success) return null;
    const hit = myAttemptsData.attempts.find((a) => attemptTestIdString(a.test) === String(testId));
    return hit?.id ?? null;
  }, [myAttemptsData, testId]);

  const top3 = data?.leaderboard.slice(0, 3) || [];
  const others = data?.leaderboard.slice(3) || [];

  // Sort them as 3rd, 1st, 2nd for podium
  const podiumOrder = [
    { slot: 3, row: top3[2] },
    { slot: 1, row: top3[0] },
    { slot: 2, row: top3[1] },
  ];

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 font-medium animate-pulse">Loading Leaderboard...</div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl border border-red-100">
          Failed to load leaderboard.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col pt-[env(safe-area-inset-top,0px)]">
      {/* Header */}
      <div className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button 
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-95"
          aria-label="Go back"
        >
          <ChevronLeft size={24} strokeWidth={2.2} />
        </button>
        <span className="text-sm font-semibold tracking-tight text-slate-900">{data?.test?.title || 'Test Info'}</span>
        <div className="w-10" aria-hidden />
      </div>

      <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full max-md:pb-32">
        {top3.length > 0 && (
          <div className="mb-10 mt-4">
            <div className="flex items-end justify-center gap-2 h-44">
              {podiumOrder.map(({ slot, row }) => {
                if (!row) {
                  return (
                    <div key={slot} className="flex-1 flex flex-col items-center justify-end opacity-40">
                      <div className="h-12 w-12 rounded-full border-2 border-slate-200 bg-white text-slate-400 mb-2 flex items-center justify-center font-bold text-xs" />
                      <div className="w-full h-16 rounded-t-2xl border border-slate-200 bg-white" />
                    </div>
                  );
                }

                const isFirst = slot === 1;
                const bgColor = isFirst 
                  ? 'bg-[#FF5A22] text-white border-none shadow-lg shadow-orange-500/30' 
                  : slot === 2 
                    ? 'bg-slate-100 text-slate-700 border border-slate-200/80 shadow-sm'
                    : 'bg-stone-100 text-stone-700 border border-stone-200/80 shadow-sm';
                
                const heightClass = isFirst ? 'h-28' : slot === 2 ? 'h-20' : 'h-16';

                return (
                  <div key={row.studentId} className="flex-1 flex flex-col items-center max-w-[30%]">
                    <div className="mb-1 text-center">
                      <div className="h-12 w-12 mx-auto rounded-full bg-[#FF5A22] border-2 border-white shadow-sm flex items-center justify-center font-bold text-sm text-white mb-1">
                        {row.studentName.charAt(0)}
                      </div>
                      <div className="text-[10px] font-medium text-slate-600 truncate px-1 w-full max-w-[60px]">
                        {row.studentName.split(' ')[0]}
                      </div>
                    </div>
                    
                    <div className={`w-full rounded-t-3xl flex flex-col items-center pt-3 ${bgColor} ${heightClass} relative overflow-hidden`}>
                      <span className={`text-xl font-bold ${isFirst ? 'text-white' : 'text-slate-800'}`}>
                        {slot}{slot === 1 ? 'st' : slot === 2 ? 'nd' : 'rd'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Base line for podium */}
            <div className="h-px bg-slate-300 w-full mx-auto" />
          </div>
        )}

        <div className="text-center mb-4">
          <h2 className="text-lg font-bold text-slate-800">Leaderboard</h2>
        </div>

        <div className="space-y-3 bg-white border border-slate-200 rounded-3xl p-3 shadow-xl shadow-slate-200/40">
          {others.length === 0 && top3.length <= 3 && top3.length > 0 && (
            <div className="text-center py-4 text-xs font-medium text-slate-400">
              No more participants.
            </div>
          )}
          {others.map((r) => (
            <div 
              key={r.studentId}
              className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-400 w-6 text-center">
                  #{r.rank}
                </span>
                <div className="h-9 w-9 rounded-full bg-[#FF5A22]/10 border border-[#FF5A22]/20 flex items-center justify-center font-bold text-xs text-[#FF5A22]">
                  {r.studentName.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">{r.studentName}</div>
                  <div className="text-[10px] font-medium text-slate-500">{formatTime(r.timeTaken)}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-900">{r.score}/{r.totalQuestions}</div>
                <div className="text-[10px] font-medium text-slate-400">{r.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Floating Nav Action */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-slate-200/90 pb-[env(safe-area-inset-bottom)] px-4">
        <div className="py-3 flex items-center gap-4 max-w-md mx-auto">
          <Link
            to="/dashboard"
            className="flex flex-col items-center justify-center w-12 h-12 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-600 hover:text-[#ff5722] transition-colors shrink-0"
            aria-label="Home"
          >
            <Home size={20} strokeWidth={2.5} className="text-[#ff5722]" />
          </Link>
          
          <div className="flex-1 border border-dashed border-slate-300 rounded-2xl p-1 pointer-events-auto">
            {myAttemptId ? (
              <Link
                to={`/attempts/${myAttemptId}`}
                className="flex items-center justify-center w-full py-3.5 bg-[#FF5A22] text-white font-semibold rounded-xl shadow-md shadow-orange-500/30 hover:brightness-105 transition-all text-sm"
              >
                My Result
              </Link>
            ) : (
              <div className="flex items-center justify-center w-full py-3.5 bg-slate-100 text-slate-400 font-semibold rounded-xl text-sm">
                No Result Available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

