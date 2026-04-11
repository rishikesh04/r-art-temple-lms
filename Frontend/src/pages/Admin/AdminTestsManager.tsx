import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { getApiMessage } from '../../utils/apiMessage';

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
  totalMarks: 10,
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
  const [editForm, setEditForm] = useState<{
    title: string;
    duration: number;
    totalMarks: number;
    startTime: string;
    endTime: string;
    status: 'draft' | 'published';
  }>({
    title: '',
    duration: 30,
    totalMarks: 10,
    startTime: '',
    endTime: '',
    status: 'draft',
  });

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
      setError(getApiMessage(err, 'Failed to load test manager data.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredQuestions = useMemo(() => {
    const q = questionSearch.trim().toLowerCase();
    return questions
      .filter((item) => item.classLevel === form.classLevel && item.subject === form.subject)
      .filter((item) => (form.chapter ? (item.chapter || '') === form.chapter : true))
      .filter((item) => (q ? item.questionText.toLowerCase().includes(q) : true))
      .slice(0, 60);
  }, [questions, form.classLevel, form.subject, form.chapter, questionSearch]);

  const chapters = useMemo(() => {
    const set = new Set(
      questions
        .filter((q) => q.classLevel === form.classLevel && q.subject === form.subject)
        .map((q) => (q.chapter || '').trim())
        .filter(Boolean)
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [questions, form.classLevel, form.subject]);

  const toggleQuestion = (questionId: string) => {
    setForm((prev) => {
      const exists = prev.questions.includes(questionId);
      return {
        ...prev,
        questions: exists ? prev.questions.filter((id) => id !== questionId) : [...prev.questions, questionId],
      };
    });
  };

  const onCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setIsCreating(true);
      const payload = {
        ...form,
        duration: Number(form.duration),
        totalMarks: Number(form.totalMarks),
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
      };

      const res = await axiosInstance.post('/tests', payload);
      setSuccess(res.data?.message || 'Test created successfully.');
      setForm((prev) => ({
        ...INITIAL_FORM,
        classLevel: prev.classLevel,
        subject: prev.subject,
      }));
      setQuestionSearch('');
      await loadData();
    } catch (err) {
      setError(getApiMessage(err, 'Failed to create test.'));
    } finally {
      setIsCreating(false);
    }
  };

  const onQuickToggleStatus = async (test: TestItem) => {
    setError('');
    setSuccess('');
    setIsBusyId(test._id);
    try {
      const next = test.status === 'published' ? 'draft' : 'published';
      const res = await axiosInstance.patch(`/tests/${test._id}`, { status: next });
      setSuccess(res.data?.message || `Test set to ${next}.`);
      await loadData();
    } catch (err) {
      setError(getApiMessage(err, 'Failed to update test status.'));
    } finally {
      setIsBusyId(null);
    }
  };

  const onDeleteTest = async (test: TestItem) => {
    const yes = window.confirm(`Delete "${test.title}"? This cannot be undone.`);
    if (!yes) return;
    setError('');
    setSuccess('');
    setIsBusyId(test._id);
    try {
      const res = await axiosInstance.delete(`/tests/${test._id}`);
      setSuccess(res.data?.message || 'Test deleted successfully.');
      if (editId === test._id) setEditId(null);
      await loadData();
    } catch (err) {
      setError(getApiMessage(err, 'Failed to delete test.'));
    } finally {
      setIsBusyId(null);
    }
  };

  const startEdit = (t: TestItem) => {
    setEditId(t._id);
    setEditForm({
      title: t.title || '',
      duration: t.duration || 30,
      totalMarks: t.totalMarks || 10,
      startTime: toDateTimeLocal(t.startTime),
      endTime: toDateTimeLocal(t.endTime),
      status: (t.status === 'published' ? 'published' : 'draft') as 'draft' | 'published',
    });
  };

  const onSaveEdit = async (testId: string) => {
    setError('');
    setSuccess('');
    setIsBusyId(testId);
    try {
      const payload = {
        title: editForm.title,
        duration: Number(editForm.duration),
        totalMarks: Number(editForm.totalMarks),
        startTime: new Date(editForm.startTime).toISOString(),
        endTime: new Date(editForm.endTime).toISOString(),
        status: editForm.status,
      };
      const res = await axiosInstance.patch(`/tests/${testId}`, payload);
      setSuccess(res.data?.message || 'Test updated successfully.');
      setEditId(null);
      await loadData();
    } catch (err) {
      setError(getApiMessage(err, 'Failed to update test.'));
    } finally {
      setIsBusyId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-2">Test Manager</h1>
        <p className="text-brand-black/70 font-medium">Create, draft, and publish tests from your question bank.</p>
      </div>

      {error ? (
        <div className="mb-6 p-4 bg-red-100 border-2 border-brand-black text-red-700 font-bold shadow-solid-sm">{error}</div>
      ) : null}
      {success ? (
        <div className="mb-6 p-4 bg-green-100 border-2 border-brand-black text-green-700 font-bold shadow-solid-sm">{success}</div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white border-4 border-brand-black shadow-solid overflow-hidden">
          <div className="bg-brand-black text-white p-4 border-b-4 border-brand-black">
            <h2 className="text-lg font-black uppercase tracking-wider">Create Test</h2>
          </div>

          <form onSubmit={onCreateTest} className="p-4 md:p-5 space-y-4">
            <Input label="Title" value={form.title} onChange={(v) => setForm((p) => ({ ...p, title: v }))} required />
            <Input label="Description" value={form.description} onChange={(v) => setForm((p) => ({ ...p, description: v }))} />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Class"
                value={form.classLevel}
                onChange={(v) => setForm((p) => ({ ...p, classLevel: v as CreateTestPayload['classLevel'], questions: [] }))}
                options={['6', '7', '8', '9', '10']}
              />
              <Select
                label="Subject"
                value={form.subject}
                onChange={(v) => setForm((p) => ({ ...p, subject: v as CreateTestPayload['subject'], questions: [] }))}
                options={['Math', 'Science']}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Chapter"
                value={form.chapter}
                onChange={(v) => setForm((p) => ({ ...p, chapter: v, questions: [] }))}
                options={['', ...chapters]}
                optionLabel={(v) => (v ? v : 'All / None')}
              />
              <Select
                label="Status"
                value={form.status}
                onChange={(v) => setForm((p) => ({ ...p, status: v as CreateTestPayload['status'] }))}
                options={['draft', 'published']}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Duration (min)"
                type="number"
                min={1}
                value={String(form.duration)}
                onChange={(v) => setForm((p) => ({ ...p, duration: Number(v) }))}
                required
              />
              <Input
                label="Total Marks"
                type="number"
                min={1}
                value={String(form.totalMarks)}
                onChange={(v) => setForm((p) => ({ ...p, totalMarks: Number(v) }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start Time"
                type="datetime-local"
                value={form.startTime}
                onChange={(v) => setForm((p) => ({ ...p, startTime: v }))}
                required
              />
              <Input
                label="End Time"
                type="datetime-local"
                value={form.endTime}
                onChange={(v) => setForm((p) => ({ ...p, endTime: v }))}
                required
              />
            </div>

            <div className="border-2 border-brand-black p-3 shadow-solid-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="font-black uppercase text-sm">Question Picker</div>
                <div className="text-xs font-bold text-brand-black/70">{form.questions.length} selected</div>
              </div>
              <input
                className="mt-3 w-full border-2 border-brand-black px-3 py-2 font-medium"
                placeholder="Search question text..."
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
              />

              <div className="mt-3 max-h-60 overflow-auto border-2 border-brand-black/20">
                {filteredQuestions.length === 0 ? (
                  <div className="p-4 text-sm font-bold text-brand-black/50">No matching questions found.</div>
                ) : (
                  filteredQuestions.map((q) => {
                    const selected = form.questions.includes(q._id);
                    return (
                      <label
                        key={q._id}
                        className={`flex items-start gap-3 p-3 border-b border-brand-black/10 cursor-pointer ${selected ? 'bg-brand-orange/15' : 'bg-white'}`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleQuestion(q._id)}
                          className="mt-1 h-4 w-4 accent-brand-orange"
                        />
                        <div>
                          <div className="font-medium text-sm">{q.questionText}</div>
                          <div className="text-xs font-bold text-brand-black/50 mt-1">
                            {q.chapter || 'No chapter'} {q.difficulty ? `• ${q.difficulty}` : ''}
                          </div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-3 bg-brand-orange border-2 border-brand-black font-black uppercase shadow-solid-sm hover:-translate-y-1 hover:-translate-x-1 hover:shadow-solid active:translate-y-0 active:translate-x-0 active:shadow-none transition-all disabled:opacity-70"
            >
              {isCreating ? 'Creating...' : 'Create Test'}
            </button>
          </form>
        </section>

        <section className="bg-white border-4 border-brand-black shadow-solid overflow-hidden">
          <div className="bg-brand-black text-white p-4 border-b-4 border-brand-black flex items-center justify-between">
            <h2 className="text-lg font-black uppercase tracking-wider">Existing Tests</h2>
            <button
              type="button"
              onClick={loadData}
              className="px-3 py-1 bg-brand-orange text-brand-black border-2 border-brand-black text-xs font-black uppercase shadow-solid-sm"
            >
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="p-6 font-bold uppercase text-brand-black/50 animate-pulse">Loading tests...</div>
          ) : tests.length === 0 ? (
            <div className="p-6 font-bold uppercase text-brand-black/40">No tests yet.</div>
          ) : (
            <div className="max-h-[760px] overflow-auto divide-y divide-brand-black/10">
              {tests.map((t) => (
                <div key={t._id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-black uppercase truncate">{t.title}</div>
                      <div className="text-sm font-medium text-brand-black/70 mt-1">
                        Class {t.classLevel} • {t.subject} {t.chapter ? `• ${t.chapter}` : ''}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-black uppercase border-2 border-brand-black shadow-solid-sm ${t.status === 'published' ? 'bg-green-400' : 'bg-yellow-300'}`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div className="mt-2 text-xs font-bold text-brand-black/70">
                    {t.duration} min • {t.totalMarks} marks
                  </div>
                  <div className="mt-1 text-xs font-medium text-brand-black/70">
                    {new Date(t.startTime).toLocaleString()} → {new Date(t.endTime).toLocaleString()}
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => onQuickToggleStatus(t)}
                      disabled={isBusyId === t._id}
                      className="py-2 border-2 border-brand-black bg-white font-black uppercase text-xs shadow-solid-sm disabled:opacity-60"
                    >
                      {t.status === 'published' ? 'Move to Draft' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(t)}
                      disabled={isBusyId === t._id}
                      className="py-2 border-2 border-brand-black bg-brand-orange font-black uppercase text-xs shadow-solid-sm disabled:opacity-60"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTest(t)}
                      disabled={isBusyId === t._id}
                      className="py-2 border-2 border-brand-black bg-red-300 font-black uppercase text-xs shadow-solid-sm disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>

                  {editId === t._id ? (
                    <div className="mt-3 border-2 border-brand-black p-3 space-y-3 bg-brand-gray/10">
                      <Input
                        label="Title"
                        value={editForm.title}
                        onChange={(v) => setEditForm((p) => ({ ...p, title: v }))}
                        required
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Duration"
                          type="number"
                          min={1}
                          value={String(editForm.duration)}
                          onChange={(v) => setEditForm((p) => ({ ...p, duration: Number(v) }))}
                        />
                        <Input
                          label="Total Marks"
                          type="number"
                          min={1}
                          value={String(editForm.totalMarks)}
                          onChange={(v) => setEditForm((p) => ({ ...p, totalMarks: Number(v) }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Start Time"
                          type="datetime-local"
                          value={editForm.startTime}
                          onChange={(v) => setEditForm((p) => ({ ...p, startTime: v }))}
                        />
                        <Input
                          label="End Time"
                          type="datetime-local"
                          value={editForm.endTime}
                          onChange={(v) => setEditForm((p) => ({ ...p, endTime: v }))}
                        />
                      </div>
                      <Select
                        label="Status"
                        value={editForm.status}
                        onChange={(v) => setEditForm((p) => ({ ...p, status: v as 'draft' | 'published' }))}
                        options={['draft', 'published']}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onSaveEdit(t._id)}
                          disabled={isBusyId === t._id}
                          className="flex-1 py-2 border-2 border-brand-black bg-brand-orange font-black uppercase text-xs shadow-solid-sm disabled:opacity-60"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditId(null)}
                          className="flex-1 py-2 border-2 border-brand-black bg-white font-black uppercase text-xs shadow-solid-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  required,
  min,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  min?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-brand-black/70 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        required={required}
        min={min}
        className="w-full border-2 border-brand-black px-3 py-2 font-medium"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  optionLabel,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  optionLabel?: (v: string) => string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-brand-black/70 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-2 border-brand-black px-3 py-2 font-medium bg-white"
      >
        {options.map((opt) => (
          <option key={opt || '__empty'} value={opt}>
            {optionLabel ? optionLabel(opt) : opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function toDateTimeLocal(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${y}-${m}-${day}T${hh}:${mm}`;
}

