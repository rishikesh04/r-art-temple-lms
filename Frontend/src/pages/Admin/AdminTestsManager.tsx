import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { getApiMessage } from '../../utils/apiMessage';
import { 
  FilePlus, 
  Search, 
  Settings, 
  Trash2, 
  Eye, 
  EyeOff,
  Calendar,
  Clock,
  CheckCircle2,
  Database,
  ArrowRight,
  MoreVertical,
  Plus,
  X,
  FileText,
  Check,
  Edit3,
  ChevronDown,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TestItem = {
  _id: string;
  title: string;
  classLevel: string;
  subject: string;
  chapter?: string;
  duration: number;
  totalMarks: number;
  startTime: string;
  endTime: string;
  status: 'draft' | 'published' | string;
};

type QuestionItem = {
  _id: string;
  questionText: string;
  classLevel: string;
  subject: string;
  chapter?: string;
  difficulty?: string;
};

type CreateTestPayload = {
  title: string;
  description: string;
  classLevel: string;
  subject: string;
  chapter: string;
  questions: string[];
  duration: number;
  totalMarks: number;
  startTime: string;
  endTime: string;
  status: 'draft' | 'published';
};

const INITIAL_FORM: CreateTestPayload = {
  title: '',
  description: '',
  classLevel: '10',
  subject: 'Math',
  chapter: '',
  questions: [],
  duration: 30,
  totalMarks: 0,
  startTime: '',
  endTime: '',
  status: 'draft',
};

export default function AdminTestsManager() {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [form, setForm] = useState<CreateTestPayload>(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [questionSearch, setQuestionSearch] = useState('');
  const [isBusyId, setIsBusyId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedTest, setSelectedTest] = useState<TestItem | null>(null);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [testsRes, questionsRes] = await Promise.all([
        axiosInstance.get('/tests'),
        axiosInstance.get('/questions'),
      ]);
      setTests((testsRes.data.tests || []) as TestItem[]);
      setQuestions((questionsRes.data.questions || []) as QuestionItem[]);
    } catch (err) {
      setError('System refresh failed.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const matchesSearch = !search || test.title.toLowerCase().includes(search.toLowerCase());
      const matchesClass = !filterClass || test.classLevel === filterClass;
      return matchesSearch && matchesClass;
    });
  }, [tests, search, filterClass]);

  const filteredQuestions = useMemo(() => {
    const q = questionSearch.trim().toLowerCase();
    return questions
      .filter(item => item.classLevel === form.classLevel && item.subject === form.subject)
      .filter(item => (form.chapter ? (item.chapter || '') === form.chapter : true))
      .filter(item => (q ? item.questionText.toLowerCase().includes(q) : true))
      .slice(0, 50);
  }, [questions, form.classLevel, form.subject, form.chapter, questionSearch]);

  const chapters = useMemo(() => {
    const set = new Set(questions.filter(q => q.classLevel === form.classLevel && q.subject === form.subject).map(q => (q.chapter || '').trim()).filter(Boolean));
    return Array.from(set).sort();
  }, [questions, form.classLevel, form.subject]);

  const toggleQuestion = (id: string) => {
    setForm(p => {
      const exists = p.questions.includes(id);
      const next = exists ? p.questions.filter(qid => qid !== id) : [...p.questions, id];
      return { ...p, questions: next, totalMarks: next.length };
    });
  };

  const handleStartTimeChange = (v: string) => {
    setForm(p => {
      const updated = { ...p, startTime: v };
      if (updated.startTime && updated.duration) {
        const d = new Date(updated.startTime);
        d.setMinutes(d.getMinutes() + Number(updated.duration));
        updated.endTime = toDateTimeLocal(d.toISOString());
      }
      return updated;
    });
  };

  const startCreate = () => {
    setForm(INITIAL_FORM);
    setEditId(null);
    setView('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEdit = (test: TestItem) => {
    // Note: We need the full test data which includes description and questions array of IDs
    // Since the list might only have basic info, we might need a fetch or just be lucky
    // Assuming the /tests endpoint returns full test objects as defined in CreateTestPayload
    // However, TestItem type at top is missing 'questions' (array of strings) and 'description'
    // I will adjust TestItem and then implement startEdit properly
    setIsBusyId(test._id);
    axiosInstance.get(`/tests/${test._id}`)
      .then(res => {
        const full = res.data.test;
        setForm({
          title: full.title,
          description: full.description || '',
          classLevel: full.classLevel,
          subject: full.subject,
          chapter: full.chapter || '',
          questions: full.questions || [],
          duration: full.duration,
          totalMarks: full.totalMarks,
          startTime: toDateTimeLocal(full.startTime),
          endTime: toDateTimeLocal(full.endTime),
          status: full.status,
        });
        setEditId(test._id);
        setView('edit');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(() => setError('Failed to pull test sequence.'))
      .finally(() => setIsBusyId(null));
  };

  const onCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const payload = {
        ...form,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
      };
      if (editId) {
        await axiosInstance.patch(`/tests/${editId}`, payload);
        setSuccess('Examination protocol updated.');
      } else {
        await axiosInstance.post('/tests', payload);
        setSuccess('Examination protocol initialized.');
      }
      setForm(p => ({ ...INITIAL_FORM, classLevel: p.classLevel, subject: p.subject }));
      setView('list');
      await loadData();
    } catch (err) {
      setError('Operation failed.');
    } finally {
      setIsCreating(false);
    }
  };

  const onQuickToggleStatus = async (test: TestItem) => {
    setIsBusyId(test._id);
    try {
      const next = test.status === 'published' ? 'draft' : 'published';
      await axiosInstance.patch(`/tests/${test._id}`, { status: next });
      await loadData();
    } catch (err) {
      setError('Status update failed.');
    } finally {
      setIsBusyId(null);
    }
  };

  const onDeleteTest = async (id: string) => {
    if (!window.confirm('Dissolve this examination?')) return;
    setIsBusyId(id);
    try {
      await axiosInstance.delete(`/tests/${id}`);
      await loadData();
    } catch (err) {
      setError('Dissolution failed.');
    } finally {
      setIsBusyId(null);
    }
  };

  return (
    <div className="space-y-8 min-h-screen">
      
      {/* Dynamic Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             {(view !== 'list') && (
               <button 
                onClick={() => setView('list')}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all active:scale-90"
               >
                 <X size={24} />
               </button>
             )}
             <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Examination Hub</h1>
          </div>
          <p className="text-slate-500 font-medium ml-1">
            {view === 'list' ? 'Coordinate test schedules and content selection.' : 
             view === 'create' ? 'Initialize a new examination protocol.' : 'Modify existing protocol parameters.'}
          </p>
        </div>
        
        {view === 'list' && (
          <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
            <button 
              onClick={startCreate}
              className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 font-bold text-xs"
              title="Compose New Test"
            >
              <Plus size={18} />
              <span className="hidden md:inline">Manual Create</span>
            </button>
          </div>
        )}
      </section>

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-8"
          >
            {/* Search & Filter Strip */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-12 lg:col-span-8 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" placeholder="Search test protocol title..." 
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[28px] focus:ring-4 focus:ring-orange-500/10 focus:border-brand-orange transition-all font-medium"
                />
              </div>
              <div className="md:col-span-12 lg:col-span-4 relative">
                <div 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`flex items-center justify-between px-6 py-4 bg-white border rounded-[28px] cursor-pointer transition-all ${filterClass ? 'border-brand-orange bg-orange-50/30' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="flex items-center gap-3">
                    <Filter size={18} className={filterClass ? 'text-brand-orange' : 'text-slate-400'} />
                    <span className={`text-sm font-bold ${filterClass ? 'text-brand-orange' : 'text-slate-500'}`}>
                      {filterClass ? `Class ${filterClass}` : 'All Classes'}
                    </span>
                  </div>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
                </div>

                <AnimatePresence>
                  {isFilterOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setIsFilterOpen(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-[28px] shadow-2xl p-2 z-30 grid grid-cols-2 gap-1"
                      >
                        <button 
                          onClick={() => { setFilterClass(''); setIsFilterOpen(false); }}
                          className={`col-span-2 px-4 py-3 text-left rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${!filterClass ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-500'}`}
                        >
                          All Classes
                        </button>
                        {['6','7','8','9','10'].map(c => (
                          <button 
                            key={c}
                            onClick={() => { setFilterClass(c); setIsFilterOpen(false); }}
                            className={`px-4 py-3 text-left rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${filterClass === c ? 'bg-brand-orange text-white' : 'hover:bg-slate-50 text-slate-500'}`}
                          >
                            Class {c}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Test Feed */}
            {isLoading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-white rounded-[40px] border border-slate-100" />)}
               </div>
            ) : filteredTests.length === 0 ? (
               <div className="py-24 text-center bg-white rounded-[50px] border border-slate-100 border-dashed">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-6"><FileText size={40} /></div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">No Protocols Registered</h3>
                  <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm">Clear your search parameters or initialize a new examination protocol.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.map((test, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    key={test._id} 
                    onClick={() => setSelectedTest(test)}
                    className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group relative overflow-hidden cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`px-2 py-0.5 text-[7px] font-black uppercase tracking-widest rounded-md ${test.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {test.status}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[7px] font-black uppercase tracking-widest rounded-md">{test.subject}</span>
                        <span className="px-2 py-0.5 bg-orange-50 text-brand-orange text-[7px] font-black uppercase tracking-widest rounded-md">Class {test.classLevel}</span>
                      </div>
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => onQuickToggleStatus(test)} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all">
                          {test.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button onClick={() => startEdit(test)} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"><Edit3 size={14} /></button>
                        <button onClick={() => onDeleteTest(test._id)} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    
                    <h3 className="text-sm font-bold text-slate-800 leading-snug mb-4 line-clamp-2" title={test?.title || ''}>
                      {test?.title || 'Examination Protocol'}
                    </h3>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-slate-400">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} />
                          <span>{test.duration} MINS</span>
                        </div>
                        <div className="w-px h-3 bg-slate-100" />
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={12} />
                          <span>{test.totalMarks} MARKS</span>
                        </div>
                      </div>
                      <div className="w-7 h-7 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-lg shadow-slate-200">
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="editor"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto w-full"
          >
             <div className="bg-white rounded-[50px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                   <div>
                     <h2 className="text-2xl font-black text-slate-900">{editId ? 'Edit Protocol' : 'Manual Setup'}</h2>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Examination Hub</p>
                   </div>
                   <button onClick={() => setView('list')} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm transition-all active:scale-95">
                      <X size={20} />
                   </button>
                </div>

                <form onSubmit={onCreateTest} className="p-10 space-y-10">
                   <div className="space-y-6">
                      <Input label="Protocol Title" value={form.title} onChange={v => setForm(p => ({...p, title: v}))} required />
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Select label="Target Class" value={form.classLevel} options={['6','7','8','9','10']} onChange={v => setForm(p => ({...p, classLevel: v, questions: []}))} />
                        <Select label="Domain" value={form.subject} options={['Math','Science']} onChange={v => setForm(p => ({...p, subject: v, questions: []}))} />
                        <Select label="Status" value={form.status} options={['draft','published']} onChange={v => setForm(p => ({...p, status: v as any}))} />
                        <Input label="Duration (min)" type="number" value={String(form.duration)} onChange={v => setForm(p => ({...p, duration: Number(v)}))} required />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Launch Window" type="datetime-local" value={form.startTime} onChange={handleStartTimeChange} required />
                        <Input label="Expiry Window" type="datetime-local" value={form.endTime} onChange={v => setForm(p => ({...p, endTime: v}))} required />
                      </div>

                      {/* Targeted Question Picker */}
                      <div className="pt-8 border-t border-slate-50 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                           <div>
                              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Targeted Content Selection</h4>
                              <p className="text-[10px] font-bold text-brand-orange mt-1">Capturing {form.questions.length} queries • {form.totalMarks} Total Marks</p>
                           </div>
                           <div className="relative w-full md:w-64">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                              <input 
                                type="text" placeholder="Filter bank..." value={questionSearch} onChange={e => setQuestionSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-brand-orange transition-all text-xs font-medium" 
                              />
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                           {filteredQuestions.map(q => {
                             const isSelected = form.questions.includes(q._id);
                             return (
                               <button 
                                 key={q._id} type="button" onClick={() => toggleQuestion(q._id)}
                                 className={`text-left p-4 rounded-2xl border transition-all flex items-start gap-4 ${isSelected ? 'bg-orange-50/50 border-brand-orange/30 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'}`}
                               >
                                 <div className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-all ${isSelected ? 'bg-brand-orange border-brand-orange text-white' : 'border-slate-200 bg-white'}`}>
                                    {isSelected && <Check size={12} />}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                   <p className="text-xs font-bold text-slate-700 leading-relaxed mb-1 capitalize">{q.questionText}</p>
                                   <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{q.chapter || 'GENERAL'} • {q.difficulty}</span>
                                 </div>
                               </button>
                             );
                           })}
                        </div>
                      </div>
                   </div>

                   <div className="flex flex-col md:flex-row gap-4 pt-4">
                      <button 
                        type="submit" disabled={isCreating || form.questions.length === 0}
                        className="flex-1 flex items-center justify-center gap-3 py-5 bg-slate-900 text-white rounded-[28px] font-bold shadow-xl shadow-slate-200 hover:brightness-110 disabled:opacity-50 transition-all uppercase tracking-widest text-xs"
                      >
                        {isCreating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Database size={16} />}
                        {editId ? 'Commit Changes' : 'Initialize Protocol'}
                      </button>
                      <button 
                        type="button" onClick={() => setView('list')}
                        className="py-5 px-10 bg-slate-50 text-slate-500 rounded-[28px] font-bold hover:bg-slate-100 transition-all uppercase tracking-widest text-xs"
                      >
                         Discard
                      </button>
                   </div>
                </form>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Detail Modal */}
      <AnimatePresence>
        {selectedTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedTest(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col font-outfit"
            >
              <div className="p-8 pb-0 flex justify-between items-start">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg ${selectedTest.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {selectedTest.status}
                  </span>
                  <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-lg">{selectedTest.subject}</span>
                  <span className="px-3 py-1 bg-orange-50 text-brand-orange text-[9px] font-black uppercase tracking-widest rounded-lg">Class {selectedTest.classLevel}</span>
                </div>
                <button 
                  onClick={() => setSelectedTest(null)}
                  className="p-2 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 pt-6 overflow-y-auto space-y-8 custom-scrollbar">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Protocol Title</p>
                  <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                    {selectedTest.title}
                  </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-1">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Duration</p>
                    <p className="text-sm font-bold text-slate-900">{selectedTest.duration} MINS</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-1">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Target</p>
                    <p className="text-sm font-bold text-slate-900">{selectedTest.totalMarks} MARKS</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-1 md:col-span-2">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Launch Interval</p>
                    <p className="text-xs font-bold text-slate-900">{new Date(selectedTest.startTime).toLocaleString()} - {new Date(selectedTest.endTime).toLocaleString()}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                        <Database size={20} />
                     </div>
                     <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Repository</p>
                       <p className="text-sm font-bold text-slate-900">Questions Loaded</p>
                     </div>
                   </div>
                   <button 
                    onClick={() => { startEdit(selectedTest); setSelectedTest(null); }}
                    className="px-6 py-3 bg-slate-50 text-slate-900 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-slate-100 transition-all"
                   >
                     Initialize Registry Editor
                   </button>
                </div>
              </div>

              <div className="p-8 pt-0 mt-auto">
                 <button 
                  onClick={() => setSelectedTest(null)}
                  className="w-full py-4 bg-slate-900 text-white rounded-[28px] font-bold text-sm shadow-xl shadow-slate-200 hover:brightness-110 flex items-center justify-center gap-2 transition-all"
                 >
                   Return to Registry
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', required, min }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; min?: number }) {
  return (
    <div className="space-y-1.5 flex-1 w-full">
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      <input 
        type={type} value={value} onChange={e => onChange(e.target.value)} required={required} min={min}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:bg-white focus:border-brand-orange transition-all font-medium text-slate-900 text-sm" 
      />
    </div>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5 flex-1">
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      <select 
        value={value} onChange={e => onChange(e.target.value)} 
        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:bg-white focus:border-brand-orange transition-all font-bold text-slate-900 text-sm appearance-none"
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

function toDateTimeLocal(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
