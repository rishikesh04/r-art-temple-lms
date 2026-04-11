import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import ExamsBro from '../../assets/Exams-bro.svg';
import { getApiMessage } from '../../utils/apiMessage';

const ACCENT = '#ff5722';

type StudentQuestion = {
  _id: string;
  questionText: string;
  options: string[];
};

type TestDetails = {
  _id: string;
  title: string;
  subject: string;
  chapter?: string;
  duration: number;
  startTime: string;
  endTime: string;
  questions: StudentQuestion[];
};

type TestDetailsResponse = {
  success: boolean;
  test: TestDetails;
};

type SubmitPayload = {
  answers: Array<{ questionId: string; selectedAnswer: number | null }>;
  timeTaken: number;
};

const formatTime = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  const mm = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = Math.floor(s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
};

/** Multiple-choice label: a, b, c, d, … */
const optionLetter = (index: number) => String.fromCharCode(97 + Math.min(index, 25));

type AttemptDraft = {
  testId: string;
  startedAt: number;
  activeIndex: number;
  answers: Record<string, number | null>;
  marked?: Record<string, boolean>;
  visitedIds?: string[];
};

export default function AttemptTestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const startedAtRef = useRef<number>(Date.now());
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [visitedIds, setVisitedIds] = useState<Record<string, boolean>>({});
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isSubmitReviewOpen, setIsSubmitReviewOpen] = useState(false);
  const draftKey = useMemo(() => (id ? `attemptDraft:${id}` : null), [id]);
  const hasRestoredRef = useRef(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['test', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await axiosInstance.get(`/tests/${id}`);
      return res.data as TestDetailsResponse;
    },
  });

  const test = data?.success ? data.test : null;
  const totalAllowedSeconds = useMemo(() => (test ? test.duration * 60 : 0), [test]);

  const [remaining, setRemaining] = useState<number | null>(null);
  const [isTimerReady, setIsTimerReady] = useState(false);

  useEffect(() => {
    if (!test) return;
    if (!draftKey) return;
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) {
        startedAtRef.current = Date.now();
        setRemaining(test.duration * 60);
        setIsTimerReady(true);
        return;
      }
      const draft = JSON.parse(raw) as AttemptDraft;
      if (!draft || draft.testId !== test._id) {
        startedAtRef.current = Date.now();
        setRemaining(test.duration * 60);
        setIsTimerReady(true);
        return;
      }

      startedAtRef.current = typeof draft.startedAt === 'number' ? draft.startedAt : Date.now();
      setAnswers(draft.answers || {});
      setMarkedForReview(draft.marked || {});
      const vis = draft.visitedIds || [];
      setVisitedIds(Object.fromEntries(vis.map((qid) => [qid, true])));
      setActiveIndex(Math.min(Math.max(0, draft.activeIndex || 0), test.questions.length - 1));

      const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
      setRemaining(Math.max(0, test.duration * 60 - elapsed));
      setIsTimerReady(true);
    } catch {
      startedAtRef.current = Date.now();
      setRemaining(test.duration * 60);
      setIsTimerReady(true);
    }
  }, [draftKey, test]);

  useEffect(() => {
    hasRestoredRef.current = false;
    setIsTimerReady(false);
    setRemaining(null);
    setAnswers({});
    setMarkedForReview({});
    setVisitedIds({});
    setActiveIndex(0);
  }, [id]);

  useEffect(() => {
    if (!test) return;
    const q = test.questions[activeIndex];
    if (!q) return;
    setVisitedIds((prev) => (prev[q._id] ? prev : { ...prev, [q._id]: true }));
  }, [test, activeIndex]);

  useEffect(() => {
    if (!test) return;
    if (remaining === null) return;
    const timer = window.setInterval(() => {
      setRemaining((prev) => (prev === null ? null : Math.max(0, prev - 1)));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [test?._id, remaining]);

  useEffect(() => {
    if (!test) return;
    if (!draftKey) return;

    const timeout = window.setTimeout(() => {
      const draft: AttemptDraft = {
        testId: test._id,
        startedAt: startedAtRef.current,
        activeIndex,
        answers,
        marked: markedForReview,
        visitedIds: Object.keys(visitedIds).filter((k) => visitedIds[k]),
      };
      try {
        localStorage.setItem(draftKey, JSON.stringify(draft));
      } catch {
        // ignore
      }
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [answers, activeIndex, markedForReview, visitedIds, draftKey, test?._id]);

  const submitMutation = useMutation({
    mutationFn: async (payload: SubmitPayload) => {
      const res = await axiosInstance.post(`/attempts/submit/${id}`, payload);
      return res.data as { success: boolean; message: string; attempt?: { id: string } };
    },
    onSuccess: () => {
      if (draftKey) {
        try {
          localStorage.removeItem(draftKey);
        } catch {
          // ignore
        }
      }
      if (id) navigate(`/tests/${id}/submitted`);
      else navigate('/dashboard');
    },
  });

  const onSelect = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const onClear = (questionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: null }));
  };

  const toggleMarkForReview = (questionId: string) => {
    setMarkedForReview((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const goToIndex = (idx: number) => {
    if (!test) return;
    const next = Math.min(Math.max(0, idx), test.questions.length - 1);
    setActiveIndex(next);
    const q = test.questions[next];
    if (q) setVisitedIds((p) => ({ ...p, [q._id]: true }));
    setIsPaletteOpen(false);
  };

  const submitNow = () => {
    if (!test) return;
    if (submitMutation.isPending || submitMutation.isSuccess) return;

    const rawTaken = Math.max(0, Math.floor((Date.now() - startedAtRef.current) / 1000));
    const timeTakenSeconds = Math.min(rawTaken, totalAllowedSeconds);
    const payload: SubmitPayload = {
      timeTaken: timeTakenSeconds,
      answers: test.questions.map((q) => ({
        questionId: q._id,
        selectedAnswer: answers[q._id] ?? null,
      })),
    };

    submitMutation.mutate(payload);
  };

  const openSubmitReview = () => {
    if (!test) return;
    if (submitMutation.isPending || submitMutation.isSuccess) return;
    setIsSubmitReviewOpen(true);
  };

  useEffect(() => {
    if (!test) return;
    if (!isTimerReady) return;
    if (remaining !== 0) return;
    if (submitMutation.isPending || submitMutation.isSuccess) return;
    submitNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, isTimerReady, test?._id]);

  useEffect(() => {
    if (!test) return;
    if (!isTimerReady) return;
    if (submitMutation.isPending || submitMutation.isSuccess) return;
    if (remaining === null) return;
    if (remaining === 0) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isTimerReady, remaining, submitMutation.isPending, submitMutation.isSuccess, test?._id]);

  useEffect(() => {
    if (!isPaletteOpen && !isSubmitReviewOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isPaletteOpen, isSubmitReviewOpen]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] px-4 py-8">
        <div className="mx-auto max-w-4xl flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-300 text-sm font-medium text-slate-500">
          Loading test…
        </div>
      </div>
    );
  }

  if (error || !test) {
    const msg = error ? getApiMessage(error, 'Failed to load test.') : 'Failed to load test.';
    return (
      <div className="min-h-[100dvh] px-4 py-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-red-50/90 p-6 text-sm font-medium text-red-800">
          {msg}
        </div>
        <div className="mt-4">
          <Link to="/tests" className="text-sm font-semibold text-[#ff5722] underline-offset-2 hover:underline">
            Back to tests
          </Link>
        </div>
      </div>
    );
  }

  const current = test.questions[activeIndex];
  const selected = current ? (answers[current._id] ?? null) : null;
  const totalQ = test.questions.length;
  const unansweredCount = test.questions.reduce((acc, q) => {
    const v = answers[q._id];
    return v === undefined || v === null ? acc + 1 : acc;
  }, 0);
  const answeredCount = totalQ - unansweredCount;
  const markedCount = test.questions.filter((q) => markedForReview[q._id]).length;
  const isLastQuestion = activeIndex === totalQ - 1;
  const timerLabel = isTimerReady && remaining !== null ? formatTime(remaining) : '--:--';

  const paletteClass = (q: StudentQuestion, idx: number) => {
    const qid = q._id;
    const answered = answers[qid] !== undefined && answers[qid] !== null;
    const marked = Boolean(markedForReview[qid]);
    const visited = Boolean(visitedIds[qid]);
    const isCurrent = idx === activeIndex;

    let fill = 'bg-slate-300 text-slate-800';
    if (visited) {
      if (answered && marked) fill = 'bg-violet-500 text-white';
      else if (marked) fill = 'bg-violet-500 text-white';
      else if (answered) fill = 'bg-emerald-500 text-white';
      else fill = 'bg-white text-slate-800';
    }
    const border = 'border border-slate-200/90';
    const ring = isCurrent ? ' ring-2 ring-[#ff5722] ring-offset-2 ring-offset-white' : '';
    return `relative flex aspect-square w-full min-h-[2.75rem] max-h-[3rem] items-center justify-center rounded-xl text-sm font-semibold shadow-sm transition-transform active:scale-95 ${border} ${fill}${ring}`;
  };

  const questionGrid = (gridClassName: string) => (
    <div className={gridClassName}>
      {test.questions.map((q, idx) => {
        const answered = answers[q._id] !== undefined && answers[q._id] !== null;
        const marked = Boolean(markedForReview[q._id]);
        return (
          <button
            key={q._id}
            type="button"
            onClick={() => goToIndex(idx)}
            className={paletteClass(q, idx)}
            aria-label={`Go to question ${idx + 1}`}
          >
            {answered && marked ? (
              <span
                className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-amber-400 ring-1 ring-amber-200"
                aria-hidden
              />
            ) : null}
            {idx + 1}
          </button>
        );
      })}
    </div>
  );

  const overlayLegend = (
    <div className="grid grid-cols-1 gap-2.5 text-left text-[11px] font-medium leading-snug text-white/95 sm:grid-cols-2">
      <span className="flex items-center gap-2.5">
        <span className="h-4 w-4 shrink-0 rounded-md bg-emerald-500 ring-2 ring-white/50" /> answered
      </span>
      <span className="flex items-center gap-2.5">
        <span className="h-4 w-4 shrink-0 rounded-md bg-slate-300 ring-2 ring-white/40" /> Not visited
      </span>
      <span className="flex items-center gap-2.5">
        <span className="h-4 w-4 shrink-0 rounded-md bg-violet-500 ring-2 ring-white/50" /> Marked for review
      </span>
      <span className="flex items-center gap-2.5">
        <span className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-md bg-violet-500 ring-2 ring-white/50">
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-300 ring-2 ring-amber-100" />
        </span>
        answered &amp; Marked for review
      </span>
    </div>
  );

  const desktopLegend = (
    <div className="grid grid-cols-1 gap-2.5 text-[11px] font-medium leading-snug text-slate-600 sm:grid-cols-2">
      <span className="flex items-center gap-2.5">
        <span className="h-3.5 w-3.5 shrink-0 rounded-md bg-emerald-500 ring-1 ring-slate-200" /> answered
      </span>
      <span className="flex items-center gap-2.5">
        <span className="h-3.5 w-3.5 shrink-0 rounded-md bg-slate-300 ring-1 ring-slate-200" /> Not visited
      </span>
      <span className="flex items-center gap-2.5">
        <span className="h-3.5 w-3.5 shrink-0 rounded-md bg-violet-500 ring-1 ring-slate-200" /> Marked for review
      </span>
      <span className="flex items-center gap-2.5">
        <span className="relative flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-md bg-violet-500 ring-1 ring-slate-200">
          <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-amber-300" />
        </span>
        answered &amp; Marked for review
      </span>
    </div>
  );

  return (
    <div className="relative min-h-[100dvh] bg-slate-50/80 max-md:pb-28">
      <img
        src={ExamsBro}
        alt=""
        className="pointer-events-none absolute bottom-0 right-0 hidden w-[520px] max-w-none opacity-[0.06] lg:block"
      />

      {/* Mobile header — wireframe: menu | Test Info, then Timer | Submit */}
      <div className="sticky top-0 z-[56] bg-white/95 pt-[env(safe-area-inset-top,0px)] md:hidden">
        <div className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
          <div className="flex items-center justify-between px-3 py-2.5">
            <button
              type="button"
              onClick={() => setIsPaletteOpen((o) => !o)}
              className={[
                'flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm transition active:scale-95',
                isPaletteOpen
                  ? 'border-orange-600/25 bg-[#ff5722] text-white shadow-md shadow-orange-500/25'
                  : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
              ].join(' ')}
              aria-label={isPaletteOpen ? 'Close question map' : 'Open question map'}
              aria-expanded={isPaletteOpen}
            >
              <Menu size={20} strokeWidth={2.2} />
            </button>
            <span className="text-sm font-semibold tracking-tight text-slate-900">Test Info</span>
            <div className="w-10" aria-hidden />
          </div>
          <div className="flex items-center justify-between gap-3 px-3 pb-3">
            <div className="rounded-full border border-slate-200/90 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">
              <span className="text-slate-500">Timer </span>
              <span className="tabular-nums text-slate-900">{timerLabel}</span>
            </div>
            <button
              type="button"
              onClick={openSubmitReview}
              disabled={submitMutation.isPending}
              className="rounded-xl px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white shadow-md transition hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
              style={{ backgroundColor: ACCENT, boxShadow: '0 8px 24px -4px rgba(255,87,34,0.45)' }}
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-6 max-md:pt-4">
        {/* Desktop: wireframe-style chrome (no global nav) */}
        <div className="mb-6 hidden md:block">
          <div className="flex items-center justify-center rounded-2xl border border-slate-200/90 bg-white px-4 py-3 shadow-sm">
            <span className="text-sm font-semibold tracking-tight text-slate-900">Test Info</span>
          </div>
          <p className="mt-2 text-center text-xs font-medium text-slate-500">
            {test.title}
            <span className="text-slate-400"> · </span>
            {test.subject}
            {test.chapter ? ` · ${test.chapter}` : ''}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-end gap-3">
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm">
              Timer <span className="tabular-nums text-[#ff5722]">{timerLabel}</span>
            </div>
            <button
              type="button"
              onClick={openSubmitReview}
              disabled={submitMutation.isPending}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-105 disabled:opacity-60"
              style={{ backgroundColor: ACCENT, boxShadow: '0 8px 24px -4px rgba(255,87,34,0.4)' }}
            >
              Submit
            </button>
          </div>
        </div>

        {submitMutation.isError ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50/90 p-4 text-sm font-medium text-red-800">
            {getApiMessage(submitMutation.error, 'Submission failed. Please try again.')}
          </div>
        ) : null}

        {/* Submit review modal — opened from Submit header or Finish */}
        <AnimatePresence>
          {isSubmitReviewOpen ? (
            <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center">
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm"
                aria-label="Close"
                onClick={() => setIsSubmitReviewOpen(false)}
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="submit-review-title"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/15 ring-1 ring-slate-900/5"
              >
                <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white px-6 py-5">
                  <h2 id="submit-review-title" className="text-lg font-semibold tracking-tight text-slate-900">
                    Ready to submit?
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    You won&apos;t be able to change your answers after this. Please review the summary below.
                  </p>
                </div>
                <div className="space-y-3 px-6 py-5">
                  <div className="grid grid-cols-2 gap-3">
                    <motion.div
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 }}
                      className="rounded-2xl border border-emerald-200/80 bg-emerald-50/90 p-4"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800/80">Attempted</p>
                      <p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-900">
                        {answeredCount}
                        <span className="text-sm font-medium text-emerald-700"> / {totalQ}</span>
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 }}
                      className="rounded-2xl border border-amber-200/80 bg-amber-50/90 p-4"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-900/80">Left</p>
                      <p className="mt-1 text-2xl font-semibold tabular-nums text-amber-950">{unansweredCount}</p>
                      <p className="text-[11px] font-medium text-amber-800/80">unanswered</p>
                    </motion.div>
                  </div>
                  {markedCount > 0 ? (
                    <div className="rounded-2xl border border-violet-200/70 bg-violet-50/80 px-4 py-3 text-center text-xs font-medium text-violet-900">
                      {markedCount} question{markedCount === 1 ? '' : 's'} marked for review
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitReviewOpen(false);
                      submitNow();
                    }}
                    disabled={submitMutation.isPending}
                    className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition hover:brightness-105 active:scale-[0.99] disabled:opacity-60 sm:flex-1"
                    style={{ backgroundColor: ACCENT, boxShadow: '0 6px 20px -2px rgba(255,87,34,0.45)' }}
                  >
                    {submitMutation.isPending ? 'Submitting…' : 'Submit test'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSubmitReviewOpen(false)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:flex-1"
                  >
                    Continue test
                  </button>
                </div>
              </motion.div>
            </div>
          ) : null}
        </AnimatePresence>

        {/* Navigation overlay (mobile) — orange sheet */}
        <AnimatePresence>
          {isPaletteOpen ? (
            <motion.div
              className="fixed left-0 right-0 z-[55] flex flex-col justify-end md:hidden"
              style={{
                top: 'calc(6.75rem + env(safe-area-inset-top, 0px))',
                bottom: 'calc(4.75rem + env(safe-area-inset-bottom, 0px))',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <button
                type="button"
                className="min-h-0 w-full flex-1 bg-slate-900/30"
                aria-label="Close overlay"
                onClick={() => setIsPaletteOpen(false)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                className="relative max-h-[min(82vh,100%)] w-full shrink-0 overflow-hidden rounded-t-[1.75rem] shadow-[0_-12px_40px_rgba(0,0,0,0.2)]"
                style={{ backgroundColor: ACCENT }}
              >
                <div className="max-h-[min(82vh,100%)] overflow-y-auto px-4 pb-4 pt-3">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/40" />
                  {/* Wireframe: dashed legend box on orange */}
                  <div className="relative mx-auto max-w-lg rounded-2xl border-2 border-dashed border-white/80 bg-white/[0.12] p-4 backdrop-blur-[2px]">
                    <button
                      type="button"
                      onClick={() => setIsPaletteOpen(false)}
                      className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-white shadow-sm transition hover:bg-white/35"
                      aria-label="Close"
                    >
                      <X size={18} strokeWidth={2.5} />
                    </button>
                    <p className="mb-3 pr-11 text-[10px] font-bold uppercase tracking-[0.2em] text-white/85">Legend</p>
                    {overlayLegend}
                  </div>
                  {/* Wireframe: nested light panel — timer top-right + square grid */}
                  <div className="mx-auto mt-4 max-w-lg rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xl shadow-slate-900/10">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-900">Questions</span>
                      <span className="shrink-0 rounded-full border border-slate-200/90 bg-slate-50 px-3 py-1.5 text-xs font-semibold tabular-nums text-slate-800 shadow-sm">
                        <span className="text-slate-500">Timer </span>
                        {timerLabel}
                      </span>
                    </div>
                    {questionGrid('grid grid-cols-5 gap-2 sm:grid-cols-6')}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          <motion.div
            layout
            className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-lg shadow-slate-200/40 ring-1 ring-slate-900/[0.04]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3 md:px-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Q.No{' '}
                <span className="text-base font-semibold text-slate-900">
                  {activeIndex + 1}
                </span>
                <span className="font-medium text-slate-400"> / {totalQ}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {selected !== null ? (
                  <span className="rounded-full bg-[#ff5722]/12 px-3 py-1 text-[11px] font-semibold text-[#c2410c] ring-1 ring-[#ff5722]/20">
                    Option {optionLetter(selected)} selected
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">Unanswered</span>
                )}
                <button
                  type="button"
                  onClick={() => toggleMarkForReview(current._id)}
                  className={[
                    'rounded-full border px-3 py-1 text-[11px] font-semibold transition',
                    markedForReview[current._id]
                      ? 'border-violet-300 bg-violet-100 text-violet-900'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
                  ].join(' ')}
                >
                  {markedForReview[current._id] ? 'Marked' : 'Mark review'}
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Question</p>
              <p className="mt-2 text-base font-medium leading-relaxed text-slate-900 md:text-lg">{current.questionText}</p>

              <div className="mt-6 flex flex-col gap-3">
                {current.options.map((opt, idx) => {
                  const isSelected = selected === idx;
                  const letter = optionLetter(idx);
                  return (
                    <motion.button
                      key={idx}
                      type="button"
                      layout
                      onClick={() => onSelect(current._id, idx)}
                      whileTap={{ scale: 0.99 }}
                      className={[
                        'flex w-full items-stretch gap-3 rounded-2xl border px-3 py-3 text-left transition-all duration-200 md:px-4 md:py-4',
                        isSelected
                          ? 'border-[#ff5722]/50 bg-gradient-to-br from-orange-50 to-amber-50/50 shadow-md shadow-orange-500/10 ring-2 ring-[#ff5722]/25'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm font-bold tabular-nums',
                          isSelected
                            ? 'border-[#ff5722]/40 bg-[#ff5722] text-white shadow-sm'
                            : 'border-slate-200 bg-slate-50 text-slate-700',
                        ].join(' ')}
                        aria-hidden
                      >
                        {letter}
                      </span>
                      <span className="min-w-0 flex-1 self-center text-sm font-medium leading-snug text-slate-800">{opt}</span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-8 hidden grid-cols-3 gap-3 md:grid">
                <button
                  type="button"
                  onClick={() => goToIndex(activeIndex - 1)}
                  disabled={activeIndex === 0}
                  className="rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
                >
                  ← Prev
                </button>
                <button
                  type="button"
                  onClick={() => onClear(current._id)}
                  className="rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Clear
                </button>
                {isLastQuestion ? (
                  <button
                    type="button"
                    onClick={openSubmitReview}
                    className="rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-105"
                    style={{ backgroundColor: ACCENT, boxShadow: '0 6px 20px -2px rgba(255,87,34,0.4)' }}
                  >
                    Finish
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => goToIndex(activeIndex + 1)}
                    className="rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          <div className="hidden rounded-3xl border border-slate-200/90 bg-white p-4 shadow-lg shadow-slate-200/30 lg:block">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Navigator</p>
            <div className="mt-3 rounded-xl border-2 border-dashed border-slate-300/90 bg-slate-50/40 p-3">{desktopLegend}</div>
            <div className="mt-4 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-inner shadow-slate-200/40">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-800">Questions</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-slate-800">
                  <span className="font-medium text-slate-500">Timer </span>
                  {timerLabel}
                </span>
              </div>
              {questionGrid('grid grid-cols-5 gap-2')}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile footer */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] border-t border-slate-200/90 bg-white/95 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => goToIndex(activeIndex - 1)}
            disabled={activeIndex === 0}
            className="rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition active:scale-[0.98] disabled:opacity-35"
          >
            &lt;
          </button>
          <button
            type="button"
            onClick={() => onClear(current._id)}
            className="rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition active:scale-[0.98]"
          >
            Clear
          </button>
          {isLastQuestion ? (
            <button
              type="button"
              onClick={openSubmitReview}
              className="rounded-xl py-3.5 text-sm font-semibold text-white shadow-lg transition active:scale-[0.98]"
              style={{ backgroundColor: ACCENT, boxShadow: '0 6px 18px -2px rgba(255,87,34,0.45)' }}
            >
              Finish
            </button>
          ) : (
            <button
              type="button"
              onClick={() => goToIndex(activeIndex + 1)}
              className="rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition active:scale-[0.98]"
            >
              &gt;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
