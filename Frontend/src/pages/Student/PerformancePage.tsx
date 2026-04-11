import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Target,
  Trophy,
  BarChart3,
  Zap,
  Clock,
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

/* ──────────────────── types ──────────────────── */
type Attempt = {
  id: string;
  test?: {
    _id?: string;
    title?: string;
    subject?: string;
    classLevel?: string;
    totalMarks?: number;
  } | null;
  submittedAt: string;
  resultAvailable: boolean;
  score: number | null;
  totalQuestions: number | null;
};

type AttemptsResponse = {
  success: boolean;
  count: number;
  attempts: Attempt[];
};

/* ──────────────────── helpers ──────────────────── */
const shortDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const pct = (score: number, total: number) =>
  total > 0 ? Math.round((score / total) * 100) : 0;

/* ──────────────────── component ──────────────────── */
export default function PerformancePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['myAttempts'],
    queryFn: async () => {
      const res = await axiosInstance.get('/attempts/my-attempts');
      return res.data as AttemptsResponse;
    },
  });

  /* derived analytics */
  const analytics = useMemo(() => {
    if (!data?.success) return null;

    // Only use attempts with results available
    const revealed = data.attempts.filter(
      (a) => a.resultAvailable && a.score !== null && a.totalQuestions !== null,
    );

    if (revealed.length === 0)
      return {
        chartData: [],
        totalTests: 0,
        avgPct: 0,
        bestPct: 0,
        worstPct: 0,
        latestPct: 0,
        trend: 0,
        streakScore: 0,
        subjectBreakdown: [] as { name: string; avg: number; count: number }[],
      };

    // Sort chronologically
    const sorted = [...revealed].sort(
      (a, b) =>
        new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
    );

    // Chart
    const chartData = sorted.map((a, i) => ({
      name: shortDate(a.submittedAt),
      testLabel: a.test?.title || `Test ${i + 1}`,
      score: pct(a.score!, a.totalQuestions!),
    }));

    const pcts = sorted.map((a) => pct(a.score!, a.totalQuestions!));
    const avgPct = Math.round(pcts.reduce((s, v) => s + v, 0) / pcts.length);
    const bestPct = Math.max(...pcts);
    const worstPct = Math.min(...pcts);
    const latestPct = pcts[pcts.length - 1];

    // Trend: compare last 3 avg vs first 3 avg
    const recentSlice = pcts.slice(-3);
    const earlySlice = pcts.slice(0, 3);
    const recentAvg =
      recentSlice.reduce((s, v) => s + v, 0) / recentSlice.length;
    const earlyAvg =
      earlySlice.reduce((s, v) => s + v, 0) / earlySlice.length;
    const trend = Math.round(recentAvg - earlyAvg);

    // Streak: consecutive tests >= 70%
    let streakScore = 0;
    for (let i = pcts.length - 1; i >= 0; i--) {
      if (pcts[i] >= 70) streakScore++;
      else break;
    }

    // Subject breakdown
    const subMap = new Map<string, { sum: number; count: number }>();
    sorted.forEach((a) => {
      const subj = a.test?.subject || 'Other';
      const cur = subMap.get(subj) || { sum: 0, count: 0 };
      cur.sum += pct(a.score!, a.totalQuestions!);
      cur.count += 1;
      subMap.set(subj, cur);
    });
    const subjectBreakdown = Array.from(subMap.entries())
      .map(([name, { sum, count }]) => ({
        name,
        avg: Math.round(sum / count),
        count,
      }))
      .sort((a, b) => b.avg - a.avg);

    return {
      chartData,
      totalTests: sorted.length,
      avgPct,
      bestPct,
      worstPct,
      latestPct,
      trend,
      streakScore,
      subjectBreakdown,
    };
  }, [data]);

  /* ──── loading / error states ──── */
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-88px)] flex items-center justify-center bg-slate-50 p-4">
        <div className="h-10 w-10 rounded-full border-4 border-[#ff5722] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="min-h-[calc(100vh-88px)] flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl border border-red-100 text-sm font-medium">
          Failed to load performance data.
        </div>
      </div>
    );
  }

  if (!analytics || analytics.totalTests === 0) {
    return (
      <div className="min-h-[calc(100vh-88px)] bg-slate-50 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-[#ff5722] mb-6 transition-colors"
          >
            <ChevronLeft size={18} /> Back
          </Link>
          <div className="rounded-[1.75rem] bg-white outline outline-1 outline-slate-200 shadow-sm p-8 text-center">
            <BarChart3
              size={48}
              className="mx-auto text-[#ff5722]/30 mb-4"
              strokeWidth={1.5}
            />
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              No Analytics Yet
            </h2>
            <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">
              Complete some tests to see your performance chart and analytics
              dashboard here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const {
    chartData,
    totalTests,
    avgPct,
    bestPct,
    worstPct,
    latestPct,
    trend,
    streakScore,
    subjectBreakdown,
  } = analytics;

  const trendPositive = trend >= 0;

  /* ──── custom tooltip ──── */
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg outline outline-1 outline-slate-200 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            {d.testLabel}
          </p>
          <p className="text-lg font-black text-[#ff5722]">{d.score}%</p>
          <p className="text-[11px] font-medium text-slate-500">{d.name}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-[calc(100vh-88px)] bg-slate-50 px-4 py-6 md:py-8">
      <div className="max-w-3xl mx-auto">
        {/* Back + Title */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/dashboard"
            className="p-2 -ml-2 bg-white hover:bg-slate-100 rounded-full transition border border-slate-200 shadow-sm"
          >
            <ChevronLeft size={20} strokeWidth={2.5} className="text-slate-700" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              Analytic
            </h1>
            <p className="text-[12px] font-medium text-slate-500 mt-0.5">
              Your performance across {totalTests} test
              {totalTests !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* ─── Line Chart ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-[1.75rem] outline outline-1 outline-[#ff5722]/10 shadow-[0_4px_20px_-4px_rgba(255,87,34,0.08)] p-5 sm:p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="px-3 py-1 outline outline-1 outline-[#ff5722]/20 bg-[#ff5722]/10 rounded-xl text-[10px] font-black text-[#ff5722] uppercase tracking-widest">
                Score Trend
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {trendPositive ? (
                <TrendingUp size={16} className="text-emerald-500" />
              ) : (
                <TrendingDown size={16} className="text-rose-500" />
              )}
              <span
                className={`text-[13px] font-bold ${trendPositive ? 'text-emerald-600' : 'text-rose-500'}`}
              >
                {trendPositive ? '+' : ''}
                {trend}%
              </span>
            </div>
          </div>

          <div className="h-52 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="scoreGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#ff5722"
                      stopOpacity={0.15}
                    />
                    <stop
                      offset="95%"
                      stopColor="#ff5722"
                      stopOpacity={0.01}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#ff5722"
                  strokeWidth={2.5}
                  fill="url(#scoreGradient)"
                  dot={{
                    r: 5,
                    fill: '#fff',
                    stroke: '#ff5722',
                    strokeWidth: 2.5,
                  }}
                  activeDot={{
                    r: 7,
                    fill: '#ff5722',
                    stroke: '#fff',
                    strokeWidth: 3,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ─── Performance Analysis Section ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <h2 className="text-[13px] font-black text-slate-800 uppercase tracking-widest mb-4 px-1">
            Performance Analysis
          </h2>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Average Score */}
            <div className="bg-white rounded-[1.5rem] p-5 shadow-[0_4px_20px_-4px_rgba(255,87,34,0.08)] outline outline-1 outline-[#ff5722]/10 hover:shadow-[0_8px_30px_-4px_rgba(255,87,34,0.12)] transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#ff5722]/10 to-[#ff5722]/5 outline outline-1 outline-[#ff5722]/20 flex items-center justify-center">
                  <Target size={18} className="text-[#ff5722]" strokeWidth={2.5} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#ff5722]/70">
                  Avg Score
                </p>
              </div>
              <p className="text-[28px] font-black text-slate-800 tracking-tight leading-none">
                {avgPct}
                <span className="text-[15px] text-slate-400 font-bold">%</span>
              </p>
            </div>

            {/* Best Score */}
            <div className="bg-white rounded-[1.5rem] p-5 shadow-[0_4px_20px_-4px_rgba(255,87,34,0.08)] outline outline-1 outline-[#ff5722]/10 hover:shadow-[0_8px_30px_-4px_rgba(255,87,34,0.12)] transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#ff5722]/10 to-[#ff5722]/5 outline outline-1 outline-[#ff5722]/20 flex items-center justify-center">
                  <Trophy size={18} className="text-[#ff5722]" strokeWidth={2.5} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#ff5722]/70">
                  Best
                </p>
              </div>
              <p className="text-[28px] font-black text-slate-800 tracking-tight leading-none">
                {bestPct}
                <span className="text-[15px] text-slate-400 font-bold">%</span>
              </p>
            </div>

            {/* Latest Performance */}
            <div className="bg-white rounded-[1.5rem] p-5 shadow-[0_4px_20px_-4px_rgba(255,87,34,0.08)] outline outline-1 outline-[#ff5722]/10 hover:shadow-[0_8px_30px_-4px_rgba(255,87,34,0.12)] transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#ff5722]/10 to-[#ff5722]/5 outline outline-1 outline-[#ff5722]/20 flex items-center justify-center">
                  <Zap size={18} className="text-[#ff5722]" strokeWidth={2.5} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#ff5722]/70">
                  Latest
                </p>
              </div>
              <p className="text-[28px] font-black text-slate-800 tracking-tight leading-none">
                {latestPct}
                <span className="text-[15px] text-slate-400 font-bold">%</span>
              </p>
            </div>

            {/* Hot Streak */}
            <div className="bg-white rounded-[1.5rem] p-5 shadow-[0_4px_20px_-4px_rgba(255,87,34,0.08)] outline outline-1 outline-[#ff5722]/10 hover:shadow-[0_8px_30px_-4px_rgba(255,87,34,0.12)] transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#ff5722]/10 to-[#ff5722]/5 outline outline-1 outline-[#ff5722]/20 flex items-center justify-center">
                  <Clock size={18} className="text-[#ff5722]" strokeWidth={2.5} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#ff5722]/70">
                  Streak
                </p>
              </div>
              <p className="text-[28px] font-black text-slate-800 tracking-tight leading-none">
                {streakScore}
                <span className="text-[15px] text-slate-400 font-bold ml-1">
                  🔥
                </span>
              </p>
              <p className="text-[10px] font-semibold text-slate-400 mt-1.5">
                Tests ≥ 70% in a row
              </p>
            </div>
          </div>

          {/* Subject Breakdown */}
          {subjectBreakdown.length > 0 && (
            <div className="bg-white rounded-[1.75rem] outline outline-1 outline-[#ff5722]/10 shadow-[0_4px_20px_-4px_rgba(255,87,34,0.08)] p-5 sm:p-6 mt-4 mb-8">
              <div className="flex items-center justify-between mb-5">
                <span className="px-3 py-1 outline outline-1 outline-[#ff5722]/20 bg-[#ff5722]/10 rounded-xl text-[10px] font-black text-[#ff5722] uppercase tracking-widest">
                  Subject Breakdown
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  {subjectBreakdown.length} subject
                  {subjectBreakdown.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-4">
                {subjectBreakdown.map((s) => (
                  <div key={s.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] font-bold text-slate-700">
                        {s.name}
                      </span>
                      <span className="text-[13px] font-black text-[#ff5722]">
                        {s.avg}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.avg}%` }}
                        transition={{
                          duration: 1,
                          ease: 'easeOut',
                          delay: 0.2,
                        }}
                        className="h-full rounded-full bg-gradient-to-r from-[#ff5722] to-[#ff8a65]"
                      />
                    </div>
                    <p className="text-[10px] font-semibold text-slate-400 mt-1">
                      {s.count} test{s.count !== 1 ? 's' : ''} attempted
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insights Strip */}
          <div className="bg-gradient-to-r from-[#ff5722] to-[#ff8a65] rounded-[1.5rem] p-5 sm:p-6 text-white shadow-md mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-3">
              Quick Insights
            </h3>
            <ul className="space-y-2 text-[13px] font-semibold text-white/95 leading-relaxed">
              <li>
                • Your average is{' '}
                <span className="font-black">{avgPct}%</span> — 
                {avgPct >= 75
                  ? ' excellent work! Keep it up.'
                  : avgPct >= 50
                    ? ' good effort, push for more!'
                    : ' time to revisit fundamentals.'}
              </li>
              {trend !== 0 && (
                <li>
                  • You are trending{' '}
                  <span className="font-black">
                    {trendPositive ? 'upward' : 'downward'}
                  </span>{' '}
                  by {Math.abs(trend)}% compared to your early tests.
                </li>
              )}
              {bestPct !== worstPct && (
                <li>
                  • Your scores range from{' '}
                  <span className="font-black">{worstPct}%</span> to{' '}
                  <span className="font-black">{bestPct}%</span>.
                  {bestPct - worstPct > 30
                    ? ' Consistency needs improvement.'
                    : ' Fairly consistent!'}
                </li>
              )}
              {subjectBreakdown.length > 1 && (
                <li>
                  • Strongest subject:{' '}
                  <span className="font-black">{subjectBreakdown[0].name}</span>{' '}
                  at {subjectBreakdown[0].avg}%.
                </li>
              )}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
