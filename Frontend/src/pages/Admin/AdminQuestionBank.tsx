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

  const [activeTab, setActiveTab] = useState<'manage' | 'bulk'>('manage');

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

  // --- BULK LOGIC (Simplified & Polished) ---
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
      setActiveTab('manage');
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
    <div className="space-y-10">
      
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-2">Question Bank</h1>
          <p className="text-slate-500 font-medium">Curate high-performance assessments with structured content.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-fit">
          <button 
            onClick={() => setActiveTab('manage')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'manage' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Manage
          </button>
          <button 
            onClick={() => setActiveTab('bulk')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'bulk' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Bulk Upload
          </button>
        </div>
      </section>

      <AnimatePresence mode="wait">
        {activeTab === 'manage' ? (
          <motion.div 
            key="manage"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-10"
          >
            {/* LEFT: FORM */}
            <div className="xl:col-span-4 space-y-6">
               <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden sticky top-24">
                 <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-slate-900">{editId ? 'Edit Entry' : 'New Question'}</h2>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Editor Component</p>
                    </div>
                    {editId && (
                      <button onClick={resetForm} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition-colors">
                        <X size={18} />
                      </button>
                    )}
                 </div>

                 <form onSubmit={onSubmit} className="p-8 space-y-5">
                    <div className="space-y-4">
                       <TextArea label="Question Content" value={form.questionText} onChange={v => setForm(p => ({...p, questionText: v}))} required />
                       
                       <div className="grid grid-cols-1 gap-3">
                         {form.options.map((opt, i) => (
                           <Input key={i} label={`Option ${i+1}`} value={opt} onChange={v => {
                             const n = [...form.options] as [string, string, string, string];
                             n[i] = v;
                             setForm(p => ({...p, options: n}));
                           }} required />
                         ))}
                       </div>

                       <div className="grid grid-cols-2 gap-3">
                         <Select label="Correct Ans" value={String(form.correctAnswer)} onChange={v => setForm(p => ({...p, correctAnswer: Number(v)}))} options={['0','1','2','3']} labels={['Opt 1','Opt 2','Opt 3','Opt 4']} />
                         <Select label="Difficulty" value={form.difficulty} onChange={v => setForm(p => ({...p, difficulty: v as any}))} options={['easy','medium','hard']} />
                       </div>

                       <div className="grid grid-cols-2 gap-3">
                         <Select label="Class" value={form.classLevel} onChange={v => setForm(p => ({...p, classLevel: v}))} options={['6','7','8','9','10','11','12']} />
                         <Select label="Subject" value={form.subject} onChange={v => setForm(p => ({...p, subject: v as any}))} options={['Math','Science']} />
                       </div>
                       
                       <Input label="Chapter / Topic" value={form.chapter} onChange={v => setForm(p => ({...p, chapter: v}))} required />
                       <TextArea label="Solution / Explanation" value={form.explanation} onChange={v => setForm(p => ({...p, explanation: v}))} />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSaving}
                      className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:brightness-110 disabled:opacity-50 transition-all"
                    >
                      {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
                      {editId ? 'Apply Changes' : 'Initialize Question'}
                    </button>
                 </form>
               </div>
            </div>

            {/* RIGHT: LIST */}
            <div className="xl:col-span-8 space-y-8">
               {/* Filters */}
               <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-1 relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" placeholder="Search by content, chapter or options..." 
                      value={search} onChange={e => setSearch(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 transition-all font-medium"
                    />
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-600 focus:outline-none">
                      <option value="">Classes</option>
                      {['6','7','8','9','10','11','12'].map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                    <button onClick={loadQuestions} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all">
                      <Filter size={20} />
                    </button>
                  </div>
               </div>

               {/* Questions Summary */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {filteredBySearch.map((q, i) => (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                     key={q._id} 
                     className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
                   >
                     <div className="flex justify-between items-start mb-4">
                       <div className="flex gap-2">
                         <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${q.difficulty === 'hard' ? 'bg-rose-50 text-rose-600' : q.difficulty === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                           {q.difficulty}
                         </span>
                         <span className="px-2 py-1 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg">{q.subject}</span>
                         <span className="px-2 py-1 bg-orange-50 text-brand-orange text-[10px] font-black uppercase tracking-widest rounded-lg">Lvl {q.classLevel}</span>
                       </div>
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => startEdit(q)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"><Edit3 size={16} /></button>
                         <button onClick={() => onDelete(q._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                       </div>
                     </div>
                     <h3 className="text-sm font-bold text-slate-900 leading-relaxed mb-4 line-clamp-2" title={q?.questionText || ''}>{q?.questionText || 'Question text missing'}</h3>
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 border-t border-slate-50 pt-4">
                        <Database size={12} />
                        <span>{q.chapter}</span>
                        <span className="ml-auto text-brand-orange font-black">Option {q.correctAnswer + 1}</span>
                     </div>
                   </motion.div>
                 ))}
               </div>

               {filteredBySearch.length === 0 && (
                 <div className="py-20 text-center bg-white rounded-[40px] border border-slate-100 border-dashed">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4"><Database size={32} /></div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No questions matched your search.</p>
                 </div>
               )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="bulk"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
             {!uploadedRawRows.length ? (
               <div className="bg-white rounded-[40px] p-12 border border-slate-100 shadow-sm text-center max-w-4xl mx-auto transition-all">
                  <div className="w-20 h-20 bg-orange-50 text-brand-orange rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <FileUp size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Bulk Repository Upload</h2>
                  <p className="text-slate-500 mb-10 max-w-md mx-auto">Upload Excel or CSV files to batch import hundreds of questions instantly.</p>
                  
                  <label className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold cursor-pointer hover:brightness-110 transition-all shadow-xl shadow-slate-200">
                    <Download size={20} />
                    <span>Select Data File</span>
                    <input type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={e => onBulkFileChange(e.target.files?.[0] || null)} />
                  </label>

                  <div className="mt-12 pt-12 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                     <div className="space-y-4">
                        <h4 className="font-bold text-slate-900 flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500" /> Required Headers</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Your file must include: questionText, option1-4, correctAnswer (0-3), classLevel, subject, chapter.</p>
                     </div>
                     <div className="space-y-4">
                        <h4 className="font-bold text-slate-900 flex items-center gap-2"><AlertCircle size={18} className="text-brand-orange" /> Difficulty Tags</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Use 'easy', 'medium', or 'hard'. Other tags will default to 'easy' during processing.</p>
                     </div>
                  </div>
               </div>
             ) : bulkPreviewRows.length === 0 ? (
                <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm transition-all">
                   <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-50">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">Map Columns</h2>
                        <p className="text-sm text-slate-500">Match your file headers to our question repository fields.</p>
                      </div>
                      <button onClick={() => setUploadedRawRows([])} className="text-xs font-black uppercase text-slate-400 hover:text-red-500 transition-colors">Cancel Upload</button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                      {(Object.keys(mapping) as FieldKey[]).map(key => (
                        <div key={key} className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                          <select 
                            value={mapping[key]}
                            onChange={e => setMapping(p => ({...p, [key]: e.target.value}))}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm text-slate-900 appearance-none focus:ring-4 focus:ring-orange-500/10 transition-all cursor-pointer"
                          >
                            <option value="">Select Header...</option>
                            {uploadedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                        </div>
                      ))}
                   </div>

                   <button 
                    onClick={onPreviewBulk}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:brightness-110 transition-all flex items-center justify-center gap-3"
                   >
                     Initialize Preview
                     <ChevronRight size={18} />
                   </button>
                </div>
             ) : (
                <div className="space-y-6 transition-all">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Rows</p>
                          <p className="text-xl font-black text-slate-900">{bulkPreviewRows.length}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-100" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ready</p>
                          <p className="text-xl font-black text-emerald-500">{bulkPreviewRows.filter(r => r.errors.length === 0).length}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-100" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selected</p>
                          <p className="text-xl font-black text-brand-orange">{selectedRowNos.length}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                         <button 
                          onClick={toggleAllValid}
                          className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                         >
                           {selectedRowNos.length > 0 ? 'Deselect All' : 'Select All Valid'}
                         </button>
                         <button 
                          onClick={onUploadBulk}
                          disabled={isUploadingBulk || selectedRowNos.length === 0}
                          className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-200 hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2"
                         >
                           {isUploadingBulk ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Database size={16} />}
                           Execute Import
                         </button>
                      </div>
                   </div>

                   <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/50">
                              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">No.</th>
                              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Question Content</th>
                              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {bulkPreviewRows.map(row => (
                              <tr key={row.rowNo} className={row.errors.length > 0 ? 'bg-rose-50/30' : ''}>
                                <td className="px-8 py-5 text-sm font-bold text-slate-400">#{row.rowNo}</td>
                                <td className="px-8 py-5 max-w-md">
                                   <div className="text-sm font-bold text-slate-700 line-clamp-1 mb-1">{row.questionText || <span className="text-rose-400 italic">Empty Source</span>}</div>
                                   {row.errors.length > 0 && (
                                     <div className="flex flex-wrap gap-1">
                                       {row.errors.map((err, i) => (
                                         <span key={i} className="px-1.5 py-0.5 bg-rose-100 text-[8px] font-black uppercase text-rose-600 rounded-md ring-1 ring-rose-200">{err}</span>
                                       ))}
                                     </div>
                                   )}
                                </td>
                                <td className="px-8 py-5">
                                   <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${row.errors.length === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                      {row.errors.length === 0 ? 'Verified' : 'Incomplete'}
                                   </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                   <button 
                                    onClick={() => toggleRow(row.rowNo)}
                                    disabled={row.errors.length > 0}
                                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${selectedRowNos.includes(row.rowNo) ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'border-slate-200 bg-white text-transparent disabled:opacity-30'}`}
                                   >
                                     <Check size={12} />
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
                      className="w-full py-4 text-slate-400 font-bold text-sm hover:text-slate-900 transition-colors"
                   >
                     Back to Mapping
                   </button>
                </div>
             )}
          </motion.div>
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
