import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import MathematicsBro from '../../assets/Mathematics-bro.svg';
import MathTileImg from '../../assets/Mathematics-cuate.svg';
import ScienceTileImg from '../../assets/beaker chemistry-bro.svg';
import { Link } from 'react-router-dom';

type DashboardResponse = {
  success: boolean;
  data: {
    stats: {
      completedTestsCount: number;
      averageScore: number | null;
      availableTestsCount: number;
      upcomingTestsCount: number;
    };
    availableTests: Array<{
      _id: string;
      title: string;
      subject: string;
      chapter: string;
      duration: number;
      totalMarks: number;
      startTime: string;
      endTime: string;
    }>;
    upcomingTests: Array<{
      _id: string;
      title: string;
      subject: string;
      chapter: string;
      duration: number;
      totalMarks: number;
      startTime: string;
      endTime: string;
    }>;
    recentAttempts: Array<{
      attemptId: string;
      testTitle: string;
      score: number | null;
      totalQuestions: number | null;
      submittedAt: string;
    }>;
  };
};

const formatDateTime = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

function AnalyticOverviewVisual() {
  const bars = [
    { h: 'h-[45%]', bg: 'bg-[#ffb38a]' },
    { h: 'h-[78%]', bg: 'bg-brand-orange' },
    { h: 'h-[58%]', bg: 'bg-[#ff9a5c]' },
    { h: 'h-[92%]', bg: 'bg-[#e86a1a]' },
  ];
  return (
    <div className="relative flex flex-1 min-h-[132px] items-end justify-center gap-2 sm:gap-3 px-2 pb-7">
      {bars.map((b, i) => (
        <div
          key={i}
          className={`w-[18%] max-w-[2.25rem] rounded-full border border-slate-200/60 ${b.bg} ${b.h} shadow-sm`}
        />
      ))}
      <span className="pointer-events-none absolute bottom-1 right-2 text-[11px] font-medium tracking-wide text-brand-orange">
        Analytic overview
      </span>
    </div>
  );
}



