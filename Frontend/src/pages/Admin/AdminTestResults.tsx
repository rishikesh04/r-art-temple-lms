import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { 
  BarChart3, 
  Search, 
  Filter, 
  ChevronRight, 
  ArrowLeft,
  Trophy,
  Users,
  Calendar,
  Clock,
  ChevronDown,
  Medal,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface Test {
  _id: string;
  title: string;
  subject: string;
  classLevel: string;
  startTime: string;
  totalMarks: number;
}

interface LeaderboardEntry {
  rank: number;
  studentName: string;
  score: number;
  percentage: number;
  timeTaken: number;
  submittedAt: string;
}

export default function AdminTestResults() {
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [testDetails, setTestDetails] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLeaderboard, setSearchLeaderboard] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const classes = ['6', '7', '8', '9', '10', '11', '12'];

  const location = useLocation();

  useEffect(() => {
    const handleMount = async () => {
      await fetchTests();
      const stateId = (location.state as any)?.selectedTestId;
      if (stateId) {
        fetchLeaderboard(stateId);
      }
    };
    handleMount();
  }, [selectedClass]);

  const fetchTests = async () => {
    setIsLoading(true);
    try {
      let endpoint = '/tests';
      if (selectedClass) endpoint += `?classLevel=${selectedClass}`;
      const res = await axiosInstance.get(endpoint);
      setTests(res.data.tests || []);
    } catch (error) {
      console.error('Failed to fetch tests');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaderboard = async (testId: string) => {
    setSelectedTest(testId);
    setIsLeaderboardLoading(true);
    try {
      const res = await axiosInstance.get(`/leaderboard/test/${testId}`);
      setLeaderboard(res.data.leaderboard || []);
      setTestDetails(res.data.test || null);
    } catch (error) {
      console.error('Failed to fetch leaderboard');
    } finally {
      setIsLeaderboardLoading(false);
    }
  };

  const filteredTests = tests.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLeaderboard = leaderboard.filter(l => 
    l.studentName.toLowerCase().includes(searchLeaderboard.toLowerCase())
  );

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec}s`;
  };

  if (selectedTest) {
    return (
      <div className="space-y-8 pb-10">
        {/* Leaderboard Header */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedTest(null)}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight">{testDetails?.title || 'Test Results'}</h1>
              <p className="text-slate-500 font-medium">Performance leaderboard and individual marks.</p>
            </div>
          </div>
          
          {testDetails && (
            <div className="flex gap-2">
              <span className="px-3 py-1.5 bg-orange-50 text-brand-orange text-[10px] font-black uppercase tracking-widest rounded-lg">
                Class {testDetails.classLevel}
              </span>
              <span className="px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                {testDetails.subject}
              </span>
            </div>
          )}
        </section>

        {isLeaderboardLoading ? (
          <div className="h-96 w-full bg-white rounded-[40px] border border-slate-100 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-brand-orange rounded-full animate-spin" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Generating Rankings...</p>
            </div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="h-96 w-full bg-white rounded-[40px] border border-slate-100 border-dashed flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 mb-6">
              <Users size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">No Attempts Recorded</h2>
            <p className="text-slate-500 max-w-sm mt-2">Students haven't participated in this test yet or submissions are processing.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Podium */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-10">
               {/* 2nd Place */}
               {leaderboard.length > 1 && leaderboard[1] && (
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm text-center relative order-2 md:order-1"
                 >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 shadow-lg">
                      <Medal size={24} />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Silver</p>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{leaderboard[1]?.studentName || 'Participant'}</h3>
                    <p className="text-3xl font-black text-slate-900 mb-4">{leaderboard[1]?.score || 0}/{testDetails?.totalMarks}</p>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400" style={{ width: `${leaderboard[1]?.percentage || 0}%` }} />
                    </div>
                 </motion.div>
               )}

               {/* 1st Place */}
               {leaderboard.length > 0 && leaderboard[0] && (
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 p-10 rounded-[48px] shadow-2xl shadow-slate-200 text-center relative order-1 md:order-2 md:scale-110 z-10"
                 >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-brand-orange rounded-full flex items-center justify-center text-white shadow-xl ring-8 ring-white">
                      <Trophy size={32} />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-orange-400/80 mb-4">Champion</p>
                    <h3 className="text-2xl font-bold text-white mb-2">{leaderboard[0]?.studentName || 'Participant'}</h3>
                    <p className="text-5xl font-black text-white mb-6 underline decoration-brand-orange underline-offset-[12px]">{leaderboard[0]?.score || 0}/{testDetails?.totalMarks}</p>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mt-4">
                      <div className="h-full bg-brand-orange" style={{ width: `${leaderboard[0]?.percentage || 0}%` }} />
                    </div>
                 </motion.div>
               )}

               {/* 3rd Place */}
               {leaderboard.length > 2 && leaderboard[2] && (
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm text-center relative order-3"
                 >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 shadow-lg">
                      <Award size={24} />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Bronze</p>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{leaderboard[2]?.studentName || 'Participant'}</h3>
                    <p className="text-3xl font-black text-slate-900 mb-4">{leaderboard[2]?.score || 0}/{testDetails?.totalMarks}</p>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500/50" style={{ width: `${leaderboard[2]?.percentage || 0}%` }} />
                    </div>
                 </motion.div>
               )}
            </section>

            {/* Detailed Table */}
            <section className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
               <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div>
                   <h2 className="text-xl font-bold text-slate-900">Complete Rankings</h2>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{leaderboard.length} Participants Analyzed</p>
                 </div>
                 <div className="relative group min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-orange transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="Find a student..."
                      value={searchLeaderboard}
                      onChange={(e) => setSearchLeaderboard(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-orange/20 transition-all font-medium text-sm"
                    />
                 </div>
               </div>

               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/30">
                       <th className="px-8 py-4">Rank</th>
                       <th className="px-8 py-4">Student</th>
                       <th className="px-8 py-4">Score</th>
                       <th className="px-8 py-4">Accuracy</th>
                       <th className="px-8 py-4">Duration</th>
                       <th className="px-8 py-4 text-right">Submitted</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {filteredLeaderboard.map((entry) => (
                       <tr key={entry.studentName + entry.submittedAt} className="hover:bg-slate-50/50 transition-colors">
                         <td className="px-8 py-6">
                            <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${entry.rank <= 3 ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}>
                              {entry.rank}
                            </span>
                         </td>
                         <td className="px-8 py-6">
                            <span className="font-bold text-slate-900">{entry.studentName}</span>
                         </td>
                         <td className="px-8 py-6">
                            <span className="font-black text-slate-900">{entry.score}</span>
                            <span className="text-slate-400 text-xs ml-1">/ {testDetails?.totalMarks}</span>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-sm text-slate-700">{entry.percentage}%</span>
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full ${entry.percentage >= 75 ? 'bg-emerald-500' : entry.percentage >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${entry.percentage}%` }} />
                              </div>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-2 text-slate-500">
                               <Clock size={14} />
                               <span className="text-xs font-medium">{formatTime(entry.timeTaken)}</span>
                            </div>
                         </td>
                         <td className="px-8 py-6 text-right">
                            <span className="text-xs font-medium text-slate-400">
                              {entry?.submittedAt ? new Date(entry.submittedAt).toLocaleDateString() : '—'}
                            </span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </section>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* List Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-2">Test Insights</h1>
          <p className="text-slate-500 font-medium">Analyze test performance, average scores, and rankings.</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-[32px] flex items-center gap-3 shadow-sm">
           <div className="p-3 bg-orange-50 text-brand-orange rounded-2xl">
             <BarChart3 size={24} />
           </div>
           <div>
             <p className="text-2xl font-bold text-slate-900 leading-none">{tests.length}</p>
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Exams</p>
           </div>
        </div>
      </section>

      {/* Control Bar */}
      <section className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-orange transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search test by title or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[24px] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-brand-orange transition-all font-medium text-slate-900"
          />
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-3 px-6 py-4 rounded-[24px] border border-slate-200 bg-white font-bold text-slate-700 transition-all ${selectedClass ? 'border-brand-orange bg-orange-50 text-brand-orange' : 'hover:bg-slate-50'}`}
          >
            <Filter size={18} />
            <span>{selectedClass ? `Class ${selectedClass}` : 'Filter Class'}</span>
            <ChevronDown size={16} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-[24px] shadow-2xl p-2 z-20 space-y-1"
                >
                  <button 
                    onClick={() => { setSelectedClass(''); setIsFilterOpen(false); }}
                    className={`w-full p-3 text-left rounded-xl transition-colors font-bold text-sm ${!selectedClass ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                  >
                    All Classes
                  </button>
                  <div className="h-px bg-slate-100 my-1 mx-2" />
                  {classes.map(c => (
                    <button 
                      key={c}
                      onClick={() => { setSelectedClass(c); setIsFilterOpen(false); }}
                      className={`w-full p-3 text-left rounded-xl transition-colors font-bold text-sm ${selectedClass === c ? 'bg-brand-orange text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                    >
                      Class {c}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Tests Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="h-64 bg-white rounded-[40px] border border-slate-100" />
           ))}
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="bg-white rounded-[40px] p-20 border border-slate-100 border-dashed text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6">
            <BarChart3 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzable Tests Not Found</h2>
          <p className="text-slate-500 max-w-sm mx-auto">Either no tests exist for this criteria or they have no submissions yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredTests.map((test, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                key={test._id} 
                className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col relative overflow-hidden"
              >
                 <div className="absolute -right-6 -top-6 p-12 bg-slate-50 rounded-full group-hover:bg-brand-orange/10 transition-colors" />
                 
                 <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                       <span className="px-2.5 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                        {test.subject}
                       </span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                         Class {test.classLevel}
                       </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-6 group-hover:text-brand-orange transition-colors">{test.title}</h3>

                    <div className="space-y-3 mb-8">
                       <div className="flex items-center gap-3 text-slate-500">
                          <Calendar size={16} />
                          <span className="text-xs font-medium">{new Date(test.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                       </div>
                       <div className="flex items-center gap-3 text-slate-500">
                          <Trophy size={16} />
                          <span className="text-xs font-medium">{test.totalMarks} Points Cap</span>
                       </div>
                    </div>

                    <button 
                       onClick={() => fetchLeaderboard(test._id)}
                       className="mt-auto w-full flex items-center justify-between p-4 bg-slate-50 group-hover:bg-slate-900 group-hover:text-white rounded-2xl transition-all"
                    >
                       <span className="font-bold text-sm">See Leaderboard</span>
                       <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                 </div>
              </motion.div>
           ))}
        </div>
      )}
    </div>
  );
}
