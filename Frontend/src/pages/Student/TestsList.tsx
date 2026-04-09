import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import ExamsBro from '../../assets/Exams-bro.svg';
import { getApiMessage } from '../../utils/apiMessage';

type TestListItem = {
  _id: string;
  title: string;
  description?: string;
  classLevel: string;
  subject: 'Math' | 'Science' | string;
  chapter?: string;
  duration: number;
  totalMarks: number;
  startTime: string;
  endTime: string;
  status: 'draft' | 'published' | string;
};

type TestsListResponse = {
  success: boolean;
  count: number;
  tests: TestListItem[];
};

const formatDateTime = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
};

const getPhase = (startTime: string, endTime: string) => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (now < start) return 'upcoming' as const;
  if (now >= start && now < end) return 'active' as const;
  return 'ended' as const;
};

export default function TestsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tests'],
    queryFn: async () => {
      const res = await axiosInstance.get('/tests');
      return res.data as TestsListResponse;
    },
  });
  const errorMessage = error ? getApiMessage(error, 'Failed to load tests.') : null;

  return (
    <div className="min-h-[calc(100vh-88px)] px-4 py-8 relative">
      <img
        src={ExamsBro}
        alt=""
        className="pointer-events-none hidden lg:block absolute right-0 bottom-0 w-[560px] max-w-none opacity-15"
      />

      <div className="mx-auto w-full max-w-7xl relative z-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Tests</h1>
            <p className="text-brand-black/70 font-medium mt-2">
              Only published tests for your class are shown.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="hidden sm:inline-flex items-center justify-center px-4 py-3 border-2 border-brand-black bg-white font-black uppercase shadow-solid-sm hover:-translate-y-1 hover:-translate-x-1 hover:shadow-solid active:translate-y-0 active:translate-x-0 active:shadow-none transition-all"
          >
            Back to Hub
          </Link>
        </div>

        {isLoading ? (
          <div className="w-full h-40 flex items-center justify-center border-4 border-brand-black border-dashed opacity-60 font-bold uppercase animate-pulse">
            Loading Tests...
          </div>
        ) : error || !data?.success ? (
          <div className="p-8 bg-red-100 border-4 border-brand-black shadow-solid font-bold text-red-700">
            {errorMessage || 'Failed to load tests.'}
          </div>
        ) : data.tests.length === 0 ? (
          <div className="p-10 bg-white border-4 border-brand-black shadow-solid text-center font-black uppercase text-brand-black/40">
            No tests found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.tests.map((t) => {
              const phase = getPhase(t.startTime, t.endTime);
              const phaseStyle =
                phase === 'active'
                  ? 'bg-green-400'
                  : phase === 'upcoming'
                    ? 'bg-yellow-400'
                    : 'bg-brand-gray/40';

              return (
                <div key={t._id} className="bg-white border-4 border-brand-black p-6 shadow-solid">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-black uppercase text-xl truncate">{t.title}</div>
                      <div className="mt-2 text-sm font-medium text-brand-black/70">
                        {t.subject}
                        {t.chapter ? ` • ${t.chapter}` : ''}
                      </div>
                    </div>
                    <div className={`px-3 py-1 border-2 border-brand-black shadow-solid-sm text-xs font-black uppercase ${phaseStyle}`}>
                      {phase}
                    </div>
                  </div>

                  {t.description ? (
                    <p className="mt-4 text-sm font-medium text-brand-black/80 line-clamp-2">{t.description}</p>
                  ) : null}

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="border-2 border-brand-black p-3 shadow-solid-sm">
                      <div className="text-xs font-bold uppercase text-brand-black/70">Duration</div>
                      <div className="mt-1 font-black">{t.duration} min</div>
                    </div>
                    <div className="border-2 border-brand-black p-3 shadow-solid-sm">
                      <div className="text-xs font-bold uppercase text-brand-black/70">Marks</div>
                      <div className="mt-1 font-black">{t.totalMarks}</div>
                    </div>
                  </div>

                  <div className="mt-4 text-xs font-bold">
                    <div>Starts: <span className="font-medium">{formatDateTime(t.startTime)}</span></div>
                    <div>Ends: <span className="font-medium">{formatDateTime(t.endTime)}</span></div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Link
                      to={`/tests/${t._id}`}
                      className="flex-1 inline-flex items-center justify-center py-3 bg-white border-2 border-brand-black font-black uppercase shadow-solid-sm hover:-translate-y-1 hover:-translate-x-1 hover:shadow-solid active:translate-y-0 active:translate-x-0 active:shadow-none transition-all"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/tests/${t._id}/attempt`}
                      className="flex-1 inline-flex items-center justify-center py-3 bg-brand-orange border-2 border-brand-black font-black uppercase shadow-solid-sm hover:-translate-y-1 hover:-translate-x-1 hover:shadow-solid active:translate-y-0 active:translate-x-0 active:shadow-none transition-all"
                    >
                      Start
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