export default function StudentDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: async () => {
      const res = await axiosInstance.get('/student/dashboard');
      return res.data as DashboardResponse;
    },
  });

  const { liveTest } = useMemo(() => {
    if (!data?.success) return { liveTest: null };
    const first = data.data.availableTests[0];
    if (first) return { liveTest: first };
    return { liveTest: null };
  }, [data]);

  return (
    <div className="min-h-[calc(100vh-88px)] px-4 py-6 md:py-8 relative">
      <img
        src={MathematicsBro}
        alt=""
        className="pointer-events-none hidden lg:block absolute right-0 bottom-0 w-[560px] max-w-none opacity-20"
      />

      <div className="mx-auto w-full max-w-7xl relative z-10">
        <div className="mb-8 hidden md:block">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Student hub</h1>
          <p className="text-slate-600 font-medium mt-2 text-sm md:text-base">
            Your tests, attempts, and progress in one place.
          </p>
        </div>

        {isLoading ? (
          <div className="w-full h-40 flex items-center justify-center border border-dashed border-slate-300 rounded-2xl text-slate-500 text-sm font-medium animate-pulse">
            Loading…
          </div>
        ) : error || !data?.success ? (
          <div className="p-8 bg-red-50 border border-red-200/80 rounded-2xl font-medium text-red-700 text-sm">
            Failed to load dashboard.
          </div>
        ) : (
          <>
            {/* Mobile home (wireframe) */}
            <div className="md:hidden flex flex-col gap-5 pb-8 max-w-lg mx-auto w-full">
              {/* Stats + analytic overview (tap → performance) */}
              <Link
                to="/dashboard/performance"
                className="group flex gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex w-[38%] shrink-0 flex-col gap-2">
                  <div className="flex flex-1 flex-col justify-center rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-3 shadow-sm">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Completed</div>
                    <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
                      {data.data.stats.completedTestsCount}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-center rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-3 shadow-sm">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Avg score</div>
                    <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
                      {data.data.stats.averageScore === null ? '—' : data.data.stats.averageScore}
                    </div>
                  </div>
                </div>
                <AnalyticOverviewVisual />
              </Link>

              {/* Live row — only when a test is in the live window */}
              {liveTest ? (
                <div className="flex gap-3 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm">
                  <Link
                    to={`/tests/${liveTest._id}/start`}
                    className="flex shrink-0 items-center gap-2 self-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
                  >
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/25" />
                    </span>
                    Live
                  </Link>
                  <Link
                    to={`/tests/${liveTest._id}/start`}
                    className="min-w-0 flex-1 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50/80 px-3 py-2.5 border border-orange-100/80 text-left transition hover:border-orange-200/90 hover:shadow-sm active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Test info</div>
                    </div>
                    <div className="mt-0.5 truncate text-sm font-semibold text-slate-900">{liveTest.title}</div>
                    <div className="mt-1 text-xs font-medium text-slate-600">
                      {liveTest.subject}
                      {liveTest.chapter ? ` · ${liveTest.chapter}` : ''} · ends {formatDateTime(liveTest.endTime)}
                    </div>
                  </Link>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/dashboard/upcoming-tests"
                  className="flex items-center justify-center rounded-2xl border border-slate-200/90 bg-white py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-800 shadow-sm transition hover:border-slate-300 hover:shadow-md active:scale-[0.99]"
                >
                  Upcoming test
                </Link>
                <Link
                  to="/dashboard/past-tests"
                  className="flex items-center justify-center rounded-2xl border border-slate-200/90 bg-white py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-800 shadow-sm transition hover:border-slate-300 hover:shadow-md active:scale-[0.99]"
                >
                  Past test
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-100 text-left shadow-sm transition hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/40"
                  aria-label="Math"
                >
                  <span
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${MathTileImg})` }}
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/25 to-transparent" />
                  <span className="absolute bottom-3 left-3 text-lg font-semibold uppercase tracking-tight text-white drop-shadow-sm">
                    Math
                  </span>
                </button>
                <button
                  type="button"
                  className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-100 text-left shadow-sm transition hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/40"
                  aria-label="Science"
                >
                  <span
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${ScienceTileImg})` }}
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/25 to-transparent" />
                  <span className="absolute bottom-3 left-3 text-lg font-semibold uppercase tracking-tight text-white drop-shadow-sm">
                    Science
                  </span>
                </button>
              </div>

              <Link
                to="/dashboard/my-attempts"
                className="mt-1 flex w-full items-center justify-center rounded-2xl bg-brand-orange py-4 text-sm font-semibold uppercase tracking-wide text-white shadow-sm ring-1 ring-orange-600/20 transition hover:brightness-105 active:scale-[0.99]"
              >
                My attempts
              </Link>
            </div>

            {/* Desktop */}
            <div className="hidden md:block">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
                <StatCard label="Completed" value={data.data.stats.completedTestsCount} />
                <StatCard
                  label="Average Score"
                  value={data.data.stats.averageScore === null ? 'Locked' : data.data.stats.averageScore}
                />
                <StatCard label="Available" value={data.data.stats.availableTestsCount} />
                <StatCard label="Upcoming" value={data.data.stats.upcomingTestsCount} />
              </div>

              <div className="mb-6 flex items-center justify-end">
                <Link
                  to="/tests"
                  className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 bg-brand-orange text-sm font-semibold text-white shadow-sm ring-1 ring-orange-600/15 transition hover:brightness-105"
                >
                  View all tests
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard title="Available Tests">
                  {data.data.availableTests.length === 0 ? (
                    <EmptyText>No active tests right now.</EmptyText>
                  ) : (
                    <div className="space-y-3">
                      {data.data.availableTests.map((t) => (
                        <Link
                          key={t._id}
                          to={`/tests/${t._id}`}
                          className="block rounded-xl border border-slate-200 p-4 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 truncate">{t.title}</div>
                              <div className="text-sm font-medium text-slate-600 mt-1">
                                {t.subject} • {t.chapter}
                              </div>
                              <div className="text-xs font-medium text-slate-500 mt-2">
                                Ends <span className="text-slate-700">{formatDateTime(t.endTime)}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-slate-900">{t.duration} min</div>
                              <div className="text-xs font-medium text-slate-500">{t.totalMarks} marks</div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </SectionCard>

                <SectionCard title="Recent Attempts">
                  {data.data.recentAttempts.length === 0 ? (
                    <EmptyText>No attempts yet.</EmptyText>
                  ) : (
                    <div className="space-y-3">
                      {data.data.recentAttempts.slice(0, 5).map((a) => (
                        <Link
                          key={a.attemptId}
                          to={`/attempts/${a.attemptId}`}
                          className="block rounded-xl border border-slate-200 p-4 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 truncate">{a.testTitle}</div>
                              <div className="text-sm font-medium text-slate-600 mt-1">{formatDateTime(a.submittedAt)}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-semibold text-brand-orange">{a.score === null ? 'Locked' : a.score}</div>
                              <div className="text-xs font-medium text-slate-500">
                                {a.totalQuestions === null ? '—' : `${a.totalQuestions} Q`}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </SectionCard>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">{value}</div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return <div className="p-6 text-center text-sm font-medium text-slate-400">{children}</div>;
}
