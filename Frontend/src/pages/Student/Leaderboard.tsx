import { useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { getApiMessage } from '../../utils/apiMessage';
import PodiumArt from '../../assets/Innovation-rafiki.svg';
import { useAuth } from '../../context/AuthContext';

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

const fmt = (secs: number) => {
  const s = Math.max(0, Math.floor(secs || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r}s`;
};

function attemptTestIdString(test: MyAttemptsResponse['attempts'][0]['test']) {
  if (!test || typeof test !== 'object') return null;
  const t = test as { _id?: string; id?: string };
  const raw = t._id ?? t.id;
  return raw != null ? String(raw) : null;
}

export default function StudentLeaderboardPage() {
  const { testId } = useParams<{ testId: string }>();
  const { user } = useAuth();
  const myRowRef = useRef<HTMLTableRowElement | null>(null);

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
      const res = await axiosInstance.get('/attempts/my-attempts');
      return res.data as MyAttemptsResponse;
    },
    enabled: Boolean(testId) && Boolean(user),
  });

  const myAttemptId = useMemo(() => {
    if (!testId || !myAttemptsData?.success) return null;
    const hit = myAttemptsData.attempts.find((a) => attemptTestIdString(a.test) === String(testId));
    return hit?.id ?? null;
  }, [myAttemptsData, testId]);

  const errorMessage = error ? getApiMessage(error, 'Failed to load leaderboard.') : null;
  const top3 = data?.leaderboard.slice(0, 3) || [];
  const myId = user?.id || '';

  useEffect(() => {
    if (!myRowRef.current) return;
    myRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [data?.leaderboard, myId]);

  const podiumOrder: Array<{ slot: 1 | 2 | 3; row?: LeaderboardRow }> = [
    { slot: 2, row: top3[1] },
    { slot: 1, row: top3[0] },
    { slot: 3, row: top3[2] },
  ];

  return (
    <div className="min-h-[calc(100vh-88px)] px-4 py-8 relative max-md:pb-28">
      <img src={PodiumArt} alt="" className="pointer-events-none hidden lg:block absolute right-0 bottom-0 w-[520px] opacity-15" />

      <div className="mx-auto w-full max-w-6xl relative z-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center px-4 py-3 border-2 border-brand-black bg-white font-black uppercase shadow-solid-sm text-sm w-full sm:w-auto text-center"
          >
            Back to Hub
          </Link>
          <Link
            to="/tests"
            className="inline-flex items-center justify-center px-4 py-3 border-2 border-brand-black bg-brand-orange font-black uppercase shadow-solid-sm text-sm w-full sm:w-auto text-center"
          >
            Tests
          </Link>
        </div>

        {isLoading ? (
          <div className="w-full h-40 flex items-center justify-center border-4 border-brand-black border-dashed opacity-60 font-bold uppercase animate-pulse">
            Loading Leaderboard...
          </div>
        ) : error || !data?.success ? (
          <div className="p-8 bg-red-100 border-4 border-brand-black shadow-solid font-bold text-red-700">
            {errorMessage || 'Failed to load leaderboard.'}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white border-4 border-brand-black shadow-solid overflow-hidden">
              <div className="bg-brand-black text-white p-5 border-b-4 border-brand-black">
                <h1 className="text-xl md:text-3xl font-black uppercase tracking-tight">Leaderboard</h1>
                <p className="mt-2 text-xs md:text-sm font-medium text-white/80">
                  {data.test.title} • Class {data.test.classLevel} • {data.totalParticipants} participants
                </p>
              </div>
              <div className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <Tile label="Subject" value={data.test.subject} />
                <Tile label="Participants" value={String(data.totalParticipants)} />
                <Tile label="Total Marks" value={String(data.test.totalMarks)} />
              </div>
            </div>

            <div className="bg-white border-4 border-brand-black shadow-solid overflow-hidden">
              <div className="bg-brand-black text-white p-4 border-b-4 border-brand-black">
                <div className="font-black uppercase text-lg">Top 3</div>
              </div>
              {top3.length === 0 ? (
                <div className="p-6 font-bold uppercase text-brand-black/40">No participants yet.</div>
              ) : (
                <>
                  {/* Mobile podium: 2 — 1 — 3 */}
                  <div className="md:hidden p-4 flex items-end justify-center gap-2 min-h-[200px]">
                    {podiumOrder.map(({ slot, row }) => {
                      const h = slot === 1 ? 'h-28' : slot === 2 ? 'h-20' : 'h-14';
                      const podiumColor = slot === 1 ? 'bg-yellow-300' : slot === 2 ? 'bg-gray-300' : 'bg-orange-300';
                      if (!row) {
                        return (
                          <div key={slot} className="flex-1 flex flex-col items-center justify-end opacity-40">
                            <div className="h-10 w-10 rounded-full border-2 border-brand-black bg-white mb-2" />
                            <div className="text-[10px] font-black uppercase">#{slot}</div>
                            <div className={`w-full mt-1 border-2 border-brand-black ${h} ${podiumColor}`} />
                          </div>
                        );
                      }
                      const isMe = myId && row.studentId === myId;
                      return (
                        <div key={row.studentId || slot} className="flex-1 flex flex-col items-center justify-end max-w-[33%]">
                          <div className="text-[10px] font-black uppercase mb-1">#{row.rank}</div>
                          <div className="h-10 w-10 rounded-full border-2 border-brand-black bg-white flex items-center justify-center font-black text-sm shrink-0">
                            {row.studentName.charAt(0)}
                          </div>
                          <div className="text-[10px] font-black uppercase text-center truncate w-full mt-1 px-0.5">
                            {row.studentName}
                            {isMe ? <span className="block text-brand-orange">You</span> : null}
                          </div>
                          <div className={`w-full mt-1 border-2 border-brand-black flex flex-col items-center justify-end ${h} ${podiumColor} pt-1`}>
                            <div className="text-[10px] font-black">{row.score}/{row.totalQuestions}</div>
                            <div className="text-[9px] font-bold">{row.percentage}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop top 3 cards */}
                  <div className="hidden md:grid p-4 grid-cols-3 gap-4">
                    {[1, 0, 2].map((idxOrder) => {
                      const row = top3[idxOrder];
                      if (!row) return <div key={idxOrder} />;
                      const podiumColor = row.rank === 1 ? 'bg-yellow-300' : row.rank === 2 ? 'bg-gray-300' : 'bg-orange-300';
                      const isMe = myId && row.studentId === myId;
                      return (
                        <div key={row.studentId || row.rank} className={`border-4 border-brand-black p-4 shadow-solid-sm ${podiumColor}`}>
                          <div className="text-xs font-black uppercase flex items-center justify-between">
                            <span>Rank #{row.rank}</span>
                            {isMe ? <span className="px-2 py-0.5 border-2 border-brand-black bg-white text-[10px]">You</span> : null}
                          </div>
                          <div className="mt-2 text-xl font-black uppercase truncate">{row.studentName}</div>
                          <div className="mt-3 text-sm font-bold">
                            {row.score} / {row.totalQuestions}
                          </div>
                          <div className="text-sm font-bold">{row.percentage}%</div>
                          <div className="text-xs font-bold mt-1">Time: {fmt(row.timeTaken)}</div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="bg-white border-4 border-brand-black shadow-solid overflow-hidden">
              <div className="bg-brand-black text-white p-4 border-b-4 border-brand-black">
                <div className="font-black uppercase text-lg">Leaderboard</div>
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead className="bg-brand-gray/20 text-xs uppercase font-black">
                    <tr>
                      <th className="text-left p-3 border-b-2 border-brand-black">Rank</th>
                      <th className="text-left p-3 border-b-2 border-brand-black">Student</th>
                      <th className="text-left p-3 border-b-2 border-brand-black">Score</th>
                      <th className="text-left p-3 border-b-2 border-brand-black">%</th>
                      <th className="text-left p-3 border-b-2 border-brand-black">Time</th>
                      <th className="text-left p-3 border-b-2 border-brand-black">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.leaderboard.map((r) => (
                      <tr
                        ref={myId && r.studentId === myId ? myRowRef : null}
                        key={`${r.rank}-${r.studentId}`}
                        className={`border-b border-brand-black/10 ${myId && r.studentId === myId ? 'bg-brand-orange/20' : ''}`}
                      >
                        <td className="p-3 font-black">#{r.rank}</td>
                        <td className="p-3 font-bold">
                          {r.studentName}
                          {myId && r.studentId === myId ? (
                            <span className="ml-2 px-2 py-0.5 border border-brand-black text-[10px] font-black uppercase bg-white">You</span>
                          ) : null}
                        </td>
                        <td className="p-3 font-bold">
                          {r.score} / {r.totalQuestions}
                        </td>
                        <td className="p-3 font-bold">{r.percentage}%</td>
                        <td className="p-3 font-bold">{fmt(r.timeTaken)}</td>
                        <td className="p-3 text-sm font-medium">{new Date(r.submittedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden divide-y-2 divide-brand-black max-h-[50vh] overflow-y-auto">
                {data.leaderboard.map((r) => (
                  <div
                    key={`${r.rank}-${r.studentId}`}
                    className={`p-4 flex items-center justify-between gap-3 ${myId && r.studentId === myId ? 'bg-brand-orange/15' : ''}`}
                  >
                    <div className="min-w-0">
                      <div className="font-black text-sm">#{r.rank}</div>
                      <div className="font-bold text-sm truncate">
                        {r.studentName}
                        {myId && r.studentId === myId ? (
                          <span className="ml-2 text-[10px] font-black uppercase border border-brand-black px-1">You</span>
                        ) : null}
                      </div>
                      <div className="text-xs font-bold text-brand-black/65 mt-1">{fmt(r.timeTaken)}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-black text-brand-orange">
                        {r.score}/{r.totalQuestions}
                      </div>
                      <div className="text-xs font-bold">{r.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {!isLoading && data?.success ? (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t-4 border-brand-black p-3 shadow-[0_-6px_0_0_rgb(0,0,0)]">
          {myAttemptId ? (
            <Link
              to={`/attempts/${myAttemptId}`}
              className="block w-full text-center py-4 bg-brand-orange border-2 border-brand-black font-black uppercase shadow-solid-sm rounded-lg"
            >
              My result
            </Link>
          ) : (
            <div className="text-center py-3 text-xs font-bold text-brand-black/60 uppercase">
              Submit this test to see your result here
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-brand-black p-4 shadow-solid-sm bg-white">
      <div className="text-xs font-bold uppercase tracking-widest text-brand-black/70">{label}</div>
      <div className="mt-2 text-2xl font-black">{value}</div>
    </div>
  );
}
