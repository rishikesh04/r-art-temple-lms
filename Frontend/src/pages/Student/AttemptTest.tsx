import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import ExamsBro from '../../assets/Exams-bro.svg';
import { getApiMessage } from '../../utils/apiMessage';

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
  duration: number; // minutes
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

type AttemptDraft = {
  testId: string;
  startedAt: number; // epoch ms
  activeIndex: number;
  answers: Record<string, number | null>;
};

export default function AttemptTestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const startedAtRef = useRef<number>(Date.now());
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
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

  // Restore draft once (if present) when test loads
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

  // If id changes, allow restore for new test
  useEffect(() => {
    hasRestoredRef.current = false;
    setIsTimerReady(false);
    setRemaining(null);
  }, [id]);

  useEffect(() => {
    if (!test) return;
    if (remaining === null) return;
    const timer = window.setInterval(() => {
      setRemaining((prev) => (prev === null ? null : Math.max(0, prev - 1)));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [test?._id, remaining]);

  // Persist draft (answers + navigation + startedAt)
  useEffect(() => {
    if (!test) return;
    if (!draftKey) return;

    const timeout = window.setTimeout(() => {
      const draft: AttemptDraft = {
        testId: test._id,
        startedAt: startedAtRef.current,
        activeIndex,
        answers,
      };
      try {
        localStorage.setItem(draftKey, JSON.stringify(draft));
      } catch {
        // ignore storage failures (quota/private mode)
      }
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [answers, activeIndex, draftKey, test?._id]);

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
      navigate('/dashboard');
    },
  });

  const onSelect = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const onClear = (questionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: null }));
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

  const onSubmitClick = () => {
    if (!test) return;
    if (submitMutation.isPending || submitMutation.isSuccess) return;
    setIsConfirmOpen(true);
  };

  // If timer hits 0, auto-submit once
  useEffect(() => {
    if (!test) return;
    if (!isTimerReady) return;
    if (remaining !== 0) return;
    if (submitMutation.isPending || submitMutation.isSuccess) return;
    submitNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, isTimerReady, test?._id]);

  // Warn before tab close/refresh while attempt is active
  useEffect(() => {
    if (!test) return;
    if (!isTimerReady) return;
    if (submitMutation.isPending || submitMutation.isSuccess) return;
    if (remaining === null) return;
    if (remaining === 0) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // required for Chrome to show confirmation
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isTimerReady, remaining, submitMutation.isPending, submitMutation.isSuccess, test?._id]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-88px)] px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="w-full h-40 flex items-center justify-center border-4 border-brand-black border-dashed opacity-60 font-bold uppercase animate-pulse">
            Loading Test...
          </div>
        </div>
      </div>
    );
  }

  if (error || !test) {
    const msg = error ? getApiMessage(error, 'Failed to load test.') : 'Failed to load test.';
    return (
      <div className="min-h-[calc(100vh-88px)] px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="p-8 bg-red-100 border-4 border-brand-black shadow-solid font-bold text-red-700">
            {msg}
          </div>
          <div className="mt-4">
            <Link to="/tests" className="inline-flex border-2 border-brand-black px-4 py-3 font-black uppercase shadow-solid-sm">
              Back to Tests
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const current = test.questions[activeIndex];
  const selected = current ? (answers[current._id] ?? null) : null;
  const unansweredCount = test.questions.reduce((acc, q) => {
    const v = answers[q._id];
    return v === undefined || v === null ? acc + 1 : acc;
  }, 0);

  return (
    <div className="min-h-[calc(100vh-88px)] px-4 py-6 relative">
      <img
        src={ExamsBro}
        alt=""
        className="pointer-events-none hidden lg:block absolute right-0 bottom-0 w-[520px] max-w-none opacity-10"
      />

      <div className="mx-auto w-full max-w-6xl relative z-10">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase">{test.title}</h1>
            <p className="text-sm font-medium text-brand-black/70 mt-1">
              {test.subject}
              {test.chapter ? ` • ${test.chapter}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="border-4 border-brand-black bg-white shadow-solid-sm px-4 py-2 font-black uppercase">
              Time:{' '}
              <span className="text-brand-orange tabular-nums inline-block w-[5ch] text-right">
                {isTimerReady && remaining !== null ? formatTime(remaining) : '--:--'}
              </span>
            </div>
            <button
              type="button"
              onClick={onSubmitClick}
              disabled={submitMutation.isPending}
              className="px-5 py-3 bg-brand-orange border-2 border-brand-black font-black uppercase shadow-solid-sm hover:-translate-y-1 hover:-translate-x-1 hover:shadow-solid active:translate-y-0 active:translate-x-0 active:shadow-none transition-all disabled:opacity-70"
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>

        {submitMutation.isError ? (
          <div className="mb-4 p-4 bg-red-100 border-2 border-brand-black text-red-700 font-bold shadow-solid-sm">
            {getApiMessage(submitMutation.error, 'Submission failed. Please try again.')}
          </div>
        ) : null}

        {/* Submit confirmation modal */}
        {isConfirmOpen ? (
          <div className="fixed inset-0 z-50">
            <button
              type="button"
              className="absolute inset-0 bg-brand-black/60"
              aria-label="Close submit confirmation"
              onClick={() => setIsConfirmOpen(false)}
            />
            <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white border-4 border-brand-black shadow-solid">
              <div className="bg-brand-black text-white p-4 border-b-4 border-brand-black">
                <div className="font-black uppercase text-lg">Confirm submission</div>
                <div className="text-sm font-medium text-white/80 mt-1">
                  Once submitted, you can’t change answers.
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="border-2 border-brand-black p-4 shadow-solid-sm bg-white">
                  <div className="text-xs font-bold uppercase tracking-widest text-brand-black/70">Unanswered</div>
                  <div className="mt-2 text-2xl font-black">
                    {unansweredCount} / {test.questions.length}
                  </div>
                  <div className="mt-2 text-sm font-medium text-brand-black/70">
                    You can still go back and answer before submitting.
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setIsConfirmOpen(false)}
                    className="flex-1 py-3 bg-white border-2 border-brand-black font-black uppercase shadow-solid-sm"
                  >
                    Continue attempt
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsConfirmOpen(false);
                      submitNow();
                    }}
                    className="flex-1 py-3 bg-brand-orange border-2 border-brand-black font-black uppercase shadow-solid-sm disabled:opacity-70"
                    disabled={submitMutation.isPending}
                  >
                    Submit now
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
          {/* Question card */}
          <div className="bg-white border-4 border-brand-black shadow-solid overflow-hidden">
            <div className="bg-brand-black text-white p-4 border-b-4 border-brand-black flex items-center justify-between">
              <div className="font-black uppercase">
                Question {activeIndex + 1} / {test.questions.length}
              </div>
              {selected !== null ? (
                <div className="text-xs font-black uppercase bg-brand-orange text-brand-black border-2 border-brand-black px-3 py-1 shadow-solid-sm">
                  Selected: {selected + 1}
                </div>
              ) : (
                <div className="text-xs font-black uppercase bg-brand-gray/30 text-white border-2 border-brand-black px-3 py-1 shadow-solid-sm">
                  Not answered
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="text-lg font-medium">{current.questionText}</div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {current.options.map((opt, idx) => {
                  const isSelected = selected === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onSelect(current._id, idx)}
                      className={[
                        'text-left border-2 border-brand-black p-4 font-bold shadow-solid-sm transition-all',
                        isSelected ? 'bg-brand-orange' : 'bg-white hover:bg-brand-gray/10',
                      ].join(' ')}
                    >
                      <div className="text-xs font-black uppercase text-brand-black/70">Option {idx + 1}</div>
                      <div className="mt-1">{opt}</div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                  disabled={activeIndex === 0}
                  className="flex-1 py-3 bg-white border-2 border-brand-black font-black uppercase shadow-solid-sm disabled:opacity-60"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => onClear(current._id)}
                  className="flex-1 py-3 bg-white border-2 border-brand-black font-black uppercase shadow-solid-sm"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIndex((i) => Math.min(test.questions.length - 1, i + 1))}
                  disabled={activeIndex === test.questions.length - 1}
                  className="flex-1 py-3 bg-white border-2 border-brand-black font-black uppercase shadow-solid-sm disabled:opacity-60"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Navigator */}
          <div className="bg-white border-4 border-brand-black shadow-solid p-4">
            <div className="font-black uppercase mb-3">Navigator</div>
            <div className="grid grid-cols-5 gap-2">
              {test.questions.map((q, idx) => {
                const val = answers[q._id];
                const status = val === undefined || val === null ? 'unanswered' : 'answered';
                const bg =
                  idx === activeIndex
                    ? 'bg-brand-black text-white'
                    : status === 'answered'
                      ? 'bg-green-400'
                      : 'bg-white';
                return (
                  <button
                    key={q._id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`h-10 border-2 border-brand-black font-black shadow-solid-sm ${bg}`}
                    aria-label={`Go to question ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 text-xs font-bold text-brand-black/70">
              Green = answered • White = unanswered
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

