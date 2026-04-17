import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import LearningCuate from '../../assets/Learning-cuate.svg';
import MathIllustration from '../../assets/Mathematics-cuate.svg';
import ScienceIllustration from '../../assets/chemistry lab-pana.svg';
import { getApiMessage } from '../../utils/apiMessage';

type StudentQuestion = {
  _id: string;
  questionText: string;
  options: string[];
};

type TestDetails = {
  _id: string;
  title: string;
  description?: string;
  subject: string;
  chapter?: string;
  duration: number;
  totalMarks: number;
  startTime: string;
  endTime: string;
  testType?: 'live' | 'practice';
  questions: StudentQuestion[];
};

type TestDetailsResponse = {
  success: boolean;
  test: TestDetails;
};

const formatDateTime = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const block = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function TestStartPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['test', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await axiosInstance.get(`/tests/${id}`);
      return res.data as TestDetailsResponse;
    },
  });

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/dashboard');
  };

  const errorMessage = error ? getApiMessage(error, 'Failed to load test.') : null;
  const test = data?.success ? data.test : null;
  const isPractice = test?.testType === 'practice';

  return (
    <div className="min-h-[calc(100vh-88px)] bg-gradient-to-b from-slate-50 to-slate-100/60">
      <div className="mx-auto max-w-lg px-4 pb-36 pt-5 md:max-w-2xl md:pb-28">
        {/* Go back */}
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
          <button
            type="button"
            onClick={goBack}
            className="group mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-900/[0.04] backdrop-blur-sm transition hover:border-slate-300 hover:bg-white hover:shadow-md hover:text-slate-900"
          >
            <ArrowLeft
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
              strokeWidth={2.2}
              aria-hidden
            />
            Go back
          </button>
        </motion.div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center rounded-3xl border border-dashed border-slate-300/80 text-sm font-medium text-slate-500">
            Loading…
          </div>
        ) : error || !test ? (
          <div className="rounded-2xl border border-red-200/80 bg-red-50/90 p-5 text-sm font-medium text-red-800">
            {errorMessage || 'Could not load this test.'}
            <div className="mt-4">
              <Link to="/dashboard" className="font-semibold text-[#ff5722] underline-offset-2 hover:underline">
                Return home
              </Link>
            </div>
          </div>
        ) : (
          <motion.div className="flex flex-col gap-5" variants={container} initial="hidden" animate="show">
            {/* Illustration */}
            <motion.div
              variants={block}
              className="overflow-hidden rounded-3xl border-2 border-dashed border-slate-300/70 bg-white/80 p-6 shadow-sm ring-1 ring-slate-900/[0.03]"
            >
              <div className="flex min-h-[11rem] items-center justify-center md:min-h-[14rem]">
                <img
                  src={
                    test.subject.toLowerCase().includes('math') ? MathIllustration :
                    test.subject.toLowerCase().includes('sci') ? ScienceIllustration :
                    LearningCuate
                  }
                  alt=""
                  className="max-h-44 w-full max-w-xs object-contain md:max-h-52"
                />
              </div>
            </motion.div>

            {/* Test details */}
            <motion.section
              variants={block}
              className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-md shadow-slate-200/50 ring-1 ring-slate-900/[0.04]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Test details</p>
              <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">{test.title}</h1>
              <p className="mt-1 text-sm font-medium text-slate-600">
                {test.subject}
                {test.chapter ? ` · ${test.chapter}` : ''}
              </p>
              {test.description ? (
                <p className="mt-4 text-sm leading-relaxed text-slate-600">{test.description}</p>
              ) : null}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <DetailPill label="Duration" value={`${test.duration} min`} />
                <DetailPill label="Total marks" value={String(test.totalMarks)} />
                <DetailPill label="Questions" value={String(test.questions.length)} />
                <DetailPill label={isPractice ? "Access" : "Ends"} value={isPractice ? "Available 24/7" : formatDateTime(test.endTime)} />
              </div>
            </motion.section>

            {/* Instructions */}
            <motion.section
              variants={block}
              className="rounded-3xl border-2 border-dashed border-slate-300/70 bg-slate-50/90 p-5 ring-1 ring-slate-900/[0.03]"
            >
              <div className="flex gap-2 items-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Instructions</p>
                {isPractice && <span className="bg-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ml-auto">Practice Mode</span>}
              </div>
              <ul className="mt-3 space-y-2.5 text-sm font-medium leading-relaxed text-slate-600">
                <li className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#ff5722]" aria-hidden />
                  One correct option per question. You can revisit and change answers until you submit.
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#ff5722]" aria-hidden />
                  {isPractice ? 'This is a practice test. You can attempt it as many times as you like for mastery.' : 'The timer runs while you are in the attempt—submit before time runs out.'}
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#ff5722]" aria-hidden />
                  Use the question palette to jump between items and mark for review.
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#ff5722]" aria-hidden />
                  {isPractice ? 'Results and score projections are provided immediately after submission.' : 'After submit, full results may unlock when the test window ends.'}
                </li>
              </ul>
            </motion.section>
          </motion.div>
        )}
      </div>

      {/* Start CTA */}
      {test ? (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur-md md:static md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-0"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32, delay: 0.15 }}
        >
          <div className="mx-auto max-w-lg md:max-w-2xl">
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Link
                to={`/tests/${test._id}/attempt`}
                className="flex w-full items-center justify-center rounded-2xl bg-[#ff5722] py-4 text-base font-semibold tracking-tight text-white shadow-lg shadow-orange-500/35 ring-1 ring-white/20 transition hover:brightness-[1.03] md:py-3.5"
              >
                Start
              </Link>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}

function DetailPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900 leading-snug">{value}</p>
    </div>
  );
}
