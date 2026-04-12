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
  Check
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

  const loadData = async () => {
    setIsLoading(true);
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

  const onCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const payload = {
        ...form,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
      };
      await axiosInstance.post('/tests', payload);
      setSuccess('Examination protocol initialized.');
      setForm(p => ({ ...INITIAL_FORM, classLevel: p.classLevel, subject: p.subject }));
      await loadData();
    } catch (err) {
      setError('Initialization failed.');
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
    <div className="space-y-10">
      
      {/* Header */}
      <section>
        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-2">Examination Hub</h1>
        <p className="text-slate-500 font-medium">Coordinate test schedules, content selection and lifecycle status.</p>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Creation Panel */}
        <section className="xl:col-span-5 space-y-6">
           <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden sticky top-24">
             <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Configure Test</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Manual Setup</p>
                </div>
                <div className="p-3 bg-brand-orange text-white rounded-2xl">
                  <FilePlus size={20} />
                </div>
             </div>

             <form onSubmit={onCreateTest} className="p-8 space-y-6">
                <div className="space-y-4">
                  <Input label="Protocol Title" value={form.title} onChange={v => setForm(p => ({...p, title: v}))} required />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Target Class" value={form.classLevel} options={['6','7','8','9','10','11','12']} onChange={v => setForm(p => ({...p, classLevel: v, questions: []}))} />
                    <Select label="Domain" value={form.subject} options={['Math','Science']} onChange={v => setForm(p => ({...p, subject: v, questions: []}))} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Status" value={form.status} options={['draft','published']} onChange={v => setForm(p => ({...p, status: v as any}))} />
                    <Input label="Duration (min)" type="number" value={String(form.duration)} onChange={v => setForm(p => ({...p, duration: Number(v)}))} required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Launch Window" type="datetime-local" value={form.startTime} onChange={handleStartTimeChange} required />
                    <Input label="Expiry Window" type="datetime-local" value={form.endTime} onChange={v => setForm(p => ({...p, endTime: v}))} required />
                  </div>

                  {/* Question Picker */}
                  <div className="pt-4 border-t border-slate-50 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Question Batch ({form.questions.length})</h4>
                      <span className="text-[10px] font-bold text-brand-orange bg-orange-50 px-2 py-0.5 rounded-md">{form.totalMarks} Marks</span>
                    </div>
                    
                    <div className="relative group">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-orange transition-colors" size={14} />
                       <input 
                         type="text" placeholder="Filter bank..." value={questionSearch} onChange={e => setQuestionSearch(e.target.value)}
                         className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-brand-orange transition-all text-xs font-medium" 
                       />
                    </div>

                    <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-50 divide-y divide-slate-50">
                       {filteredQuestions.map(q => {
                         const isSelected = form.questions.includes(q._id);
                         return (
                           <button 
                             key={q._id} type="button" onClick={() => toggleQuestion(q._id)}
                             className={`w-full text-left p-4 transition-all flex items-center gap-4 ${isSelected ? 'bg-orange-50/50' : 'hover:bg-slate-50'}`}
                           >
                             <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isSelected ? 'bg-brand-orange border-brand-orange text-white' : 'border-slate-200 bg-white'}`}>
                                {isSelected && <Check size={12} />}
                             </div>
                             <p className="text-xs font-medium text-slate-700 truncate flex-1">{q.questionText}</p>
                           </button>
                         );
                       })}
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" disabled={isCreating || form.questions.length === 0}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  {isCreating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={18} />}
                  Construct Examination
                </button>
             </form>
           </div>
        </section>

        {/* Existing Grid */}
        <section className="xl:col-span-7 space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Examination Registry</h3>
              <button onClick={loadData} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-orange transition-colors">Refresh Library</button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tests.map((test, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  key={test._id} 
                  className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative"
                >
                  <div className="flex justify-between items-start mb-6">
                     <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${test.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {test.status}
                     </span>
                     <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => onQuickToggleStatus(test)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all" title="Toggle Status">
                          {test.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button onClick={() => onDeleteTest(test._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Dissolve">
                          <Trash2 size={16} />
                        </button>
                     </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-6 truncate" title={test?.title || ''}>{test?.title || 'Test Protocol'}</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Class Target</p>
                        <p className="text-sm font-bold text-slate-700">Level {test.classLevel}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject Area</p>
                        <p className="text-sm font-bold text-slate-700">{test.subject}</p>
                     </div>
                  </div>

                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                     <div className="flex items-center gap-2">
                       <Clock size={12} />
                       <span>{test.duration} MINS</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <CheckCircle2 size={12} />
                       <span>{test.totalMarks} MARKS</span>
                     </div>
                  </div>
                </motion.div>
              ))}
           </div>

           {tests.length === 0 && (
              <div className="py-24 text-center bg-white rounded-[40px] border border-slate-100 border-dashed">
                 <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4">
                   <FileText size={32} />
                 </div>
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">The registry is currently empty.</p>
              </div>
           )}
        </section>
      </div>

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
