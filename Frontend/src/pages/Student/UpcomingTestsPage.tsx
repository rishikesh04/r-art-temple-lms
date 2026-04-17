import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axiosInstance';
import { getApiMessage } from '../../utils/apiMessage';
import {
  ListShell,
  PremiumStrip,
  filterTestsBySubject,
  formatShortDate,
  getPhase,
  getTimeRemaining,
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
  description?: string;
};

type TestsListResponse = {
  success: boolean;
  tests: TestListItem[];
};

export default function UpcomingTestsPage() {
  const [subject, setSubject] = useState<SubjectFilter>('All');

  const { data, isLoading, error } = useQuery({
    queryKey: ['tests'],
    queryFn: async () => {
      const res = await axiosInstance.get('/tests');
      return res.data as TestsListResponse;
    },
  });

  const upcoming = useMemo(() => {
    if (!data?.tests) return [];
    return data.tests
      .filter((t) => getPhase(t.startTime, t.endTime) === 'upcoming')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [data?.tests]);

  const filtered = useMemo(() => filterTestsBySubject(upcoming, subject), [upcoming, subject]);

  const err = error ? getApiMessage(error, 'Could not load tests.') : null;

  return (
    <ListShell
      bannerVariant="orange"
      bannerTitle="Upcoming test"
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
          No upcoming tests in this filter.
        </motion.p>
      ) : (
        <motion.div className="flex flex-col gap-3" variants={listContainer} initial="hidden" animate="show">
          {filtered.map((t) => (
            <PremiumStrip key={t._id} to={`/tests/${t._id}/start`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold tracking-tight text-slate-900">{t.title}</p>
                  <p className="mt-1 text-xs font-medium text-slate-600">
                    {t.subject}
                    {t.chapter ? ` · ${t.chapter}` : ''}
                  </p>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-[#ff5722] bg-orange-50 inline-block px-2 py-0.5 rounded-md border border-orange-100">
                    Starts {getTimeRemaining(t.startTime)}
                  </p>
                  {t.description && (
                    <p className="mt-3 text-[11px] font-medium text-slate-500 leading-relaxed italic border-l-2 border-orange-200 pl-3 italic-font">
                      "{t.description}"
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold text-slate-800">{t.duration} min</p>
                  <p className="text-[11px] font-medium text-slate-500">{t.totalMarks} pts</p>
                </div>
              </div>
            </PremiumStrip>
          ))}
        </motion.div>
      )}
    </ListShell>
  );
}
