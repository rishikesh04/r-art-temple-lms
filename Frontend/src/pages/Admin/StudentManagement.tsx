import { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { 
  CheckCircle, 
  XCircle, 
  Mail, 
  Phone, 
  Search, 
  Filter, 
  UserCheck, 
  UserMinus,
  ArrowUpDown,
  MoreVertical,
  ChevronDown,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  classLevel: string;
  status: string;
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const classes = ['6', '7', '8', '9', '10', '11', '12'];

  useEffect(() => {
    fetchStudents();
  }, [activeTab, selectedClass]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      let endpoint = activeTab === 'pending' ? '/admin/students/pending' : '/admin/students';
      
      // Add class filter if selected
      if (selectedClass) {
        endpoint += `${endpoint.includes('?') ? '&' : '?'}classLevel=${selectedClass}`;
      }

      const res = await axiosInstance.get(endpoint);
      const studentData = res.data.data || res.data.students || res.data;

      if (Array.isArray(studentData)) {
        setStudents(studentData);
      } else {
        setStudents([]);
      }
    } catch (error) {
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await axiosInstance.patch(`/admin/students/${id}/${action}`);
      if (activeTab === 'pending') {
        setStudents(prev => prev.filter(s => s._id !== id));
      } else {
        fetchStudents();
      }
    } catch (error) {
      console.error(`Failed to ${action} student`);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-2">Student Registry</h1>
          <p className="text-slate-500 font-medium">Manage enrollment, verification and class assignments.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-fit">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'pending' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Verification <span className="ml-1 text-[10px] opacity-60 bg-white/20 px-1.5 py-0.5 rounded-md">NEW</span>
          </button>
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'all' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
          >
            All Students
          </button>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-orange transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or email..."
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

      {/* Registry Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="h-64 bg-white rounded-[40px] border border-slate-100 shadow-sm" />
           ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white rounded-[40px] p-20 border border-slate-100 border-dashed text-center"
        >
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6">
            <Users size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No Students Found</h2>
          <p className="text-slate-500 max-w-sm mx-auto">We couldn't find any students matching your current filters or search criteria.</p>
          <button 
            onClick={() => { setSelectedClass(''); setSearchQuery(''); }}
            className="mt-8 px-8 py-3 bg-slate-100 hover:bg-slate-200 rounded-full font-bold text-slate-700 transition-colors"
          >
            Clear Filters
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredStudents.map((student, i) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                key={student._id} 
                className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col relative"
              >
                {/* Status Badge */}
                <div className={`absolute top-6 right-6 inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                  ${student.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 
                    student.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}
                >
                  {student.status}
                </div>

                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-6 group-hover:bg-brand-orange group-hover:text-white transition-colors duration-300">
                  <span className="text-xl font-bold">{student.name?.charAt(0) || '?'}</span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-1 truncate" title={student?.name || ''}>{student?.name || 'Unknown Student'}</h3>
                <div className="flex items-center gap-2 mb-6">
                   <span className="px-2.5 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                    Level {student.classLevel}
                   </span>
                   {student.status === 'pending' && (
                     <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">Waiting Approval</span>
                   )}
                </div>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-900 transition-colors">
                    <Mail size={16} className="shrink-0" />
                    <span className="text-sm font-medium truncate">{student.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-900 transition-colors">
                    <Phone size={16} className="shrink-0" />
                    <span className="text-sm font-medium">{student.phone}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center gap-2">
                  {activeTab === 'pending' ? (
                    <>
                      <button 
                        onClick={() => handleAction(student._id, 'approve')}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs shadow-lg shadow-slate-200 hover:brightness-110 transition-all"
                      >
                        <UserCheck size={14} /> Allow Access
                      </button>
                      <button 
                        onClick={() => handleAction(student._id, 'reject')}
                        className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-colors"
                        title="Deny Access"
                      >
                        <UserMinus size={20} />
                      </button>
                    </>
                  ) : (
                    <button 
                      className="w-full py-3 bg-slate-50 text-slate-400 rounded-2xl font-bold text-xs cursor-default flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={14} /> Registered Member
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
}