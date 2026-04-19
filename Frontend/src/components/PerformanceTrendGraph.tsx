import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, ArrowRight, Clock } from 'lucide-react';

export type AttemptPoint = {
  attemptId: string;
  testTitle: string;
  testSubject: string;
  score: number;
  totalQuestions: number;
  scorePercent: number;
  submittedAt: string;
  displayDate: string;
};

type Props = {
  attempts: AttemptPoint[];
};

// Moved outside to prevent stale closures and re-definition bugs
const CustomDot = (props: any) => {
  const { cx, cy, payload, selectedId } = props;
  const isSelected = selectedId === payload.attemptId;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={isSelected ? 9 : 6}
      fill={isSelected ? '#ff5722' : '#fff'}
      stroke="#ff5722"
      strokeWidth={isSelected ? 4 : 2}
      className="transition-all duration-300"
      style={{
        filter: isSelected ? 'drop-shadow(0 4px 12px rgba(255, 87, 34, 0.4))' : 'none',
        outline: 'none',
        cursor: 'pointer'
      }}
    />
  );
};

export default function PerformanceTrendGraph({ attempts }: Props) {
  const navigate = useNavigate();
  const [selectedAttempt, setSelectedAttempt] = useState<AttemptPoint | null>(null);

  if (!attempts || attempts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
          No attempts yet
        </p>
      </div>
    );
  }

  // Calculate trend
  let trendPercent = 0;
  if (attempts.length >= 2) {
    const latest = attempts[attempts.length - 1].scorePercent;
    const previous = attempts[attempts.length - 2].scorePercent;
    trendPercent = latest - previous;
  }

  const isPositive = trendPercent > 0;
  const isNegative = trendPercent < 0;

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden mb-8">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">
            Performance Trend
          </h3>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Last {attempts.length} attempts
          </p>
        </div>
        {attempts.length >= 2 && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
            isPositive ? 'bg-emerald-50 text-emerald-600' :
            isNegative ? 'bg-rose-50 text-rose-600' :
            'bg-slate-50 text-slate-500'
          }`}>
            {isPositive && <TrendingUp size={14} strokeWidth={2.5} />}
            {isNegative && <TrendingDown size={14} strokeWidth={2.5} />}
            {isPositive && '+'}
            {trendPercent.toFixed(0)}%
          </div>
        )}
      </div>

      {/* Graph */}
      <div className="p-5 sm:p-6">
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={attempts} 
              margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
              onMouseDown={(e) => {
                if (e && e.activeTooltipIndex !== undefined) {
                  setSelectedAttempt(attempts[e.activeTooltipIndex]);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="displayDate" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                dy={8}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Line 
                type="monotone" 
                dataKey="scorePercent" 
                stroke="#ff5722" 
                strokeWidth={4}
                dot={<CustomDot selectedId={selectedAttempt?.attemptId} />}
                activeDot={false}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Selected Attempt Card - Premium Minimalist Redesign */}
        <AnimatePresence>
          {selectedAttempt && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-8"
            >
              <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden group transition-all hover:border-[#ff5722]/30">
                {/* Subtle Brand Accent Line */}
                <div className="absolute top-0 left-0 w-1 h-full bg-[#ff5722]" />

                <div className="flex items-center gap-5">
                  {/* High-Contrast Accuracy Badge */}
                  <div className="h-14 w-14 rounded-xl bg-[#ff5722]/5 flex flex-col items-center justify-center border border-[#ff5722]/10 shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#ff5722] opacity-60 leading-none mb-1">Pct</span>
                    <span className="text-xl font-black text-[#ff5722] tracking-tighter leading-none">
                      {selectedAttempt.scorePercent}%
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-slate-900 mb-0.5 leading-tight">
                      {selectedAttempt.testTitle}
                    </h4>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Clock size={12} /> {selectedAttempt.displayDate}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-slate-200" />
                      <span className="text-[10px] font-black text-[#ff5722] uppercase tracking-widest">
                        {selectedAttempt.score}/{selectedAttempt.totalQuestions} Marks
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/attempts/${selectedAttempt.attemptId}`)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-[#ff5722] text-white rounded-xl py-3 px-6 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-[#ff5722]/20"
                >
                  Analysis
                  <ArrowRight size={16} strokeWidth={3} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Stats */}
      <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-around text-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
            Avg Accuracy
          </p>
          <p className="text-xl font-black text-slate-800">
            {Math.round(attempts.reduce((sum, a) => sum + a.scorePercent, 0) / attempts.length)}%
          </p>
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
            Total Tests
          </p>
          <p className="text-xl font-black text-slate-800">
            {attempts.length}
          </p>
        </div>
      </div>
    </div>
  );
}
