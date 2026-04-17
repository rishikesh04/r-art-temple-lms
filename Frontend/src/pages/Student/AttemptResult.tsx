import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flag, Target, Trophy, FileText, ChevronLeft, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getApiMessage } from '../../utils/apiMessage';
import Locked403 from '../../assets/403 Error Forbidden-pana.svg';
import Review404 from '../../assets/Time management-rafiki.svg';

type AttemptAnswer = {
  questionId: string | null;
  questionText: string;
  options: string[];
  selectedAnswer: number | null;
  correctAnswer: number | null;
  isCorrect: boolean;
  explanation: string;
  subject: string;
  chapter: string;
  difficulty: string;
};

type AttemptDetails = {
  attemptId: string;
  testId: string | null;
  testTitle: string;
  testDescription?: string;
  duration?: number;
  testStartTime?: string | null;
  testEndTime?: string | null;
  subject: string | null;
  testType: string;
  score: number;
  totalQuestions: number;
  attemptNumber: number;
  accuracy: number;
  submittedAt: string;
  mode?: string;
  answers: AttemptAnswer[];
};

type AttemptDetailsResponse = {
  success: boolean;
  data: AttemptDetails;
};

type LeaderboardRow = {
  rank: number;
  studentId: string;
  score: number;
};
type LeaderboardResponse = {
  success: boolean;
  totalParticipants: number;
  leaderboard: LeaderboardRow[];
};

