import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
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
  Zap,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
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

type TopicStat = {
  topic: string;
  subject: string;
  correct: number;
  total: number;
  accuracy: number;
};

type TopicResponse = {
  success: boolean;
  data: TopicStat[];
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
  const navigate = useNavigate();

  // 1. Fetch all attempts
  const { data: attemptsData, isLoading: loadingAttempts, error: attemptsError } = useQuery({
    queryKey: ['myAttempts'],
    queryFn: async () => {
      const res = await axiosInstance.get('/attempts/my-attempts');
      return res.data as AttemptsResponse;
    },
  });

  // 2. Fetch topic performance
  const { data: topicsData, isLoading: loadingTopics } = useQuery({
    queryKey: ['topicPerformance'],
    queryFn: async () => {
      const res = await axiosInstance.get('/analytics/topics');
      return res.data as TopicResponse;
    },
  });

  /* derived analytics */
  const analytics = useMemo(() => {
    if (!attemptsData?.success) return null;

    const revealed = attemptsData.attempts.filter(
      (a) => a.resultAvailable && a.score !== null && a.totalQuestions !== null,
    );

    if (revealed.length === 0)
      return {
        chartData: [],
        totalTests: 0,
        avgPct: 0,
        bestPct: 0,
        latestPct: 0,
        trend: 0,
        streakScore: 0,
      };

    const sorted = [...revealed].sort(
      (a, b) =>
        new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
    );

    const chartData = sorted.map((a, i) => ({
      id: a.id,
      name: shortDate(a.submittedAt),
      testLabel: a.test?.title || `Test ${i + 1}`,
      score: pct(a.score!, a.totalQuestions!),
    }));

    const pcts = sorted.map((a) => pct(a.score!, a.totalQuestions!));
    const avgPct = Math.round(pcts.reduce((s, v) => s + v, 0) / pcts.length);
    const bestPct = Math.max(...pcts);
    const latestPct = pcts[pcts.length - 1];

    const recentSlice = pcts.slice(-3);
    const earlySlice = pcts.slice(0, 3);
    const recentAvg = recentSlice.reduce((s, v) => s + v, 0) / recentSlice.length;
    const earlyAvg = earlySlice.reduce((s, v) => s + v, 0) / earlySlice.length;
    const trend = Math.round(recentAvg - earlyAvg);

    let streakScore = 0;
    for (let i = pcts.length - 1; i >= 0; i--) {
      if (pcts[i] >= 70) streakScore++;
      else break;
    }

    return {
      chartData,
      totalTests: sorted.length,
      avgPct,
      bestPct,
      latestPct,
      trend,
      streakScore,
    };
  }, [attemptsData]);

  if (loadingAttempts || loadingTopics) {
    return (
      <div className="min-h-[calc(100vh-88px)] flex flex-col items-center justify-center bg-slate-50 p-4 gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-[#ff5722] border-t-transparent animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Analyzing your progress...</p>
      </div>
    );
  }

  if (attemptsError || !attemptsData?.success) {
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
          <div className="rounded-[2.5rem] bg-white border border-slate-200 shadow-sm p-12 text-center">
            <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Zap size={40} className="text-[#ff5722]/30" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-3">
              No Data to Analyze Yet
            </h2>
            <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
              Complete your first test to unlock dynamic charts, streak tracking, and interactive performance insights.
            </p>
            <Link 
              to="/tests" 
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-[#ff5722] text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-[#ff5722]/20 transition-all active:scale-95"
            >
              Take a Test <ArrowRight size={18} />
            </Link>
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
    latestPct,
    trend,
    streakScore,
  } = analytics;

  const weakAreas = topicsData?.data?.filter(t => t.accuracy < 60) || [];
  const strongAreas = topicsData?.data?.filter(t => t.accuracy >= 75) || [];

  /* ──── Chart Interaction ──── */
  const handlePointClick = (data: any) => {
    if (data && data.id) {
      navigate(`/attempts/${data.id}`);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 px-5 py-4 min-w-[160px]">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#ff5722] mb-2">
            Attempt Details
          </p>
          <p className="text-sm font-black text-slate-900 mb-1 leading-tight">
            {d.testLabel}
          </p>
          <div className="flex items-center gap-2 mb-2">
             <div className="h-1.5 w-1.5 rounded-full bg-[#ff5722]" />
             <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{d.name}</p>
          </div>
          <p className="text-2xl font-black text-slate-900">{d.score}%</p>
          <p className="mt-2 text-[10px] font-bold text-slate-400 italic">
            Click point to view full results →
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-[calc(100vh-88px)] bg-slate-50 px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Title Area */}
        <div className="flex flex-col mb-10">
          <div className="flex items-center gap-4 mb-3">
             <Link
              to="/dashboard"
              className="h-10 w-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#ff5722] transition-colors shadow-sm"
            >
              <ChevronLeft size={20} />
            </Link>
            <span className="px-3 py-1 bg-[#ff5722]/10 text-[#ff5722] text-[10px] font-black uppercase tracking-widest rounded-lg border border-[#ff5722]/10">
              Student Hub
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-2">
            Analytic
          </h1>
          <p className="text-sm md:text-base font-medium text-slate-500 max-w-lg leading-relaxed">
            Tracking your progress across <span className="text-slate-900 font-bold">{totalTests} attempts</span>. 
            Tap any data point on the graph to review that specific test result.
          </p>
        </div>

        {/* ─── Interactive Graph ─── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-6 md:p-8 mb-8 overflow-hidden relative group"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              Performance Trend
              <span className="h-5 px-2 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-md flex items-center border border-emerald-100 uppercase tracking-tight">
                Points Clickable
              </span>
            </h3>
            
            <div className="flex items-center gap-6">
               <div className="flex flex-col items-end">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Trend</span>
                 <div className={`flex items-center gap-1 font-black ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                   {trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                   <span>{trend >= 0 ? '+' : ''}{trend}%</span>
                 </div>
               </div>
            </div>
          </div>

          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                onClick={(e) => {
                  if (e && e.activePayload) handlePointClick(e.activePayload[0].payload);
                }}
              >
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff5722" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ff5722" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} 
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                   domain={[0, 100]} 
                   tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} 
                   axisLine={false}
                   tickLine={false}
                   tickFormatter={v => `${v}%`}
                />
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ stroke: '#ff5722', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#ff5722"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorScore)"
                  activeDot={{ 
                    r: 8, 
                    fill: '#ff5722', 
                    stroke: '#fff', 
                    strokeWidth: 3, 
                    style: { cursor: 'pointer' },
                    onClick: (e: any, props: any) => handlePointClick(props.payload)
                  }}
                  dot={{ 
                    r: 6, 
                    fill: '#fff', 
                    stroke: '#ff5722', 
                    strokeWidth: 3,
                    style: { cursor: 'pointer' } 
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute bottom-4 right-8 flex items-center gap-1.5 text-[10px] font-bold text-slate-300 pointer-events-none uppercase tracking-widest">
            Tap a point to view result
          </div>
        </motion.div>

        {/* ─── Performance Analysis Section ─── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Main Info Block */}
          <div className="md:col-span-12">
            <h2 className="text-xl font-black text-slate-800 mb-6 px-1 flex items-center gap-3">
               Performance Analysis
               <div className="h-[2px] flex-1 bg-slate-200" />
            </h2>
          </div>

          {/* Quick Metrics */}
          <div className="md:col-span-4 grid grid-cols-1 gap-4">
             <MetricCard 
                label="Average Accuracy" 
                value={avgPct} 
                icon={<Target size={20} />} 
                color="orange" 
                suffix="%" 
                delay={0}
             />
             <MetricCard 
                label="Peak Achievement" 
                value={bestPct} 
                icon={<Trophy size={20} />} 
                color="emerald" 
                suffix="%" 
                delay={0.1}
             />
             <MetricCard 
                label="Current Streak" 
                value={streakScore} 
                icon={<Clock size={20} />} 
                color="blue" 
                suffix=" tests" 
                subtext="Tests ≥ 70% accuracy"
                delay={0.2}
             />
          </div>

          {/* Detailed Diagnosis Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-8 bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-sm"
          >
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Larning Diagnosis</h3>
               <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black rounded-lg border border-slate-200 uppercase tracking-widest">
                 Based on {totalTests} attempts
               </span>
             </div>

             <div className="space-y-8">
               {/* Weak Areas */}
               {weakAreas.length > 0 ? (
                 <div>
                   <div className="flex items-center gap-2 mb-4 text-rose-500">
                     <AlertCircle size={18} />
                     <h4 className="text-[13px] font-black uppercase tracking-widest">Areas for Improvement</h4>
                   </div>
                   <div className="space-y-4">
                     {weakAreas.map((area) => (
                       <TopicRow key={area.topic} area={area} color="rose" />
                     ))}
                   </div>
                   <p className="mt-4 text-[12px] font-medium text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-dashed border-slate-200">
                     💡 Tip: Focus on <span className="text-slate-900 font-bold">{weakAreas[0].topic}</span> first. Re-reading the fundamental concepts here could boost your total average significantly.
                   </p>
                 </div>
               ) : (
                 <div className="p-6 bg-emerald-50 rounded-2.4xl border border-emerald-100 text-center">
                    <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-3" />
                    <p className="text-sm font-bold text-emerald-800">No major weak areas detected!</p>
                    <p className="text-xs font-medium text-emerald-600 mt-1">Consistency is your strength. Keep maintaining this level.</p>
                 </div>
               )}

               {/* Strong Areas */}
               {strongAreas.length > 0 && (
                 <div className="pt-4 border-t border-slate-100">
                   <div className="flex items-center gap-2 mb-4 text-emerald-500">
                     <CheckCircle2 size={18} />
                     <h4 className="text-[13px] font-black uppercase tracking-widest">Your Strengths</h4>
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {strongAreas.map(area => (
                       <div key={area.topic} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[12px] font-bold rounded-xl border border-emerald-100 flex items-center gap-2">
                         {area.topic}
                         <span className="text-[10px] bg-emerald-100 px-1 rounded-md">{area.accuracy}%</span>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

/* ──────────────────── sub-components ──────────────────── */

function MetricCard({ label, value, icon, color, suffix, subtext, delay }: any) {
  const colorMap: any = {
    orange: 'text-[#ff5722] bg-[#ff5722]/10 border-[#ff5722]/10',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="bg-white border border-slate-200 rounded-2.4xl p-5 shadow-sm hover:shadow-md transition-shadow group"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${colorMap[color]}`}>
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
          <span className="text-2xl font-black text-slate-900 tracking-tight leading-none pt-1">
             {value}{suffix}
          </span>
        </div>
      </div>
      {subtext && (
        <p className="text-[10px] font-bold text-slate-400 bg-slate-50 p-2 rounded-lg">{subtext}</p>
      )}
    </motion.div>
  );
}

function TopicRow({ area, color }: { area: TopicStat; color: 'rose' | 'emerald' }) {
  const colors = {
    rose: 'bg-rose-500',
    emerald: 'bg-emerald-500'
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] font-bold text-slate-800">{area.topic}</span>
        <span className={`text-[13px] font-black ${color === 'rose' ? 'text-rose-500' : 'text-emerald-600'}`}>
          {area.accuracy}%
        </span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${area.accuracy}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${colors[color]}`}
        />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] font-bold text-slate-400 italic capitalize">{area.subject}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{area.correct}/{area.total} Correct</span>
      </div>
    </div>
  );
}
