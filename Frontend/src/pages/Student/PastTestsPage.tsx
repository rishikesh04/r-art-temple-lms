import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axiosInstance';
import { getApiMessage } from '../../utils/apiMessage';
import {
  ListShell,
  PremiumStrip,
  attemptTestIdString,
  filterTestsBySubject,
  formatShortDate,
  getPhase,
  listContainer,
  type SubjectFilter,
} from './StudentListPagesShared';

type TestListItem = {
  _id: string;
  title: string;
  subject: string;
  chapter?: string;
  duration: number;
  totalMarks: number;
  startTime: string;
  endTime: string;
};

type TestsListResponse = {
  success: boolean;
  tests: TestListItem[];
};

type MyAttemptsResponse = {
  success: boolean;
  attempts: Array<{
    id: string;
    test?: { _id?: string; id?: string; title?: string; subject?: string } | null;
  }>;
};

export default function PastTestsPage() {
  const [subject, setSubject] = useState<SubjectFilter>('All');

  const { data: testsData, isLoading: testsLoading, error: testsError } = useQuery({
    queryKey: ['tests'],
    queryFn: async () => {
      const res = await axiosInstance.get('/tests', { params: { nopagination: 'true' } });
      return res.data as TestsListResponse;
    },
  });

  const { data: attemptsData } = useQuery({
    queryKey: ['myAttempts'],
    queryFn: async () => {
      const res = await axiosInstance.get('/attempts/my-attempts', { params: { nopagination: 'true' } });
      return res.data as MyAttemptsResponse;
    },
  });

  const attemptByTestId = useMemo(() => {
    const m = new Map<string, string>();
    if (!attemptsData?.success) return m;
    for (const a of attemptsData.attempts) {
      const tid = attemptTestIdString(a.test ?? null);
      if (tid) m.set(tid, a.id);
    }
    return m;
  }, [attemptsData]);

  const pastTests = useMemo(() => {
    if (!testsData?.tests) return [];
    return testsData.tests.filter((t) => getPhase(t.startTime, t.endTime) === 'ended');
  }, [testsData?.tests]);

  const filtered = useMemo(() => filterTestsBySubject(pastTests, subject), [pastTests, subject]);

  const err = testsError ? getApiMessage(testsError, 'Could not load tests.') : null;
  const loading = testsLoading;

  return (
    <ListShell
      bannerVariant="outline"
      bannerTitle="Past test"
      subjectFilter={subject}
      onSubjectChange={setSubject}
    >
      {loading ? (
        <div className="flex h-36 items-center justify-center rounded-2xl border border-dashed border-slate-300/80 text-sm font-medium text-slate-500">
          Loading…
        </div>
      ) : testsError || !testsData?.success ? (
        <div className="rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm font-medium text-red-700">{err || 'Failed to load.'}</div>
      ) : filtered.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-slate-200/90 bg-white/80 py-10 text-center text-sm font-medium text-slate-500"
        >
          No past tests in this filter.
        </motion.p>
      ) : (
        <motion.div className="flex flex-col gap-3" variants={listContainer} initial="hidden" animate="show">
          {filtered.map((t) => {
            const attemptId = attemptByTestId.get(t._id);
            const highlight = Boolean(attemptId);
            const to = highlight ? `/attempts/${attemptId}` : `/tests/${t._id}`;
            return (
              <PremiumStrip key={t._id} to={to} highlight={highlight}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-[15px] font-semibold tracking-tight text-slate-900">{t.title}</p>
                      {highlight ? (
                        <span className="shrink-0 rounded-full bg-[#ff5722]/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#c2410c] ring-1 ring-[#ff5722]/25">
                          Attempted
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-600">
                      {t.subject}
                      {t.chapter ? ` · ${t.chapter}` : ''}
                    </p>
                    <p className="mt-2 text-[11px] font-medium text-slate-500">Ended {formatShortDate(t.endTime)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold text-slate-800">{t.totalMarks} pts</p>
                    <p className="text-[11px] font-medium text-slate-500">{highlight ? 'View result' : 'Details'}</p>
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
