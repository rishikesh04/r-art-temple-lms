import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  UserPlus,
  Activity,
  Calendar,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface DashboardData {
  stats: {
    totalStudents: number;
    pendingStudents: number;
    totalQuestions: number;
    totalTests: number;
    totalByClass: Record<string, number>;
    pendingByClass: Record<string, number>;
  };
  liveTests: Array<{
    id: string;
    title: string;
    classLevel: string;
    subject: string;
    endTime: string;
    submittedCount: number;
    eligibleCount: number;
  }>;
  recentTests: Array<{
    id: string;
    title: string;
    classLevel: string;
    subject: string;
    startTime: string;
  }>;
  recentStudents: Array<{
    id: string;
    name: string;
    email: string;
    classLevel: string;
    status: string;
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axiosInstance.get('/admin/dashboard');
        setData(response.data.data);
      } catch (err) {
        setError('Failed to load dashboard data. Access restricted.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="flex gap-6">
          <div className="flex-1 h-64 bg-white rounded-[40px] border border-slate-100" />
          <div className="flex-1 h-64 bg-white rounded-[40px] border border-slate-100" />
        </div>
        <div className="h-32 bg-white rounded-[40px] border border-slate-100" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-8 bg-red-50 rounded-[40px] border border-red-100 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mx-auto mb-4">
          <Activity size={32} />
        </div>
        <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
        <p className="text-red-700">{error || 'Something went wrong.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-2">Control Pulse</h1>
          <p className="text-slate-500 font-medium">Real-time platform metrics and academic oversight.</p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Time</span>
            <span className="text-sm font-bold text-slate-900">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm text-brand-orange">
            <Clock size={20} />
          </div>
        </div>
      </section>

      {/* --- TOP STATS (Class Breakdown) --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <StatCard 
          title="Total Student" 
          stats={data.stats.totalByClass} 
          icon={Users} 
          color="bg-brand-orange" 
          link="/admin/students"
        />
        <StatCard 
          title="Pending" 
          stats={data.stats.pendingByClass} 
          icon={Clock} 
          color="bg-amber-500" 
          link="/admin/students?status=pending"
        />
      </section>

      {/* --- LIVE MONITORING --- */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
            Live Stream
            {data.liveTests.length > 0 && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />}
          </h2>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Sessions</span>
        </div>
        
        {data.liveTests.length > 0 ? (
          <div className="space-y-4">
            {data.liveTests.map(test => (
              <motion.div 
                key={test.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="bg-slate-900 rounded-[32px] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-slate-200"
              >
                <div className="flex items-center gap-6 text-center md:text-left">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-brand-orange">
                    <Activity size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{test.title}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Class {test.classLevel} • {test.subject}</p>
                  </div>
                </div>

                <div className="flex-1 max-w-sm w-full space-y-3">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span>Progress</span>
                    <span className="text-brand-orange">{test.submittedCount} / {test.eligibleCount} Submitted</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} animate={{ width: `${(test.submittedCount / (test.eligibleCount || 1)) * 100}%` }}
                      className="h-full bg-brand-orange shadow-[0_0_12px_rgba(255,87,34,0.5)]" 
                    />
                  </div>
                </div>

                <Link 
                  to={`/admin/results`} 
                  className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all shadow-lg"
                >
                  View Live Feed
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[40px] p-10 border border-slate-100 border-dashed text-center">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active test sessions found.</p>
          </div>
        )}
      </section>

      {/* --- VERTICAL FEEDS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Recent Tests */}
        <section className="space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Recent Test</h2>
              <Link to="/admin/tests" className="text-[10px] font-black uppercase tracking-widest text-brand-orange hover:underline">View All</Link>
           </div>
           <div className="space-y-4">
              {data.recentTests.map((test, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  key={test.id}
                  className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-brand-orange transition-colors">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-brand-orange transition-colors">{test.title}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Class {test.classLevel} • {test.subject}</p>
                    </div>
                  </div>
                  <Link to="/admin/results" className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
                    <BarChart3 size={18} />
                  </Link>
                </motion.div>
              ))}
              {data.recentTests.length === 0 && <p className="text-center py-10 text-slate-400 text-sm italic">Registry is empty.</p>}
           </div>
        </section>

        {/* Recent Registration */}
        <section className="space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Recent Registration</h2>
              <Link to="/admin/students" className="text-[10px] font-black uppercase tracking-widest text-brand-orange hover:underline">Auditing Deck</Link>
           </div>
           <div className="space-y-4">
              {data.recentStudents.map((student, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  key={student.id}
                  className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center font-bold text-slate-600">
                      {student.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{student.name}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Class {student.classLevel} • {new Date(student.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest ${student.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {student.status}
                  </span>
                </motion.div>
              ))}
              {data.recentStudents.length === 0 && <p className="text-center py-10 text-slate-400 text-sm italic">No recent registrations.</p>}
           </div>
        </section>

      </div>

    </div>
  );
}

function StatCard({ title, stats, icon: Icon, color, link }: { title: string; stats: Record<string, number>; icon: any; color: string; link: string }) {
  const classes = ['6', '7', '8', '9', '10'];
  return (
    <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Academic Repository</p>
        </div>
        <Link to={link} className={`p-4 rounded-3xl ${color} text-white shadow-lg transition-transform group-hover:scale-110`}>
          <Icon size={24} />
        </Link>
      </div>

      <div className="space-y-4">
        {classes.map(c => (
          <div key={c} className="flex items-center justify-between py-1 px-2 hover:bg-slate-50 rounded-xl transition-colors">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Class {c}</span>
            <span className="text-lg font-black text-slate-900">{stats[c] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}