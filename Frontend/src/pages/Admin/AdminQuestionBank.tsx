import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { getApiMessage } from '../../utils/apiMessage';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  FileUp, 
  CheckCircle2, 
  AlertCircle,
  ChevronDown,
  X,
  Database,
  BookOpen,
  Send,
  Download,
  Check,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type QuestionItem = {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  classLevel: string;
  subject: string;
  chapter: string;
  difficulty: string;
};

type QuestionForm = {
  questionText: string;
  options: [string, string, string, string];
  correctAnswer: number;
  explanation: string;
  classLevel: string;
  subject: 'Math' | 'Science';
  chapter: string;
  difficulty: 'easy' | 'medium' | 'hard';
};

type BulkPreviewRow = {
  rowNo: number;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctAnswerRaw: string;
  correctAnswerParsed: number;
  classLevel: string;
  subject: string;
  chapter: string;
  difficulty: string;
  explanation: string;
  errors: string[];
  parsedQuestion?: QuestionForm;
};

type FieldKey =
  | 'questionText'
  | 'option1'
  | 'option2'
  | 'option3'
  | 'option4'
  | 'correctAnswer'
  | 'classLevel'
  | 'subject'
  | 'chapter'
  | 'difficulty'
  | 'explanation';

type ColumnMapping = Record<FieldKey, string>;

const INITIAL_FORM: QuestionForm = {
  questionText: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  explanation: '',
  classLevel: '10',
  subject: 'Math',
  chapter: '',
  difficulty: 'easy',
};

