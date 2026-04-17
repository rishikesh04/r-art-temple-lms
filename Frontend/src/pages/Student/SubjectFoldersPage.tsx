import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { SYLLABUS } from '../../utils/syllabus';
import { ChevronLeft, FolderOpen, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import MathTileImg from '../../assets/Mathematics-cuate.svg';
import ScienceTileImg from '../../assets/beaker chemistry-bro.svg';

type TestItem = {
  _id: string;
  title: string;
  classLevel: string;
  subject: string;
  chapter: string;
  testType: string;
  mode?: string;
  duration: number;
  totalMarks: number;
  startTime: string;
  endTime: string;
  hasAttempted: boolean;
  latestAttemptId: string | null;
};

type StructureResponse = {
  success: boolean;
  structure: Record<string, Record<string, { live: TestItem[]; practice: TestItem[] }>>;
};

const formatDateTime = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function SubjectFoldersPage() {
  const { subjectName } = useParams<{ subjectName: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Drill-down state
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'live' | 'practice' | null>(null);

  const { data: structData, isLoading } = useQuery({
    queryKey: ['testsStructure'],
    queryFn: async () => {
      const res = await axiosInstance.get('/tests/structure');
      return res.data as StructureResponse;
    },
  });

  if (!subjectName) return null;

  // Normalize subjectName for lookups
  const normalizedSubject = subjectName.toLowerCase().includes('math') ? 'Math' :
    subjectName.toLowerCase().includes('sci') ? 'Science' :
      subjectName;

  const classLvl = user?.classLevel || '10';
  let syllabusChapters: string[] = [];

  if (SYLLABUS[classLvl] && SYLLABUS[classLvl][normalizedSubject]) {
    syllabusChapters = SYLLABUS[classLvl][normalizedSubject];
  } else {
    // Fallback if class not in syllabus constant
    syllabusChapters = structData?.structure[normalizedSubject] ? Object.keys(structData.structure[normalizedSubject]) : [];
  }

  const subjectData = structData?.structure[normalizedSubject] || {};
  const bgImg = subjectName.toLowerCase().includes('math') ? MathTileImg : ScienceTileImg;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 rounded-full border-4 border-brand-orange border-t-transparent animate-spin" />
          <p className="text-sm font-semibold uppercase tracking-widest">Loading Folders...</p>
        </div>
      </div>
    );
  }

  // Explicitly define the mandatory root folders
  const specialFolders = ['Full Syllabus', 'Mix Chapters'];

  return (
    <div className="min-h-[calc(100vh-88px)] bg-[#fafafa] pb-16 relative">
      {/* Premium Header */}
      <div className="h-64 sm:h-72 w-full relative overflow-hidden bg-slate-900 rounded-b-[2.5rem] shadow-lg">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
          style={{ backgroundImage: `url(${bgImg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={() => {
              if (selectedType) {
                // Return to Level 2
                setSelectedType(null);
              } else if (selectedChapter) {
                // Return to Level 1
                setSelectedChapter(null);
              } else {
                // Return to Hub
                navigate('/dashboard');
              }
            }}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-white text-xs font-bold uppercase tracking-widest transition"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
            {selectedType ? 'Back to Types' : selectedChapter ? 'Back to Chapters' : 'Dashboard'}
          </button>
        </div>

        <div className="absolute bottom-10 left-8 right-8 z-10">
          <p className="text-brand-orange text-xs font-black uppercase tracking-widest mb-1">
            Class {classLvl}
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-sm">
            {subjectName}
          </h1>
          {selectedChapter && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
              <h2 className={`text-sm sm:text-lg font-bold truncate ${selectedType ? 'text-slate-400' : 'text-slate-200'}`}>
                {selectedChapter}
              </h2>
              {selectedType && (
                <>
                  <ChevronLeft size={14} className="text-brand-orange rotate-180 mx-1" />
                  <h3 className="text-sm sm:text-lg font-bold text-slate-200">
                    {selectedType === 'live' ? 'Live Tests' : 'Practice Tests'}
                  </h3>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 relative z-20">

        {/* LEVEL 1: CHAPTER FOLDERS */}
        {!selectedChapter && (
          <div className="space-y-6">
            {/* Special ROOT Folders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {specialFolders.map((chap) => {
                const chapData = subjectData[chap] || { live: [], practice: [] };
                const totalTests = chapData.live.length + chapData.practice.length;

                return (
                  <button
                    key={chap}
                    onClick={() => {
                      setSelectedChapter(chap);
                      setSelectedType(null);
                    }}
                    className="group relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-brand-orange to-[#e86a1a] p-5 text-left transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(255,87,34,0.3)] hover:shadow-[0_8px_30px_-4px_rgba(255,87,34,0.4)] hover:-translate-y-1"
                  >
                    <div className="absolute top-0 right-0 p-5 opacity-10 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-500 text-white">
                      <FolderOpen size={80} />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 border border-white/10 text-white shrink-0">
                          <FolderOpen size={18} strokeWidth={2.5} />
                        </div>
                        <div className="text-[10px] font-black text-white/70 uppercase tracking-widest bg-black/10 px-2 py-0.5 rounded">
                          Root Folder
                        </div>
                      </div>
                      <div>
                        <h3 className="text-[16px] font-black text-white leading-snug line-clamp-2 mb-2 drop-shadow-sm">
                          {chap}
                        </h3>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-white/10 border-white/20 text-white">
                          <FileText size={12} strokeWidth={2.5} />
                          {totalTests} Items
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Standard Syllabus Chapters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {syllabusChapters.map((chap, idx) => {
                const chapData = subjectData[chap] || { live: [], practice: [] };
                const totalTests = chapData.live.length + chapData.practice.length;
                const hasTests = totalTests > 0;

                return (
                  <button
                    key={chap}
                    onClick={() => {
                      setSelectedChapter(chap);
                      setSelectedType(null);
                    }}
                    className={`group relative overflow-hidden rounded-[1.5rem] bg-white border p-5 text-left transition-all duration-300 ${hasTests
                      ? 'border-brand-orange/20 shadow-[0_4px_20px_-4px_rgba(255,87,34,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(255,87,34,0.15)] hover:border-brand-orange/40 hover:-translate-y-1'
                      : 'border-slate-200 shadow-sm opacity-70 hover:opacity-100 hover:border-slate-300'
                      }`}
                  >
                    <div className="absolute top-0 right-0 p-5 opacity-5 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-500">
                      <FolderOpen size={80} />
                    </div>

                    <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-brand-orange/10 group-hover:text-brand-orange transition shrink-0">
                          <FolderOpen size={18} strokeWidth={2.5} />
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Ch {idx + 1}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold text-slate-800 leading-snug line-clamp-2 mb-2 group-hover:text-brand-orange transition">
                          {chap}
                        </h3>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${hasTests
                          ? 'bg-orange-50 border-orange-200 text-brand-orange'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}>
                          <FolderOpen size={12} strokeWidth={2.5} />
                          2 Inner Folders
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* LEVEL 2: LIVE & PRACTICE FOLDERS */}
        {selectedChapter && !selectedType && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Live Tests Folder */}
            <button
              onClick={() => setSelectedType('live')}
              className="group relative overflow-hidden rounded-[1.5rem] bg-white border border-[#e86a1a]/30 p-6 text-left transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(232,106,26,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(232,106,26,0.15)] hover:border-[#e86a1a]/50 hover:-translate-y-1"
            >
              <div className="absolute top-0 right-0 p-5 opacity-5 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-500 text-[#e86a1a]">
                <FolderOpen size={80} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 text-[#e86a1a] group-hover:bg-[#e86a1a] group-hover:text-white transition shrink-0 mb-4">
                  <FolderOpen size={20} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-black text-slate-800 leading-snug mb-1">
                  Live Tests
                </h3>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                  Strict Time Limits & Rankings
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-orange-50 border-orange-200 text-[#e86a1a]">
                  <FileText size={12} strokeWidth={2.5} />
                  {subjectData[selectedChapter]?.live?.length || 0} Tests
                </div>
              </div>
            </button>

            {/* Practice Tests Folder */}
            <button
              onClick={() => setSelectedType('practice')}
              className="group relative overflow-hidden rounded-[1.5rem] bg-white border border-slate-300 p-6 text-left transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-400 hover:-translate-y-1"
            >
              <div className="absolute top-0 right-0 p-5 opacity-5 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-500 text-slate-600">
                <FolderOpen size={80} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 group-hover:bg-slate-700 group-hover:text-white transition shrink-0 mb-4">
                  <FolderOpen size={20} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-black text-slate-800 leading-snug mb-1">
                  Practice Tests
                </h3>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                  Unlimited Attempts for Mastery
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-slate-50 border-slate-200 text-slate-500">
                  <FileText size={12} strokeWidth={2.5} />
                  {subjectData[selectedChapter]?.practice?.length || 0} Tests
                </div>
              </div>
            </button>
          </div>
        )}

        {/* LEVEL 3: TESTS LIST / COMING SOON */}
        {selectedChapter && selectedType && (
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] p-4 sm:p-8">
            {selectedType === 'practice' ? (
              <div className="py-12 flex flex-col items-center text-center max-w-sm mx-auto">
                <div className="relative mb-8">
                  {/* Premium Animated Icon */}
                  <motion.div
                    animate={{
                      y: [0, -15, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500/10 to-purple-500/20 flex items-center justify-center text-indigo-600 relative z-10"
                  >
                    <FileText size={42} strokeWidth={1.5} />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl -z-10"
                  />
                </div>

                <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
                  Coming Soon!
                </h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8">
                  We're curating the best practice materials to help you master {selectedChapter}. Stay tuned!
                </p>

                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Under Construction</span>
                </div>
              </div>
            ) : (!subjectData[selectedChapter] || subjectData[selectedChapter].live.length === 0) ? (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                  <FileText size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-1">No Tests Found</h3>
                <p className="text-sm font-medium text-slate-400">There are no live tests inside this folder yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subjectData[selectedChapter].live.map(t => (
                  <TestCard key={t._id} test={t} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TestCard({ test }: { test: TestItem }) {
  const isPractice = test.mode === 'practice' || test.testType === 'practice';
  // Smart routing: if live and attempted, go to result. 
  // If practice, go to test details even if attempted (to allow re-take).
  const targetRoute = (test.hasAttempted && !isPractice) ? `/attempts/${test.latestAttemptId}` : `/tests/${test._id}/start`;

  return (
    <Link
      to={targetRoute}
      className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md ${test.hasAttempted ? 'hover:border-emerald-500/30 hover:bg-emerald-500/5' : 'hover:border-[#ff5722]/30 hover:bg-[#ff5722]/5'
        }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1.5">
          {isPractice ? (
            <span className="shrink-0 rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-slate-600">Practice</span>
          ) : (
            <span className="shrink-0 rounded bg-orange-100 border border-orange-200 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-orange-700">Live</span>
          )}
          {test.hasAttempted && (
            <span className="shrink-0 rounded bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-700">Attempted</span>
          )}
          <div className={`font-bold text-sm sm:text-base truncate transition-colors ${test.hasAttempted ? 'text-slate-800 group-hover:text-emerald-600' : 'text-slate-800 group-hover:text-brand-orange'
            }`}>
            {test.title}
          </div>
        </div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
          {!isPractice ? (
            <>
              <span className="text-[#e86a1a]">Ends {formatDateTime(test.endTime)}</span>
              <span>•</span>
              <span>{test.duration} min</span>
            </>
          ) : (
            <>
              <span>Available 24/7</span>
              <span>•</span>
              <span>{test.duration} min</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0 mt-1 sm:mt-0 border-slate-100">
        <div className="text-left sm:text-right">
          <div className="text-sm font-black tabular-nums text-slate-800">{test.totalMarks} <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">pts</span></div>
        </div>
        <div className={`flex h-9 px-3 items-center justify-center rounded-xl border transition shadow-sm ${test.hasAttempted
          ? 'bg-emerald-50 border-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-white'
          : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-brand-orange group-hover:border-brand-orange group-hover:text-white'
          }`}>
          <span className="text-[10px] font-black uppercase tracking-widest mr-1">
            {test.hasAttempted ? 'View Result' : 'Start'}
          </span>
          <ArrowRight size={14} strokeWidth={2.5} />
        </div>
      </div>
    </Link>
  );
}
