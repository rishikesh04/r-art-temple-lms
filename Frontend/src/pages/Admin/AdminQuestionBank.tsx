import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { getApiMessage } from '../../utils/apiMessage';

type QuestionItem = {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  classLevel: string;
  subject: 'Math' | 'Science' | string;
  chapter: string;
  difficulty: 'easy' | 'medium' | 'hard' | string;
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
    questionText: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: '',
    classLevel: '',
    subject: '',
    chapter: '',
    difficulty: '',
    explanation: '',
  });

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

  const setOption = (idx: number, value: string) => {
    setForm((prev) => {
      const next = [...prev.options] as [string, string, string, string];
      next[idx] = value;
      return { ...prev, options: next };
    });
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
      setError(getApiMessage(err, editId ? 'Failed to update question.' : 'Failed to create question.'));
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
      difficulty: (q.difficulty === 'hard' || q.difficulty === 'medium' ? q.difficulty : 'easy') as
        | 'easy'
        | 'medium'
        | 'hard',
    });
  };

  const onDelete = async (q: QuestionItem) => {
    const yes = window.confirm('Delete this question permanently?');
    if (!yes) return;
    setError('');
    setSuccess('');
    setBusyId(q._id);
    try {
      const res = await axiosInstance.delete(`/questions/${q._id}`);
      setSuccess(res.data?.message || 'Question deleted successfully.');
      if (editId === q._id) resetForm();
      await loadQuestions();
    } catch (err) {
      setError(getApiMessage(err, 'Failed to delete question.'));
    } finally {
      setBusyId(null);
    }
  };

  const normalizeDifficulty = (value: string) => {
    const v = (value || '').toLowerCase().trim();
    if (v === 'easy' || v === 'medium' || v === 'hard') return v as 'easy' | 'medium' | 'hard';
    return 'easy';
  };

  const normalizeSubject = (value: string) => {
    const v = (value || '').toLowerCase().trim();
    return v === 'science' ? 'Science' : 'Math';
  };

  const parseCorrectAnswer = (value: string) => {
    const raw = String(value ?? '').trim().toLowerCase();
    if (['0', '1', '2', '3'].includes(raw)) return Number(raw);
    if (['1', '2', '3', '4'].includes(raw)) return Number(raw) - 1;
    if (['a', 'b', 'c', 'd'].includes(raw)) return ['a', 'b', 'c', 'd'].indexOf(raw);
    return -1;
  };

  const normalizeHeader = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

  const suggestMapping = (headers: string[]): ColumnMapping => {
    const preferred: Record<FieldKey, string[]> = {
      questionText: ['questiontext', 'question', 'ques', 'qtext'],
      option1: ['option1', 'opt1', 'a', 'optiona', 'opta'],
      option2: ['option2', 'opt2', 'b', 'optionb', 'optb'],
      option3: ['option3', 'opt3', 'c', 'optionc', 'optc'],
      option4: ['option4', 'opt4', 'd', 'optiond', 'optd'],
      correctAnswer: ['correctanswer', 'answer', 'ans', 'correctoption'],
      classLevel: ['classlevel', 'class', 'grade', 'std'],
      subject: ['subject', 'sub'],
      chapter: ['chapter', 'topic'],
      difficulty: ['difficulty', 'level'],
      explanation: ['explanation', 'reason', 'solution'],
    };

    const lookup = headers.map((h) => ({ raw: h, key: normalizeHeader(h) }));
    const out = {} as ColumnMapping;
    (Object.keys(preferred) as FieldKey[]).forEach((field) => {
      const found = lookup.find((h) => preferred[field].includes(h.key));
      out[field] = found?.raw || '';
    });
    return out;
  };

  const buildPreviewFromMapping = (
    rows: Record<string, unknown>[],
    currentMapping: ColumnMapping
  ) => {
    const parsed: QuestionForm[] = [];
    const previewRows: BulkPreviewRow[] = [];
    const errors: string[] = [];

    rows.forEach((row, idx) => {
      const rowNo = idx + 2;
      const rowErrors: string[] = [];

      const get = (field: FieldKey) => String(row[currentMapping[field] || ''] ?? '').trim();

      const questionText = get('questionText');
      const option1 = get('option1');
      const option2 = get('option2');
      const option3 = get('option3');
      const option4 = get('option4');
      const chapter = get('chapter');
      const classLevel = get('classLevel');
      const subject = normalizeSubject(get('subject'));
      const difficulty = normalizeDifficulty(get('difficulty'));
      const explanation = get('explanation');
      const correctAnswerRaw = get('correctAnswer');
      const correctAnswer = parseCorrectAnswer(correctAnswerRaw);

      if (!questionText) rowErrors.push(`Row ${rowNo}: questionText is required`);
      if (!option1 || !option2 || !option3 || !option4) rowErrors.push(`Row ${rowNo}: option1-4 are required`);
      if (!['6', '7', '8', '9', '10'].includes(classLevel)) rowErrors.push(`Row ${rowNo}: classLevel must be 6-10`);
      if (correctAnswer < 0 || correctAnswer > 3) rowErrors.push(`Row ${rowNo}: correctAnswer must map to 0-3 / 1-4 / A-D`);
      if (!chapter) rowErrors.push(`Row ${rowNo}: chapter is required`);

      previewRows.push({
        rowNo,
        questionText,
        option1,
        option2,
        option3,
        option4,
        correctAnswerRaw,
        correctAnswerParsed: correctAnswer,
        classLevel,
        subject,
        chapter,
        difficulty,
        explanation,
        errors: rowErrors,
          parsedQuestion:
            rowErrors.length === 0
              ? {
                  questionText,
                  options: [option1, option2, option3, option4],
                  correctAnswer,
                  explanation,
                  classLevel,
                  subject,
                  chapter,
                  difficulty,
                }
              : undefined,
      });

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        parsed.push({
          questionText,
          options: [option1, option2, option3, option4],
          correctAnswer,
          explanation,
          classLevel,
          subject,
          chapter,
          difficulty,
        });
      }
    });

    return { parsed, previewRows, errors };
  };

  const validatePreviewRows = (rows: BulkPreviewRow[]) => {
    const parsed: QuestionForm[] = [];
    const nextRows: BulkPreviewRow[] = rows.map((row) => {
      const errors: string[] = [];
      const questionText = (row.questionText || '').trim();
      const option1 = (row.option1 || '').trim();
      const option2 = (row.option2 || '').trim();
      const option3 = (row.option3 || '').trim();
      const option4 = (row.option4 || '').trim();
      const chapter = (row.chapter || '').trim();
      const classLevel = (row.classLevel || '').trim();
      const subject = normalizeSubject(row.subject || '');
      const difficulty = normalizeDifficulty(row.difficulty || '');
      const explanation = (row.explanation || '').trim();
      const correctAnswer = parseCorrectAnswer(row.correctAnswerRaw || '');

      if (!questionText) errors.push(`Row ${row.rowNo}: questionText is required`);
      if (!option1 || !option2 || !option3 || !option4) errors.push(`Row ${row.rowNo}: option1-4 are required`);
      if (!['6', '7', '8', '9', '10'].includes(classLevel)) errors.push(`Row ${row.rowNo}: classLevel must be 6-10`);
      if (correctAnswer < 0 || correctAnswer > 3) errors.push(`Row ${row.rowNo}: correctAnswer must map to 0-3 / 1-4 / A-D`);
      if (!chapter) errors.push(`Row ${row.rowNo}: chapter is required`);

      const parsedQuestion =
        errors.length === 0
          ? ({
              questionText,
              options: [option1, option2, option3, option4],
              correctAnswer,
              explanation,
              classLevel,
              subject,
              chapter,
              difficulty,
            } as QuestionForm)
          : undefined;

      if (parsedQuestion) parsed.push(parsedQuestion);
      return {
        ...row,
        questionText,
        option1,
        option2,
        option3,
        option4,
        chapter,
        classLevel,
        subject,
        difficulty,
        explanation,
        correctAnswerParsed: correctAnswer,
        errors,
        parsedQuestion,
      };
    });

    const errors = nextRows.flatMap((r) => r.errors);
    return { nextRows, parsed, errors };
  };

  const onBulkFileChange = async (file: File | null) => {
    if (!file) return;
    setBulkErrors([]);
    setBulkRows([]);
    setBulkPreviewRows([]);
    setUploadedRawRows([]);
    setUploadedHeaders([]);
    setError('');
    setSuccess('');

    try {
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '' });
      const headers = Array.from(
        rows.reduce((acc, row) => {
          Object.keys(row || {}).forEach((k) => acc.add(k));
          return acc;
        }, new Set<string>())
      );

      const guessed = suggestMapping(headers);
      const { parsed, previewRows, errors } = buildPreviewFromMapping(rows, guessed);

      setUploadedRawRows(rows);
      setUploadedHeaders(headers);
      setMapping(guessed);
      setBulkRows(parsed);
      setBulkPreviewRows(previewRows);
      setBulkErrors(errors.slice(0, 100));
      setSelectedRowNos(previewRows.filter((r) => r.errors.length === 0).map((r) => r.rowNo));

      if (rows.length === 0) {
        setError('Uploaded file has no data rows.');
      } else if (parsed.length > 0) {
        setSuccess(`Parsed ${parsed.length} valid row(s). Review mapping and preview, then upload.`);
      } else {
        setError('No valid rows found from current mapping. Update column mapping and re-validate.');
      }
    } catch (err) {
      setError(getApiMessage(err, 'Failed to parse file. Please upload a valid CSV/XLSX file.'));
    }
  };

  const onRevalidateMapping = () => {
    if (uploadedRawRows.length === 0) {
      setError('Upload a file first.');
      return;
    }
    setError('');
    setSuccess('');
    const { parsed, previewRows, errors } = buildPreviewFromMapping(uploadedRawRows, mapping);
    setBulkRows(parsed);
    setBulkPreviewRows(previewRows);
    setBulkErrors(errors.slice(0, 100));
    setSelectedRowNos(previewRows.filter((r) => r.errors.length === 0).map((r) => r.rowNo));
    if (parsed.length > 0) {
      setSuccess(`Re-validated: ${parsed.length} valid row(s) ready.`);
    } else {
      setError('No valid rows found with current mapping.');
    }
  };

  const onRevalidateEditedRows = () => {
    if (bulkPreviewRows.length === 0) {
      setError('No preview rows to validate.');
      return;
    }
    setError('');
    setSuccess('');
    const { nextRows, parsed, errors } = validatePreviewRows(bulkPreviewRows);
    setBulkPreviewRows(nextRows);
    setBulkRows(parsed);
    setBulkErrors(errors.slice(0, 100));
    setSelectedRowNos(nextRows.filter((r) => r.errors.length === 0).map((r) => r.rowNo));
    if (parsed.length > 0) {
      setSuccess(`Re-validated edited rows: ${parsed.length} valid row(s).`);
    } else {
      setError('No valid rows after re-validation.');
    }
  };

  const updatePreviewCell = (
    rowNo: number,
    key:
      | 'questionText'
      | 'option1'
      | 'option2'
      | 'option3'
      | 'option4'
      | 'correctAnswerRaw'
      | 'classLevel'
      | 'subject'
      | 'chapter'
      | 'difficulty'
      | 'explanation',
    value: string
  ) => {
    setBulkPreviewRows((prev) =>
      prev.map((r) => (r.rowNo === rowNo ? { ...r, [key]: value, errors: ['Edited: click Revalidate Edited Rows'] } : r))
    );
  };

  const onUploadBulk = async () => {
    const selectedValidRows = bulkPreviewRows
      .filter((r) => r.errors.length === 0 && selectedRowNos.includes(r.rowNo))
      .map((r) => r.parsedQuestion)
      .filter(Boolean) as QuestionForm[];

    if (selectedValidRows.length === 0) {
      setError('No selected valid rows to upload.');
      return;
    }

    setIsUploadingBulk(true);
    setError('');
    setSuccess('');
    try {
      const res = await axiosInstance.post('/questions/bulk', { questions: selectedValidRows });
      setSuccess(res.data?.message || `Uploaded ${selectedValidRows.length} question(s).`);
      setBulkRows([]);
      setBulkErrors([]);
      setBulkPreviewRows([]);
      setSelectedRowNos([]);
      await loadQuestions();
    } catch (err) {
      setError(getApiMessage(err, 'Bulk upload failed.'));
    } finally {
      setIsUploadingBulk(false);
    }
  };

  const toggleRowSelection = (rowNo: number) => {
    setSelectedRowNos((prev) => (prev.includes(rowNo) ? prev.filter((n) => n !== rowNo) : [...prev, rowNo]));
  };

  const selectAllValidRows = () => {
    setSelectedRowNos(bulkPreviewRows.filter((r) => r.errors.length === 0).map((r) => r.rowNo));
  };

  const clearSelectedRows = () => setSelectedRowNos([]);

  const exportInvalidRowsCsv = () => {
    const invalidRows = bulkPreviewRows.filter((r) => r.errors.length > 0);
    if (invalidRows.length === 0) {
      setError('No invalid rows to export.');
      return;
    }

    const headers = [
      'rowNo',
      'questionText',
      'option1',
      'option2',
      'option3',
      'option4',
      'correctAnswer',
      'classLevel',
      'subject',
      'chapter',
      'difficulty',
      'explanation',
      'errors',
    ];

    const escapeCsv = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [
      headers.join(','),
      ...invalidRows.map((r) =>
        [
          r.rowNo,
          r.questionText,
          r.option1,
          r.option2,
          r.option3,
          r.option4,
          r.correctAnswerRaw,
          r.classLevel,
          r.subject,
          r.chapter,
          r.difficulty,
          r.explanation,
          r.errors.join(' | '),
        ]
          .map(escapeCsv)
          .join(',')
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invalid-question-rows.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-2">Question Bank</h1>
        <p className="text-brand-black/70 font-medium">Create and maintain high-quality questions for test generation.</p>
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
            <h2 className="text-lg font-black uppercase tracking-wider">{editId ? 'Edit Question' : 'Create Question'}</h2>
          </div>

          <form onSubmit={onSubmit} className="p-4 md:p-5 space-y-4">
            <TextArea
              label="Question Text"
              value={form.questionText}
              onChange={(v) => setForm((p) => ({ ...p, questionText: v }))}
              required
            />

            <div className="grid grid-cols-1 gap-2">
              {form.options.map((opt, idx) => (
                <Input
                  key={idx}
                  label={`Option ${idx + 1}`}
                  value={opt}
                  onChange={(v) => setOption(idx, v)}
                  required
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Correct Option"
                value={String(form.correctAnswer)}
                onChange={(v) => setForm((p) => ({ ...p, correctAnswer: Number(v) }))}
                options={['0', '1', '2', '3']}
                optionLabel={(v) => `Option ${Number(v) + 1}`}
              />
              <Select
                label="Difficulty"
                value={form.difficulty}
                onChange={(v) => setForm((p) => ({ ...p, difficulty: v as 'easy' | 'medium' | 'hard' }))}
                options={['easy', 'medium', 'hard']}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Select
                label="Class"
                value={form.classLevel}
                onChange={(v) => setForm((p) => ({ ...p, classLevel: v }))}
                options={['6', '7', '8', '9', '10']}
              />
              <Select
                label="Subject"
                value={form.subject}
                onChange={(v) => setForm((p) => ({ ...p, subject: v as 'Math' | 'Science' }))}
                options={['Math', 'Science']}
              />
              <Input label="Chapter" value={form.chapter} onChange={(v) => setForm((p) => ({ ...p, chapter: v }))} required />
            </div>

            <TextArea
              label="Explanation"
              value={form.explanation}
              onChange={(v) => setForm((p) => ({ ...p, explanation: v }))}
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-3 bg-brand-orange border-2 border-brand-black font-black uppercase shadow-solid-sm disabled:opacity-70"
              >
                {isSaving ? 'Saving...' : editId ? 'Save Changes' : 'Create Question'}
              </button>
              {editId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 bg-white border-2 border-brand-black font-black uppercase shadow-solid-sm"
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="bg-white border-4 border-brand-black shadow-solid overflow-hidden">
          <div className="bg-brand-black text-white p-4 border-b-4 border-brand-black">
            <h2 className="text-lg font-black uppercase tracking-wider">Existing Questions</h2>
          </div>

          <div className="p-4 border-b-2 border-brand-black/10 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <Select label="Class" value={filterClass} onChange={setFilterClass} options={['', '6', '7', '8', '9', '10']} optionLabel={(v) => (v ? v : 'All')} />
              <Select label="Subject" value={filterSubject} onChange={setFilterSubject} options={['', 'Math', 'Science']} optionLabel={(v) => (v ? v : 'All')} />
              <Select label="Difficulty" value={filterDifficulty} onChange={setFilterDifficulty} options={['', 'easy', 'medium', 'hard']} optionLabel={(v) => (v ? v : 'All')} />
            </div>
            <input
              className="w-full border-2 border-brand-black px-3 py-2 font-medium"
              placeholder="Search text, chapter, options..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="p-6 font-bold uppercase text-brand-black/50 animate-pulse">Loading questions...</div>
          ) : filteredBySearch.length === 0 ? (
            <div className="p-6 font-bold uppercase text-brand-black/40">No questions found.</div>
          ) : (
            <div className="max-h-[760px] overflow-auto divide-y divide-brand-black/10">
              {filteredBySearch.map((q) => (
                <div key={q._id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-black text-sm uppercase text-brand-black/70">
                        Class {q.classLevel} • {q.subject} • {q.difficulty}
                      </div>
                      <div className="mt-1 font-medium">{q.questionText}</div>
                      <div className="mt-2 text-xs font-bold text-brand-black/60">Chapter: {q.chapter}</div>
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-1 gap-1">
                    {q.options.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`text-xs border px-2 py-1 ${idx === q.correctAnswer ? 'border-brand-black bg-green-100 font-bold' : 'border-brand-black/20'}`}
                      >
                        {idx + 1}. {opt}
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(q)}
                      disabled={busyId === q._id}
                      className="py-2 border-2 border-brand-black bg-brand-orange font-black uppercase text-xs shadow-solid-sm disabled:opacity-70"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(q)}
                      disabled={busyId === q._id}
                      className="py-2 border-2 border-brand-black bg-red-300 font-black uppercase text-xs shadow-solid-sm disabled:opacity-70"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="mt-6 bg-white border-4 border-brand-black shadow-solid overflow-hidden">
        <div className="bg-brand-black text-white p-4 border-b-4 border-brand-black">
          <h2 className="text-lg font-black uppercase tracking-wider">Excel/CSV Bulk Upload</h2>
          <p className="text-xs text-white/80 mt-1">
            Required headers: questionText, option1, option2, option3, option4, correctAnswer, classLevel, subject, chapter, difficulty, explanation
          </p>
        </div>

        <div className="p-4 space-y-4">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => onBulkFileChange(e.target.files?.[0] || null)}
            className="block w-full border-2 border-brand-black px-3 py-2 font-medium bg-white"
          />

          {bulkErrors.length > 0 ? (
            <div className="border-2 border-brand-black bg-red-50 p-3">
              <div className="font-black uppercase text-sm text-red-700">Validation errors ({bulkErrors.length})</div>
              <ul className="mt-2 text-sm text-red-700 list-disc pl-5 space-y-1 max-h-40 overflow-auto">
                {bulkErrors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {bulkRows.length > 0 ? (
            <div className="border-2 border-brand-black p-3 bg-green-50">
              <div className="font-black uppercase text-sm text-green-700">{bulkRows.length} valid rows ready</div>
              <div className="mt-2 text-xs text-brand-black/70">
                {bulkPreviewRows.length - bulkRows.length} invalid row(s) will be skipped.
              </div>
              <button
                type="button"
                onClick={onUploadBulk}
                disabled={isUploadingBulk}
                className="mt-3 px-4 py-2 border-2 border-brand-black bg-brand-orange font-black uppercase text-xs shadow-solid-sm disabled:opacity-70"
              >
                {isUploadingBulk ? 'Uploading...' : 'Upload Parsed Rows'}
              </button>
            </div>
          ) : null}

          {uploadedHeaders.length > 0 ? (
            <div className="border-2 border-brand-black p-3">
              <div className="font-black uppercase text-sm mb-3">Column Mapping</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(Object.keys(mapping) as FieldKey[]).map((field) => (
                  <Select
                    key={field}
                    label={field}
                    value={mapping[field]}
                    onChange={(v) => setMapping((prev) => ({ ...prev, [field]: v }))}
                    options={['', ...uploadedHeaders]}
                    optionLabel={(v) => (v ? v : '-- Not mapped --')}
                  />
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onRevalidateMapping}
                  className="px-3 py-2 border-2 border-brand-black bg-white font-black uppercase text-xs shadow-solid-sm"
                >
                  Apply Mapping & Validate
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const guessed = suggestMapping(uploadedHeaders);
                    setMapping(guessed);
                  }}
                  className="px-3 py-2 border-2 border-brand-black bg-brand-orange font-black uppercase text-xs shadow-solid-sm"
                >
                  Auto-map Again
                </button>
              </div>
            </div>
          ) : null}

          {bulkPreviewRows.length > 0 ? (
            <div className="border-2 border-brand-black overflow-auto">
              <div className="sticky top-0 z-10 bg-white border-b-2 border-brand-black px-3 py-2 flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase">
                  Rows: {bulkPreviewRows.length} • Valid: {bulkPreviewRows.filter((r) => r.errors.length === 0).length} • Invalid:{' '}
                  {bulkPreviewRows.filter((r) => r.errors.length > 0).length}
                </span>
                <span className="text-xs font-black uppercase text-brand-orange">
                  Selected for upload: {selectedRowNos.length}
                </span>
                <button
                  type="button"
                  onClick={selectAllValidRows}
                  className="px-2 py-1 text-[10px] font-black uppercase border-2 border-brand-black bg-white shadow-solid-sm"
                >
                  Select all valid
                </button>
                <button
                  type="button"
                  onClick={clearSelectedRows}
                  className="px-2 py-1 text-[10px] font-black uppercase border-2 border-brand-black bg-white shadow-solid-sm"
                >
                  Clear selection
                </button>
                <button
                  type="button"
                  onClick={exportInvalidRowsCsv}
                  className="px-2 py-1 text-[10px] font-black uppercase border-2 border-brand-black bg-brand-orange shadow-solid-sm"
                >
                  Export invalid CSV
                </button>
                <button
                  type="button"
                  onClick={onRevalidateEditedRows}
                  className="px-2 py-1 text-[10px] font-black uppercase border-2 border-brand-black bg-white shadow-solid-sm"
                >
                  Revalidate Edited Rows
                </button>
              </div>

              <table className="min-w-[1200px] w-full text-left border-collapse">
                <thead className="bg-brand-black text-white text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-2 border-r border-white/20">Select</th>
                    <th className="p-2 border-r border-white/20">Row</th>
                    <th className="p-2 border-r border-white/20">Status</th>
                    <th className="p-2 border-r border-white/20">Question</th>
                    <th className="p-2 border-r border-white/20">Options</th>
                    <th className="p-2 border-r border-white/20">Answer</th>
                    <th className="p-2 border-r border-white/20">Class</th>
                    <th className="p-2 border-r border-white/20">Subject</th>
                    <th className="p-2 border-r border-white/20">Chapter</th>
                    <th className="p-2 border-r border-white/20">Difficulty</th>
                    <th className="p-2">Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkPreviewRows.map((row) => {
                    const valid = row.errors.length === 0;
                    return (
                      <tr key={row.rowNo} className={valid ? 'bg-green-50/40' : 'bg-red-50/50'}>
                        <td className="p-2 align-top border-b border-brand-black/10">
                          <input
                            type="checkbox"
                            disabled={!valid}
                            checked={selectedRowNos.includes(row.rowNo)}
                            onChange={() => toggleRowSelection(row.rowNo)}
                            className="h-4 w-4 accent-brand-orange"
                          />
                        </td>
                        <td className="p-2 align-top border-b border-brand-black/10">{row.rowNo}</td>
                        <td className="p-2 align-top border-b border-brand-black/10">
                          <span className={`px-2 py-1 text-[10px] font-black uppercase border border-brand-black ${valid ? 'bg-green-300' : 'bg-red-300'}`}>
                            {valid ? 'valid' : 'invalid'}
                          </span>
                        </td>
                        <td className="p-2 align-top border-b border-brand-black/10 text-xs max-w-[280px]">
                          {valid ? (
                            row.questionText || '—'
                          ) : (
                            <textarea
                              value={row.questionText}
                              onChange={(e) => updatePreviewCell(row.rowNo, 'questionText', e.target.value)}
                              rows={2}
                              className="w-full border border-brand-black px-1 py-1 text-xs"
                            />
                          )}
                        </td>
                        <td className="p-2 align-top border-b border-brand-black/10 text-xs">
                          {valid ? (
                            <>
                              <div>1) {row.option1 || '—'}</div>
                              <div>2) {row.option2 || '—'}</div>
                              <div>3) {row.option3 || '—'}</div>
                              <div>4) {row.option4 || '—'}</div>
                            </>
                          ) : (
                            <div className="grid grid-cols-1 gap-1">
                              <input value={row.option1} onChange={(e) => updatePreviewCell(row.rowNo, 'option1', e.target.value)} className="border border-brand-black px-1 py-1 text-xs" />
                              <input value={row.option2} onChange={(e) => updatePreviewCell(row.rowNo, 'option2', e.target.value)} className="border border-brand-black px-1 py-1 text-xs" />
                              <input value={row.option3} onChange={(e) => updatePreviewCell(row.rowNo, 'option3', e.target.value)} className="border border-brand-black px-1 py-1 text-xs" />
                              <input value={row.option4} onChange={(e) => updatePreviewCell(row.rowNo, 'option4', e.target.value)} className="border border-brand-black px-1 py-1 text-xs" />
                            </div>
                          )}
                        </td>
                        <td className="p-2 align-top border-b border-brand-black/10 text-xs">
                          {valid ? (
                            <>
                              Raw: {row.correctAnswerRaw || '—'}
                              <br />
                              Parsed: {row.correctAnswerParsed >= 0 ? row.correctAnswerParsed + 1 : '—'}
                            </>
                          ) : (
                            <input
                              value={row.correctAnswerRaw}
                              onChange={(e) => updatePreviewCell(row.rowNo, 'correctAnswerRaw', e.target.value)}
                              className="border border-brand-black px-1 py-1 text-xs w-24"
                              placeholder="0-3 / 1-4 / A-D"
                            />
                          )}
                        </td>
                        <td className="p-2 align-top border-b border-brand-black/10 text-xs">
                          {valid ? (
                            row.classLevel || '—'
                          ) : (
                            <input value={row.classLevel} onChange={(e) => updatePreviewCell(row.rowNo, 'classLevel', e.target.value)} className="border border-brand-black px-1 py-1 text-xs w-16" />
                          )}
                        </td>
                        <td className="p-2 align-top border-b border-brand-black/10 text-xs">
                          {valid ? (
                            row.subject || '—'
                          ) : (
                            <input value={row.subject} onChange={(e) => updatePreviewCell(row.rowNo, 'subject', e.target.value)} className="border border-brand-black px-1 py-1 text-xs w-20" />
                          )}
                        </td>
                        <td className="p-2 align-top border-b border-brand-black/10 text-xs">
                          {valid ? (
                            row.chapter || '—'
                          ) : (
                            <input value={row.chapter} onChange={(e) => updatePreviewCell(row.rowNo, 'chapter', e.target.value)} className="border border-brand-black px-1 py-1 text-xs w-24" />
                          )}
                        </td>
                        <td className="p-2 align-top border-b border-brand-black/10 text-xs">
                          {valid ? (
                            row.difficulty || '—'
                          ) : (
                            <input value={row.difficulty} onChange={(e) => updatePreviewCell(row.rowNo, 'difficulty', e.target.value)} className="border border-brand-black px-1 py-1 text-xs w-20" />
                          )}
                        </td>
                        <td className="p-2 align-top border-b border-brand-black/10 text-xs">
                          {row.errors.length === 0 ? '—' : row.errors.join(' | ')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-brand-black/70 mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} required={required} className="w-full border-2 border-brand-black px-3 py-2 font-medium" />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-brand-black/70 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        rows={3}
        className="w-full border-2 border-brand-black px-3 py-2 font-medium resize-y"
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
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full border-2 border-brand-black px-3 py-2 font-medium bg-white">
        {options.map((opt) => (
          <option key={opt || '__empty'} value={opt}>
            {optionLabel ? optionLabel(opt) : opt}
          </option>
        ))}
      </select>
    </div>
  );
}