export default function AdminQuestionBank() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState<QuestionForm>(INITIAL_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(null);
  const [bulkRows, setBulkRows] = useState<QuestionForm[]>([]);
  const [bulkPreviewRows, setBulkPreviewRows] = useState<BulkPreviewRow[]>([]);
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);
  const [isUploadingBulk, setIsUploadingBulk] = useState(false);
  const [selectedRowNos, setSelectedRowNos] = useState<number[]>([]);
  const [uploadedRawRows, setUploadedRawRows] = useState<Record<string, unknown>[]>([]);
  const [uploadedHeaders, setUploadedHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    questionText: '', option1: '', option2: '', option3: '', option4: '',
    correctAnswer: '', classLevel: '', subject: '', chapter: '',
    difficulty: '', explanation: '',
  });

  const [view, setView] = useState<'list' | 'create' | 'edit' | 'bulk'>('list');

  const loadQuestions = async () => {
    setIsLoading(true);
    setError('');
    try {
      const params: Record<string, string> = {};
      if (filterClass) params.classLevel = filterClass;
      if (filterSubject) params.subject = filterSubject;
      if (filterDifficulty) params.difficulty = filterDifficulty;

      const res = await axiosInstance.get('/questions', { params });
      setQuestions((res.data.questions || []) as QuestionItem[]);
    } catch (err) {
      setError(getApiMessage(err, 'Failed to load questions.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [filterClass, filterSubject, filterDifficulty]);

  const filteredBySearch = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return questions;
    return questions.filter(
      (item) =>
        item.questionText.toLowerCase().includes(q) ||
        item.chapter.toLowerCase().includes(q) ||
        item.options.some((o) => o.toLowerCase().includes(q))
    );
  }, [questions, search]);

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditId(null);
    setView('list');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    const payload = {
      ...form,
      options: form.options.map((o) => o.trim()),
      questionText: form.questionText.trim(),
      chapter: form.chapter.trim(),
      explanation: form.explanation.trim(),
    };

    try {
      if (editId) {
        const res = await axiosInstance.patch(`/questions/${editId}`, payload);
        setSuccess(res.data?.message || 'Question updated successfully.');
      } else {
        const res = await axiosInstance.post('/questions', payload);
        setSuccess(res.data?.message || 'Question created successfully.');
      }
      await loadQuestions();
      resetForm();
    } catch (err) {
      setError(getApiMessage(err, 'Failed to save question.'));
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (q: QuestionItem) => {
    setEditId(q._id);
    setForm({
      questionText: q.questionText,
      options: [q.options[0] || '', q.options[1] || '', q.options[2] || '', q.options[3] || ''],
      correctAnswer: q.correctAnswer ?? 0,
      explanation: q.explanation || '',
      classLevel: q.classLevel || '10',
      subject: (q.subject === 'Science' ? 'Science' : 'Math') as 'Math' | 'Science',
      chapter: q.chapter || '',
      difficulty: (q.difficulty === 'hard' || q.difficulty === 'medium' ? q.difficulty : 'easy') as 'easy' | 'medium' | 'hard',
    });
    setView('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (id: string) => {
    if (!window.confirm('Delete this question permanently?')) return;
    setBusyId(id);
    try {
      await axiosInstance.delete(`/questions/${id}`);
      setSuccess('Question deleted successfully.');
      await loadQuestions();
    } catch (err) {
      setError('Failed to delete question.');
    } finally {
      setBusyId(null);
    }
  };

  const suggestMapping = (headers: string[]): ColumnMapping => {
    const p: Record<FieldKey, string[]> = {
      questionText: ['questiontext', 'question', 'qtext', 'ques'],
      option1: ['option1', 'opt1', 'a'], option2: ['option2', 'opt2', 'b'],
      option3: ['option3', 'opt3', 'c'], option4: ['option4', 'opt4', 'd'],
      correctAnswer: ['correctanswer', 'answer', 'ans'],
      classLevel: ['classlevel', 'class', 'grade'],
      subject: ['subject', 'sub'], chapter: ['chapter', 'topic'],
      difficulty: ['difficulty', 'level'], explanation: ['explanation', 'reason'],
    };
    const lookup = headers.map(h => ({ raw: h, key: h.toLowerCase().replace(/[^a-z0-9]/g, '') }));
    const out = {} as ColumnMapping;
    (Object.keys(p) as FieldKey[]).forEach(f => {
      const found = lookup.find(h => p[f].includes(h.key));
      out[f] = found?.raw || '';
    });
    return out;
  };

  const onBulkFileChange = async (file: File | null) => {
    if (!file) return;
    try {
      const XLSX = await import('xlsx');
      const b = await file.arrayBuffer();
      const wb = XLSX.read(b, { type: 'array' });
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[wb.SheetNames[0]], { defval: '' });
      const headers = Array.from(rows.reduce((acc, r) => { Object.keys(r || {}).forEach(k => acc.add(k)); return acc; }, new Set<string>()));
      const mapping = suggestMapping(headers);
      setUploadedRawRows(rows);
      setUploadedHeaders(headers);
      setMapping(mapping);
      setSuccess('File loaded. Verify mapping below.');
    } catch (err) {
      setError('Failed to parse file.');
    }
  };

  const onPreviewBulk = () => {
    const preview: BulkPreviewRow[] = uploadedRawRows.map((raw, idx) => {
      const get = (k: FieldKey) => String(raw[mapping[k]] || '').trim();
      const options: [string, string, string, string] = [get('option1'), get('option2'), get('option3'), get('option4')];
      
      const errors: string[] = [];
      if (!get('questionText')) errors.push('Missing question text');
      if (options.some(o => !o)) errors.push('Missing one or more options');
      
      let ans = parseInt(get('correctAnswer'));
      if (isNaN(ans) || ans < 0 || ans > 3) errors.push('Correct answer must be 0-3');

      const row: BulkPreviewRow = {
        rowNo: idx + 1,
        questionText: get('questionText'),
        option1: options[0], option2: options[1], option3: options[2], option4: options[3],
        correctAnswerRaw: get('correctAnswer'),
        correctAnswerParsed: ans,
        classLevel: get('classLevel') || '10',
        subject: get('subject') || 'Math',
        chapter: get('chapter') || 'General',
        difficulty: get('difficulty').toLowerCase() || 'easy',
        explanation: get('explanation'),
        errors,
      };

      if (errors.length === 0) {
        row.parsedQuestion = {
          questionText: row.questionText,
          options,
          correctAnswer: row.correctAnswerParsed,
          classLevel: row.classLevel,
          subject: (row.subject === 'Science' ? 'Science' : 'Math'),
          chapter: row.chapter,
          difficulty: (row.difficulty === 'hard' || row.difficulty === 'medium' ? row.difficulty : 'easy') as any,
          explanation: row.explanation,
        };
      }
      return row;
    });

    setBulkPreviewRows(preview);
    const validRowNos = preview.filter(r => r.errors.length === 0).map(r => r.rowNo);
    setSelectedRowNos(validRowNos);
    if (validRowNos.length === 0) setError('No valid rows found to select.');
  };

  const onUploadBulk = async () => {
    const toUpload = bulkPreviewRows
      .filter(r => selectedRowNos.includes(r.rowNo) && r.parsedQuestion)
      .map(r => r.parsedQuestion);

    if (toUpload.length === 0) {
      setError('Please select at least one valid row to upload.');
      return;
    }

    setIsUploadingBulk(true);
    setError('');
    setSuccess('');
    try {
      const res = await axiosInstance.post('/questions/bulk', { questions: toUpload });
      setSuccess(`${res.data.count || toUpload.length} questions imported successfully.`);
      setBulkPreviewRows([]);
      setUploadedRawRows([]);
      await loadQuestions();
      setView('list');
    } catch (err) {
      setError(getApiMessage(err, 'Bulk upload failed.'));
    } finally {
      setIsUploadingBulk(false);
    }
  };

  const toggleAllValid = () => {
    const validRowNos = bulkPreviewRows.filter(r => r.errors.length === 0).map(r => r.rowNo);
    if (selectedRowNos.length === validRowNos.length) {
      setSelectedRowNos([]);
    } else {
      setSelectedRowNos(validRowNos);
    }
  };

  const toggleRow = (no: number) => {
    setSelectedRowNos(p => p.includes(no) ? p.filter(n => n !== no) : [...p, no]);
  };

  return (
    <div className="space-y-8 min-h-screen">
      
      {/* Dynamic Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             {(view !== 'list') && (
               <button 
                onClick={resetForm}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all active:scale-90"
               >
                 <X size={24} />
               </button>
             )}
             <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Question Bank</h1>
          </div>
          <p className="text-slate-500 font-medium ml-1">
            {view === 'list' ? 'Curate high-performance assessments.' : 
             view === 'create' ? 'Define a new targeted query.' :
             view === 'edit' ? 'Modify existing repository content.' : 'Batch import from secondary sources.'}
          </p>
        </div>
        
        {view === 'list' && (
          <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
            <button 
              onClick={() => setView('create')}
              className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 font-bold text-xs"
              title="Add New Question"
            >
              <Plus size={18} />
              <span className="hidden md:inline">Manual Create</span>
            </button>
            <div className="w-px h-6 bg-slate-100" />
            <button 
              onClick={() => setView('bulk')}
              className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2 font-bold text-xs"
              title="Bulk Repository Upload"
            >
              <FileUp size={18} />
              <span className="hidden md:inline">Bulk Import</span>
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
                  type="text" placeholder="Search content, chapter or options..." 
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

            {/* Questions Feed */}
            {isLoading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-white rounded-[40px] border border-slate-100" />)}
               </div>
            ) : filteredBySearch.length === 0 ? (
               <div className="py-24 text-center bg-white rounded-[50px] border border-slate-100 border-dashed">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-6"><Database size={40} /></div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">No Results Captured</h3>
                  <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm">Targeted search yields no matches. Clear filters or add new content.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBySearch.map((q, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    key={q._id} 
                    onClick={() => setSelectedQuestion(q)}
                    className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group relative overflow-hidden cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`px-2 py-0.5 text-[7px] font-black uppercase tracking-widest rounded-md ${q.difficulty === 'hard' ? 'bg-rose-50 text-rose-600' : q.difficulty === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {q.difficulty}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[7px] font-black uppercase tracking-widest rounded-md">{q.subject}</span>
                        <span className="px-2 py-0.5 bg-orange-50 text-brand-orange text-[7px] font-black uppercase tracking-widest rounded-md">Class {q.classLevel}</span>
                      </div>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => startEdit(q)} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"><Edit3 size={14} /></button>
                        <button onClick={() => onDelete(q._id)} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    
                    <h3 className="text-sm font-bold text-slate-800 leading-snug mb-4 line-clamp-2" title={q?.questionText || ''}>
                      {q?.questionText || 'Corrupted Record'}
                    </h3>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-3">
                       <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 bg-slate-50 rounded flex items-center justify-center text-slate-300">
                             <Database size={12} />
                          </div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">{q.chapter || 'UNCATEGORIZED'}</p>
                       </div>
                       <div className="px-2.5 py-1 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded-lg shrink-0">
                          Opt {q.correctAnswer + 1}
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (view === 'create' || view === 'edit') ? (
          <motion.div 
            key="editor"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto w-full"
          >
             <div className="bg-white rounded-[50px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                   <div>
                     <h2 className="text-2xl font-black text-slate-900">{editId ? 'Edit Question' : 'Manual Entry'}</h2>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Repository Editor</p>
                   </div>
                   <button onClick={resetForm} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm transition-all active:scale-95">
                      <X size={20} />
                   </button>
                </div>

                <form onSubmit={onSubmit} className="p-10 space-y-8">
                   <div className="space-y-6">
                      <TextArea label="Question Content" value={form.questionText} onChange={v => setForm(p => ({...p, questionText: v}))} required />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {form.options.map((opt, i) => (
                          <Input key={i} label={`Option ${i+1}`} value={opt} onChange={v => {
                            const n = [...form.options] as [string, string, string, string];
                            n[i] = v;
                            setForm(p => ({...p, options: n}));
                          }} required />
                        ))}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Select label="Correct Ans" value={String(form.correctAnswer)} onChange={v => setForm(p => ({...p, correctAnswer: Number(v)}))} options={['0','1','2','3']} labels={['Opt 1','Opt 2','Opt 3','Opt 4']} />
                        <Select label="Difficulty" value={form.difficulty} onChange={v => setForm(p => ({...p, difficulty: v as any}))} options={['easy','medium','hard']} />
                        <Select label="Class" value={form.classLevel} onChange={v => setForm(p => ({...p, classLevel: v}))} options={['6','7','8','9','10']} />
                        <Select label="Subject" value={form.subject} onChange={v => setForm(p => ({...p, subject: v as any}))} options={['Math','Science']} />
                      </div>
                      
                      <div className="grid grid-cols-1 gap-6 pt-4 border-t border-slate-50">
                        <Input label="Chapter / Topic" value={form.chapter} onChange={v => setForm(p => ({...p, chapter: v}))} required />
                        <TextArea label="Solution / Explanation" value={form.explanation} onChange={v => setForm(p => ({...p, explanation: v}))} />
                      </div>
                   </div>

                   <div className="flex flex-col md:flex-row gap-4 pt-4">
                      <button 
                        type="submit" 
                        disabled={isSaving}
                        className="flex-1 flex items-center justify-center gap-3 py-5 bg-slate-900 text-white rounded-[28px] font-bold shadow-xl shadow-slate-200 hover:brightness-110 disabled:opacity-50 transition-all uppercase tracking-widest text-xs"
                      >
                        {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
                        {editId ? 'Commit Changes' : 'Initialize Question'}
                      </button>
                      <button 
                        type="button"
                        onClick={resetForm}
                        className="py-5 px-10 bg-slate-50 text-slate-500 rounded-[28px] font-bold hover:bg-slate-100 transition-all uppercase tracking-widest text-xs"
                      >
                         Discard
                      </button>
                   </div>
                </form>
             </div>
          </motion.div>
        ) : (
          <motion.div 
            key="bulk"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-8 max-w-5xl mx-auto"
          >
             {!uploadedRawRows.length ? (
               <div className="bg-white rounded-[50px] p-16 border border-slate-100 shadow-sm text-center transition-all">
                  <div className="w-24 h-24 bg-orange-50 text-brand-orange rounded-[40px] flex items-center justify-center mx-auto mb-10">
                    <FileUp size={48} strokeWidth={1.5} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Bulk Repository Upload</h2>
                  <p className="text-slate-500 mb-12 max-w-md mx-auto font-medium">Overhaul your question bank by batch importing hundreds of records via Excel or CSV.</p>
                  
                  <label className="inline-flex items-center gap-4 px-10 py-5 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-widest text-xs cursor-pointer hover:brightness-110 transition-all shadow-2xl shadow-slate-200">
                    <Download size={20} />
                    <span>Select Source File</span>
                    <input type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={e => onBulkFileChange(e.target.files?.[0] || null)} />
                  </label>

                  <div className="mt-20 pt-16 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 size={24} className="text-emerald-500" />
                          <h4 className="font-black uppercase tracking-widest text-xs text-slate-900">Required Headers</h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-semibold">Column keys like 'questionText', 'option1-4', and 'correctAnswer' are mapped automatically upon initialization.</p>
                     </div>
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <AlertCircle size={24} className="text-brand-orange" />
                          <h4 className="font-black uppercase tracking-widest text-xs text-slate-900">Parsing Logic</h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-semibold">Row-level verification ensures only high-fidelity records enter the repository. Error logs provided post-scan.</p>
                     </div>
                  </div>
               </div>
             ) : bulkPreviewRows.length === 0 ? (
                <div className="bg-white rounded-[50px] p-12 border border-slate-100 shadow-sm transition-all">
                   <div className="flex items-center justify-between mb-12 pb-8 border-b border-slate-50">
                      <div>
                        <h2 className="text-3xl font-black text-slate-900">Mapping Terminal</h2>
                        <p className="text-sm font-medium text-slate-400 mt-1">Match source headers to internal repository fields.</p>
                      </div>
                      <button onClick={() => setUploadedRawRows([])} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors">Discard Batch</button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                      {(Object.keys(mapping) as FieldKey[]).map(key => (
                        <div key={key} className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                          <select 
                            value={mapping[key]}
                            onChange={e => setMapping(p => ({...p, [key]: e.target.value}))}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm text-slate-900 appearance-none focus:ring-4 focus:ring-orange-500/10 transition-all cursor-pointer"
                          >
                            <option value="">( Unmapped )</option>
                            {uploadedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                        </div>
                      ))}
                   </div>

                   <button 
                    onClick={onPreviewBulk}
                    className="w-full py-5 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-slate-200 hover:brightness-110 transition-all flex items-center justify-center gap-4"
                   >
                     Initialize Verification Scan
                     <ChevronRight size={18} />
                   </button>
                </div>
             ) : (
                <div className="space-y-6 transition-all">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-8">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scan Size</p>
                          <p className="text-3xl font-black text-slate-900">{bulkPreviewRows.length}</p>
                        </div>
                        <div className="w-px h-10 bg-slate-100" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified</p>
                          <p className="text-3xl font-black text-emerald-500">{bulkPreviewRows.filter(r => r.errors.length === 0).length}</p>
                        </div>
                        <div className="w-px h-10 bg-slate-100 hidden sm:block" />
                        <div className="hidden sm:block">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selected</p>
                          <p className="text-3xl font-black text-brand-orange">{selectedRowNos.length}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                         <button 
                          onClick={toggleAllValid}
                          className="px-8 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all"
                         >
                           {selectedRowNos.length > 0 ? 'Deselect' : 'Select All'}
                         </button>
                         <button 
                          onClick={onUploadBulk}
                          disabled={isUploadingBulk || selectedRowNos.length === 0}
                          className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-200 hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-3"
                         >
                           {isUploadingBulk ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Database size={16} />}
                           Execute Import
                         </button>
                      </div>
                   </div>

                   <div className="bg-white rounded-[50px] border border-slate-100 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/50">
                              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Record</th>
                              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Question Abstract</th>
                              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Integrity</th>
                              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Commit</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {bulkPreviewRows.map(row => (
                              <tr key={row.rowNo} className={row.errors.length > 0 ? 'bg-rose-50/30' : 'hover:bg-slate-50/30 transition-colors'}>
                                <td className="px-10 py-6 text-sm font-bold text-slate-400 tracking-tighter">#{row.rowNo.toString().padStart(3, '0')}</td>
                                <td className="px-10 py-6 max-w-md">
                                   <div className="text-sm font-bold text-slate-800 line-clamp-1 mb-1.5">{row.questionText || <span className="text-rose-400 italic font-black text-[10px] uppercase">Data Loss Detected</span>}</div>
                                   {row.errors.length > 0 && (
                                     <div className="flex flex-wrap gap-1.5">
                                       {row.errors.map((err, i) => (
                                         <span key={i} className="px-2 py-0.5 bg-rose-100 text-[8px] font-black uppercase text-rose-600 rounded-md">{err}</span>
                                       ))}
                                     </div>
                                   )}
                                </td>
                                <td className="px-10 py-6">
                                   <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${row.errors.length === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                      {row.errors.length === 0 ? 'Verified' : 'Invalid'}
                                   </span>
                                </td>
                                <td className="px-10 py-6 text-right">
                                   <button 
                                    onClick={() => toggleRow(row.rowNo)}
                                    disabled={row.errors.length > 0}
                                    className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all mx-auto mr-0 ${selectedRowNos.includes(row.rowNo) ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'border-slate-200 bg-white text-transparent disabled:opacity-30'}`}
                                   >
                                     <Check size={14} strokeWidth={4} />
                                   </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                   </div>
                   
                   <button 
                      onClick={() => setBulkPreviewRows([])}
                      className="w-full py-8 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-900 transition-colors"
                   >
                     Back to Mapping Interface
                   </button>
                </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedQuestion(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col font-outfit"
            >
              {/* Modal Header */}
              <div className="p-8 pb-0 flex justify-between items-start">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg ${selectedQuestion.difficulty === 'hard' ? 'bg-rose-50 text-rose-600' : selectedQuestion.difficulty === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {selectedQuestion.difficulty}
                  </span>
                  <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-lg">{selectedQuestion.subject}</span>
                  <span className="px-3 py-1 bg-orange-50 text-brand-orange text-[9px] font-black uppercase tracking-widest rounded-lg">Class {selectedQuestion.classLevel}</span>
                </div>
                <button 
                  onClick={() => setSelectedQuestion(null)}
                  className="p-2 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-8 pt-6 overflow-y-auto space-y-8 custom-scrollbar">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Question Content</p>
                  <h2 className="text-xl font-bold text-slate-900 leading-relaxed">
                    {selectedQuestion.questionText}
                  </h2>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Multiple Choice Options</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedQuestion.options.map((opt, idx) => (
                      <div 
                        key={idx}
                        className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${idx === selectedQuestion.correctAnswer ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-50 bg-slate-50/30'}`}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${idx === selectedQuestion.correctAnswer ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className={`text-sm font-bold ${idx === selectedQuestion.correctAnswer ? 'text-emerald-700' : 'text-slate-600'}`}>
                          {opt}
                        </span>
                        {idx === selectedQuestion.correctAnswer && <Check size={16} className="ml-auto text-emerald-500" />}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedQuestion.explanation && (
                  <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-orange group flex items-center gap-2">
                       <BookOpen size={14} /> Solution / Explanation
                    </p>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                      {selectedQuestion.explanation}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-4 opacity-60">
                  <Database size={16} className="text-slate-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Topic: {selectedQuestion.chapter}</p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-8 pt-0 mt-auto">
                 <button 
                  onClick={() => { startEdit(selectedQuestion); setSelectedQuestion(null); }}
                  className="w-full py-4 bg-slate-900 text-white rounded-[28px] font-bold text-sm shadow-xl shadow-slate-200 hover:brightness-110 flex items-center justify-center gap-2 transition-all"
                 >
                   <Edit3 size={16} /> Edit Question Entry
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


// --- REUSABLE MODERN COMPONENTS ---

function Input({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      <input 
        value={value} onChange={e => onChange(e.target.value)} required={required} 
        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:bg-white focus:border-brand-orange transition-all font-medium text-slate-900 text-sm" 
      />
    </div>
  );
}

function TextArea({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      <textarea 
        value={value} onChange={e => onChange(e.target.value)} required={required} rows={3}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:bg-white focus:border-brand-orange transition-all font-medium text-slate-900 text-sm resize-none" 
      />
    </div>
  );
}

function Select({ label, value, onChange, options, labels }: { label: string; value: string; onChange: (v: string) => void; options: string[]; labels?: string[] }) {
  return (
    <div className="space-y-1.5 flex-1">
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      <select 
        value={value} onChange={e => onChange(e.target.value)} 
        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:bg-white focus:border-brand-orange transition-all font-bold text-slate-900 text-sm appearance-none"
      >
        {options.map((opt, i) => <option key={opt} value={opt}>{labels ? labels[i] : opt}</option>)}
      </select>
    </div>
  );
}
