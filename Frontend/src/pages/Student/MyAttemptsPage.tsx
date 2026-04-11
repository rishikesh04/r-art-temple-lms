import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axiosInstance';
import { getApiMessage } from '../../utils/apiMessage';
import {
  ListShell,
  PremiumStrip,
  formatShortDate,
  listContainer,
  type SubjectFilter,
} from './StudentListPagesShared';

type MyAttemptsResponse = {
  success: boolean;
  attempts: Array<{
    id: string;
    test?: { _id?: string; title?: string; subject?: string; classLevel?: string; totalMarks?: number } | null;
    submittedAt: string;
    resultAvailable: boolean;
    score: number | null;
    totalQuestions: number | null;
  }>;
};

function filterAttempts(
  attempts: MyAttemptsResponse['attempts'],
  f: SubjectFilter,
): MyAttemptsResponse['attempts'] {
  if (f === 'All') return attempts;
  return attempts.filter((a) => (a.test?.subject || '') === f);
}

export default function MyAttemptsPage() {
  const [subject, setSubject] = useState<SubjectFilter>('All');

  const { data, isLoading, error } = useQuery({
    queryKey: ['myAttempts'],
    queryFn: async () => {
      const res = await axiosInstance.get('/attempts/my-attempts');
      return res.data as MyAttemptsResponse;
    },
  });

  const filtered = useMemo(() => {
    if (!data?.success) return [];
    return filterAttempts(data.attempts, subject);
  }, [data, subject]);

  const err = error ? getApiMessage(error, 'Could not load attempts.') : null;

  return (
    <ListShell
      bannerVariant="emerald"
      bannerTitle="My attempts"
      subjectFilter={subject}
      onSubjectChange={setSubject}
    >
      {isLoading ? (
        <div className="flex h-36 items-center justify-center rounded-2xl border border-dashed border-slate-300/80 text-sm font-medium text-slate-500">
          Loading…
        </div>
      ) : error || !data?.success ? (
        <div className="rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm font-medium text-red-700">{err || 'Failed to load.'}</div>
      ) : filtered.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-slate-200/90 bg-white/80 py-10 text-center text-sm font-medium text-slate-500"
        >
          No attempts in this filter yet.
        </motion.p>
      ) : (
        <motion.div className="flex flex-col gap-3" variants={listContainer} initial="hidden" animate="show">
          {filtered.map((a) => {
            const title = a.test?.title || 'Test';
            const subj = a.test?.subject || '—';
            const marks = a.test?.totalMarks;
            return (
              <PremiumStrip key={a.id} to={`/attempts/${a.id}`} highlight>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold tracking-tight text-slate-900">{title}</p>
                    <p className="mt-1 text-xs font-medium text-slate-600">{subj}</p>
                    <p className="mt-2 text-[11px] font-medium text-slate-500">Submitted {formatShortDate(a.submittedAt)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-semibold tabular-nums text-[#ff5722]">
                      {a.score === null ? '—' : a.score}
                      {a.totalQuestions != null ? (
                        <span className="text-xs font-medium text-slate-500">/{a.totalQuestions}</span>
                      ) : null}
                    </p>
                    {marks != null ? (
                      <p className="text-[11px] font-medium text-slate-500">of {marks} pts</p>
                    ) : (
                      <p className="text-[11px] font-medium text-slate-500">{a.resultAvailable ? 'Final' : 'Live'}</p>
                    )}
                  </div>
                </div>
              </PremiumStrip>
            );
          })}
        </motion.div>
      )}
    </ListShell>
  );
}