export default function AttemptResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'Analysis' | 'Solutions' | 'Leaderboard'>('Analysis');
  const [solutionFilter, setSolutionFilter] = useState<'All' | 'Correct' | 'Incorrect' | 'Unattempted'>('All');

  const { data: attemptData, isLoading: isLoadingAttempt, error: attemptError } = useQuery({
    queryKey: ['attempt', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await axiosInstance.get(`/attempts/my-attempts/${id}`);
      return res.data as AttemptDetailsResponse;
    },
  });

  const testId = attemptData?.data?.testId;

  const { data: lbData } = useQuery({
    queryKey: ['leaderboard', testId],
    enabled: Boolean(testId && (attemptData?.data?.mode === 'practice' || attemptData?.data?.testType === 'practice' || attemptData?.data?.mode === 'live' || attemptData?.data?.testType === 'live')),
    queryFn: async () => {
      const res = await axiosInstance.get(`/tests/${testId}/leaderboard`);
      return res.data as LeaderboardResponse;
    },
  });

  const { data: allAttemptsData } = useQuery({
    queryKey: ['my-attempts-all'],
    enabled: Boolean(testId && (attemptData?.data?.mode === 'practice' || attemptData?.data?.testType === 'practice')),
    queryFn: async () => {
      const res = await axiosInstance.get('/attempts/my-attempts');
      return res.data;
    },
  });

  const trajectoryData = useMemo(() => {
    if (!allAttemptsData?.attempts || !testId) return [];
    const testAttempts = allAttemptsData.attempts
      .filter((a: any) => (a.test?._id || a.test) === testId)
      .sort((a: any, b: any) => a.attemptNumber - b.attemptNumber);

    return testAttempts.map((a: any) => ({
      name: `Att ${a.attemptNumber}`,
      fullScore: `${a.score} / ${a.totalQuestions}`,
      score: a.score,
      date: new Date(a.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }));
  }, [allAttemptsData, testId]);

  const attemptRaw = attemptData?.data;

  const filteredAnswers = useMemo(() => {
    if (!attemptRaw) return [];
    if (solutionFilter === 'All') return attemptRaw.answers;
    return attemptRaw.answers.filter(a => {
      const isUn = a.selectedAnswer === null || a.selectedAnswer === undefined;
      if (solutionFilter === 'Unattempted') return isUn;
      if (solutionFilter === 'Correct') return a.isCorrect && !isUn;
      if (solutionFilter === 'Incorrect') return !a.isCorrect && !isUn;
      return true;
    });
  }, [attemptRaw, solutionFilter]);

  const isLoading = isLoadingAttempt;
  const isLocked = attemptError && (attemptError as any).response?.status === 403;
  const errText = attemptError ? getApiMessage(attemptError, 'Failed to load attempt result.') : null;

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-88px)] bg-[#fafafa] flex items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#ff5722] border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Loading Result...</p>
        </div>
      </div>
    );
  }

  if (errText || !attemptData?.success) {
    return (
      <div className="min-h-[calc(100vh-88px)] bg-[#fafafa] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-center">
          <div className="p-8">
            <img
              src={isLocked ? Locked403 : Review404}
              alt="State"
              className="w-48 h-48 mx-auto opacity-90 mb-6"
            />
            <h2 className="text-2xl font-black text-[#ff5722] mb-3">
              {isLocked ? 'Result will be available when test ends' : 'Result Unavailable'}
            </h2>
            <p className="text-slate-600 font-medium text-sm mb-8">
              {isLocked
                ? 'This platform is time-locked by the backend for fairness. When the test ends, the full review will be available.'
                : errText || 'Failed to load attempt result.'}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button type="button" onClick={() => navigate('/dashboard')} className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors">
                Go to Hub
              </button>
              {(attemptData?.data?.mode === 'practice' || attemptData?.data?.testType === 'practice') && attemptData?.data?.testId && (
                <button
                  type="button"
                  onClick={() => navigate(`/tests/${attempt.testId}`)}
                  className="px-6 py-3 rounded-xl bg-[#ff5722] text-white font-bold hover:brightness-105 transition-all shadow-md shadow-orange-500/20"
                >
                  Retake Test
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const attempt = attemptData.data;
  const lbInfo = lbData && lbData.success ? lbData : null;
  const totalParticipants = lbInfo?.totalParticipants || 0;

  // Derivations
  let myRank = '-';
  let topperScore = attempt.score;
  let avgScore = attempt.score;

  if (lbInfo && lbInfo.leaderboard.length > 0) {
    const list = lbInfo.leaderboard;
    topperScore = list[0].score;
    const sum = list.reduce((a, b) => a + b.score, 0);
    avgScore = Number((sum / list.length).toFixed(2));

    if (user) {
      const match = list.find(r => r.studentId === user._id || (user as any).id === r.studentId);
      if (match) {
        myRank = String(match.rank);
      } else {
        const approx = list.find(r => r.score <= attempt.score);
        if (approx && approx.score === attempt.score) myRank = String(approx.rank);
      }
    }
  }

  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  attempt.answers.forEach(a => {
    if (a.selectedAnswer === null || a.selectedAnswer === undefined) unattemptedCount++;
    else if (a.isCorrect) correctCount++;
    else incorrectCount++;
  });

  const qsAttempted = correctCount + incorrectCount;

  const barMax = Math.max(attempt.score, topperScore, avgScore) || 10;
  const chartUpperBound = Math.ceil((barMax + 1) / 3) * 3;



  return (
    <div className="min-h-screen bg-slate-50 relative pb-16">
      {/* Compact Premium Hero Header */}
      <div className="bg-[#ff5722] text-white pt-5 pb-6 px-4 rounded-b-3xl shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#e64a19] to-[#ff8a65] opacity-50 pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl mx-auto flex items-center gap-4">
          <button type="button" onClick={() => navigate('/dashboard')} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition text-white shrink-0">
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1.5 opacity-90">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-white/20 drop-shadow-sm">
                {attempt.subject || 'Mixed Subject'}
              </span>
              {attempt.duration ? (
                <span className="text-[12px] font-medium tracking-wide drop-shadow-sm">{attempt.duration} mins</span>
              ) : null}
              {attempt.testStartTime ? (
                <span className="text-[12px] font-medium tracking-wide drop-shadow-sm border-l border-white/30 pl-3">
                  {new Date(attempt.testStartTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              ) : null}
            </div>

            <h1 className="text-xl md:text-2xl font-black tracking-tight drop-shadow-sm truncate">{attempt.testTitle}</h1>

            {attempt.testDescription && (
              <p className="text-white/80 font-medium text-[13px] truncate mt-1">
                {attempt.testDescription}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-6 relative z-20 pb-16">
        {/* Tab Navigation */}
        <div className="sticky top-[0px] z-30 pt-4 pb-4 -mt-4 mb-6 bg-slate-50/90 backdrop-blur-md border-b border-slate-200/50 flex flex-wrap justify-center items-center gap-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            type="button"
            onClick={() => setActiveTab('Analysis')}
            className={`px-5 py-2.5 rounded-full text-[13px] font-bold tracking-wide transition-all duration-200 shadow-sm ${activeTab === 'Analysis'
              ? 'bg-[#ff5722] text-white border border-[#ff5722]'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
          >
            Analysis
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('Solutions')}
            className={`px-5 py-2.5 rounded-full text-[13px] font-bold tracking-wide transition-all duration-200 shadow-sm ${activeTab === 'Solutions'
              ? 'bg-[#ff5722] text-white border border-[#ff5722]'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
          >
            Solutions
          </button>
          {testId && (attempt?.mode === 'practice' || attempt?.testType === 'practice' || attempt?.mode === 'live' || attempt?.testType === 'live') && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('Leaderboard');
                navigate(`/tests/${testId}/leaderboard`);
              }}
              className={`px-5 py-2.5 rounded-full text-[13px] font-bold tracking-wide transition-all duration-200 shadow-sm ${activeTab === 'Leaderboard'
                ? 'bg-[#ff5722] text-white border border-[#ff5722]'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
            >
              Leaderboard
            </button>
          )}
        </div>

        {activeTab === 'Analysis' && (
          <div className="space-y-4">
            {/* Top 2 Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Rank Card / Attempt Number */}
              <div className="bg-white rounded-[1.75rem] p-5 shadow-[0_4px_20px_-4px_rgba(255,87,34,0.1)] outline outline-1 outline-[#ff5722]/10 flex items-center gap-4 group hover:shadow-[0_8px_30px_-4px_rgba(255,87,34,0.15)] hover:outline-[#ff5722]/20 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#ff5722]/10 to-[#ff5722]/5 outline outline-1 outline-[#ff5722]/20 flex items-center justify-center shrink-0">
                  <Flag size={20} className="text-[#ff5722]" strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#ff5722]/70 mb-0.5">
                    {(attempt.mode === 'practice' || attempt.testType === 'practice') ? 'Attempt No.' : 'Rank'}
                  </p>
                  <p className="text-[22px] font-black text-slate-800 tracking-tight truncate leading-tight">
                    {(attempt.mode === 'practice' || attempt.testType === 'practice') ? attempt.attemptNumber : myRank}
                    {(attempt.mode === 'live' || (attempt.testType === 'live' && attempt.mode !== 'practice')) && <span className="text-[14px] text-slate-400 font-bold ml-[1px]">/{totalParticipants || '-'}</span>}
                  </p>
                </div>
              </div>

              {/* Accuracy Card */}
              <div className="bg-white rounded-[1.75rem] p-5 shadow-[0_4px_20px_-4px_rgba(255,87,34,0.1)] outline outline-1 outline-[#ff5722]/10 flex items-center gap-4 group hover:shadow-[0_8px_30px_-4px_rgba(255,87,34,0.15)] hover:outline-[#ff5722]/20 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#ff5722]/10 to-[#ff5722]/5 outline outline-1 outline-[#ff5722]/20 flex items-center justify-center shrink-0">
                  <Target size={20} className="text-[#ff5722]" strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#ff5722]/70 mb-0.5">Accuracy</p>
                  <p className="text-[22px] font-black text-slate-800 tracking-tight truncate leading-tight">
                    {attempt.accuracy}%
                  </p>
                </div>
              </div>
            </div>

            {/* Score Card */}
            <div className="bg-white rounded-[1.75rem] shadow-[0_4px_20px_-4px_rgba(255,87,34,0.1)] outline outline-1 outline-[#ff5722]/10 overflow-hidden hover:shadow-[0_8px_30px_-4px_rgba(255,87,34,0.15)] hover:outline-[#ff5722]/20 transition-all">
              <div className="p-5 flex items-center gap-4 bg-white">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#ff5722]/10 to-[#ff5722]/5 outline outline-1 outline-[#ff5722]/20 flex items-center justify-center shrink-0">
                  <Trophy size={20} className="text-[#ff5722]" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1 flex justify-between items-center">
                  <p className="text-[13px] font-bold text-slate-600 uppercase tracking-widest leading-none">Score</p>
                  <p className="text-[22px] font-black text-[#ff5722] tracking-tight shrink-0 leading-none drop-shadow-sm">
                    {attempt.score}<span className="text-[15px] text-slate-400 font-bold ml-[1px]">/{attempt.totalQuestions}</span>
                  </p>
                </div>
              </div>
              <div className="bg-[#ff5722]/[0.02] px-5 py-3.5 flex items-center justify-center gap-4 text-[10px] sm:text-[11px] font-bold text-[#ff5722]/70 uppercase tracking-widest border-t border-[#ff5722]/10">
                <span>Average Score<span className="opacity-0 sm:opacity-100"> : </span>{avgScore}</span>
                <span className="w-px h-3 bg-[#ff5722]/20"></span>
                <span>Best Score<span className="opacity-0 sm:opacity-100"> : </span>{topperScore}</span>
              </div>
            </div>

            {/* Qs Attempted Card */}
            <div className="bg-white rounded-[1.75rem] shadow-[0_4px_20px_-4px_rgba(255,87,34,0.1)] outline outline-1 outline-[#ff5722]/10 overflow-hidden hover:shadow-[0_8px_30px_-4px_rgba(255,87,34,0.15)] hover:outline-[#ff5722]/20 transition-all">
              <div className="p-5 flex items-center gap-4 bg-white">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#ff5722]/10 to-[#ff5722]/5 outline outline-1 outline-[#ff5722]/20 flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-[#ff5722]" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1 flex justify-between items-center">
                  <p className="text-[13px] font-bold text-slate-600 uppercase tracking-widest truncate leading-none">Qs. Attempted</p>
                  <p className="text-[22px] font-black text-slate-800 tracking-tight shrink-0 leading-none">
                    {qsAttempted}<span className="text-[15px] text-slate-400 font-bold ml-[1px]">/{attempt.totalQuestions}</span>
                  </p>
                </div>
              </div>
              <div className="bg-[#ff5722]/[0.02] px-5 py-3.5 flex flex-wrap items-center justify-evenly gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest border-t border-[#ff5722]/10">
                <span className="text-emerald-600">Correct: {correctCount}</span>
                <span className="text-rose-500">Incorrect: {incorrectCount}</span>
                <span className="text-slate-400">Unattempted: {unattemptedCount}</span>
              </div>
            </div>

            {/* Bar Chart Card (Live) or Trajectory (Practice) */}
            {(attempt.mode === 'live' || (attempt.testType === 'live' && attempt.mode !== 'practice')) ? (
              <div className="bg-white rounded-[1.75rem] shadow-[0_4px_20px_-4px_rgba(255,87,34,0.1)] outline outline-1 outline-[#ff5722]/10 overflow-hidden p-6 mt-2 relative hover:shadow-[0_8px_30px_-4px_rgba(255,87,34,0.15)] hover:outline-[#ff5722]/20 transition-all">
                <div className="absolute top-5 left-5 z-20">
                  <span className="px-3 py-1.5 outline outline-1 outline-[#ff5722]/20 bg-[#ff5722]/10 rounded-xl text-[10px] font-bold text-[#ff5722] uppercase tracking-widest shadow-sm">
                    Score Distribution
                  </span>
                </div>

                {/* Chart Area */}
                <div className="mt-14 h-52 w-full relative flex items-end justify-around px-8 pb-8 pt-4">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pb-8 z-0">
                    <div className="w-full border-t border-slate-200"></div>
                    <div className="w-full border-t border-slate-200"></div>
                    <div className="w-full border-t border-slate-200"></div>
                    <div className="w-full border-t border-slate-900 border-b-0 h-px transform translate-y-px"></div>
                  </div>

                  {/* Y Axis Labels */}
                  <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between py-0 z-0">
                    <span className="text-[10px] font-bold text-slate-400 absolute -top-2 w-4 text-right transform -translate-y-1/2">{chartUpperBound}</span>
                    <span className="text-[10px] font-bold text-slate-400 absolute top-1/2 w-4 text-right transform -translate-y-1/2">{Math.floor(chartUpperBound * 0.5)}</span>
                    <span className="text-[10px] font-bold text-slate-400 absolute bottom-0 w-4 text-right transform translate-y-1/2">0</span>
                  </div>

                  {/* Bars */}
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(1, (attempt.score / chartUpperBound) * 100)}%` }}
                      transition={{ ease: "easeOut", duration: 1, delay: 0.1 }}
                      className="w-10 sm:w-16 bg-[#fed7aa] rounded-t-[0.7rem] outline outline-1 outline-[#fdba74] shadow-sm transform origin-bottom"
                      style={{ bottom: 0 }}
                    />
                    <span className="absolute -bottom-6 text-[10px] sm:text-[11px] font-bold tracking-wide text-slate-500">You</span>
                  </div>

                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(1, (topperScore / chartUpperBound) * 100)}%` }}
                      transition={{ ease: "backOut", duration: 0.9, delay: 0.2 }}
                      className="w-10 sm:w-16 bg-[#ff5722] rounded-t-[0.7rem] shadow-md outline outline-2 outline-[#ff5722] transform origin-bottom"
                      style={{ bottom: 0 }}
                    />
                    <span className="absolute -bottom-6 text-[10px] sm:text-[11px] font-bold tracking-wide text-slate-800">Topper</span>
                  </div>

                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(1, (avgScore / chartUpperBound) * 100)}%` }}
                      transition={{ ease: "easeOut", duration: 1.1, delay: 0.15 }}
                      className="w-10 sm:w-16 bg-[#fbbf24] rounded-t-[0.7rem] shadow-sm outline outline-2 outline-[#f59e0b] transform origin-bottom"
                      style={{ bottom: 0 }}
                    />
                    <span className="absolute -bottom-6 text-[10px] sm:text-[11px] font-bold tracking-wide text-slate-500">Average</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[1.75rem] shadow-[0_4px_20px_-4px_rgba(255,87,34,0.1)] outline outline-1 outline-[#ff5722]/10 overflow-hidden p-6 mt-2 relative hover:shadow-[0_8px_30px_-4px_rgba(255,87,34,0.15)] hover:outline-[#ff5722]/20 transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#ff5722]/10 to-[#ff5722]/5 outline outline-1 outline-[#ff5722]/20 flex items-center justify-center shrink-0">
                    <TrendingUp size={20} className="text-[#ff5722]" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Progress Trajectory</h3>
                    <p className="text-[11px] font-semibold text-slate-500">How you've improved over {trajectoryData.length} attempts</p>
                  </div>
                </div>

                <div className="h-64 w-full">
                  {trajectoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} domain={[0, 'dataMax + 2']} />
                        <RechartsTooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', padding: '12px 16px', fontWeight: 'bold' }}
                          labelStyle={{ color: '#ff5722', marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em' }}
                          itemStyle={{ color: '#1e293b', fontSize: '14px' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#ff5722"
                          strokeWidth={3}
                          dot={{ r: 5, fill: "#ff5722", strokeWidth: 2, stroke: "#fff" }}
                          activeDot={{ r: 7, fill: "#ff5722", strokeWidth: 0 }}
                          animationDuration={1500}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm font-medium text-slate-400">Loading trajectory...</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Solutions' && (
          <div className="bg-white rounded-[1.75rem] outline outline-1 outline-slate-200 shadow-sm mb-8 mt-2 relative">
            <div className="sticky top-[64px] sm:top-[68px] z-20 p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 outline outline-1 outline-slate-200 bg-white/95 backdrop-blur-md rounded-t-[1.75rem] shadow-sm">
              <h2 className="text-[13px] font-black text-slate-800 uppercase tracking-widest shrink-0">Solutions & Explanations</h2>
              <div className="flex flex-wrap items-center gap-2">
                {['All', 'Correct', 'Incorrect', 'Unattempted'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setSolutionFilter(f as any)}
                    className={`px-3 py-1.5 rounded-[0.7rem] text-[10px] font-black uppercase tracking-widest transition-all ${solutionFilter === f
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-white text-slate-500 outline outline-1 outline-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 space-y-6">
              {filteredAnswers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 font-bold text-[13px] uppercase tracking-widest">No questions match this filter.</p>
                </div>
              ) : filteredAnswers.map((a, idx) => {
                const isUn = a.selectedAnswer === null || a.selectedAnswer === undefined;
                const isCorrect = a.isCorrect && !isUn;
                const isWrong = !a.isCorrect && !isUn;

                const blockBgBase = isCorrect ? 'bg-emerald-50/40 outline-emerald-500/20 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.1)]'
                  : isWrong ? 'bg-rose-50/40 outline-rose-500/20 shadow-[0_4px_20px_-4px_rgba(244,63,94,0.1)]'
                    : 'bg-slate-50/30 outline-slate-200 shadow-sm';

                return (
                  <div key={`${a.questionId ?? idx}`} className={`outline outline-1 rounded-[1.25rem] overflow-hidden ${blockBgBase}`}>
                    <div className="p-5 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[10px] font-black uppercase tracking-widest text-[#ff5722] mb-1.5 opacity-80">
                          Question {attempt.answers.findIndex(ans => ans.questionId === a.questionId) + 1}
                        </div>
                        <div className="font-semibold text-slate-800 leading-relaxed text-[15px]">{a.questionText}</div>
                      </div>
                      <div
                        className={[
                          'px-2.5 py-1 rounded-[0.5rem] text-[10px] font-black uppercase tracking-widest shrink-0 outline outline-1 bg-white',
                          isCorrect ? 'text-emerald-600 outline-emerald-200' :
                            isWrong ? 'text-rose-500 outline-rose-200' : 'text-slate-500 outline-slate-200'
                        ].join(' ')}
                      >
                        {isCorrect ? 'Correct' : isWrong ? 'Wrong' : 'Skipped'}
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className={`backdrop-blur-sm outline outline-1 text-[13px] rounded-xl p-3 shadow-sm transition-colors ${isCorrect ? 'bg-emerald-50/80 outline-emerald-200 text-emerald-900' :
                          isWrong ? 'bg-rose-50/80 outline-rose-200 text-rose-900' :
                            'bg-white/80 outline-black/5 text-slate-800'
                          }`}>
                          <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isCorrect ? 'text-emerald-600/80' :
                            isWrong ? 'text-rose-500/80' :
                              'text-slate-400'
                            }`}>Your answer</div>
                          <div className="font-bold">
                            {isUn
                              ? 'Not answered'
                              : a.options[a.selectedAnswer!] ?? `Option ${a.selectedAnswer! + 1}`}
                          </div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm outline text-[13px] outline-1 outline-black/5 rounded-xl p-3 shadow-sm">
                          <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1 opacity-80">Correct answer</div>
                          <div className="font-bold text-slate-800">
                            {a.correctAnswer === null || a.correctAnswer === undefined
                              ? '—'
                              : a.options[a.correctAnswer] ?? `Option ${a.correctAnswer + 1}`}
                          </div>
                        </div>
                      </div>

                      {a.explanation && (
                        <div className="mt-3 bg-white/80 backdrop-blur-sm outline outline-1 outline-black/5 rounded-xl p-4 shadow-sm">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Explanation</div>
                          <div className="text-[13px] font-semibold text-slate-600 leading-relaxed whitespace-pre-line">{a.explanation}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
