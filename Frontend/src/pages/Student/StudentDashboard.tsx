import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../utils/axiosInstance';
import MathematicsBro from '../../assets/Mathematics-bro.svg';
import { Link } from 'react-router-dom';

type DashboardResponse = {
  success: boolean;
  data: {
    stats: {
      completedTestsCount: number;
      averageScore: number;
      availableTestsCount: number;
      upcomingTestsCount: number;
    };
    availableTests: Array<{
      _id: string;
      title: string;
      subject: string;
      chapter: string;
      duration: number;
      totalMarks: number;
      startTime: string;
      endTime: string;
    }>;
    upcomingTests: Array<{
      _id: string;
      title: string;
      subject: string;
      chapter: string;
      duration: number;
      totalMarks: number;
      startTime: string;
      endTime: string;
    }>;
    recentAttempts: Array<{
      attemptId: string;
      testTitle: string;
      score: number;
      totalQuestions: number;
      submittedAt: string;
    }>;
  };
};

const formatDateTime = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
};

export default function StudentDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: async () => {
      const res = await axiosInstance.get('/student/dashboard');
      return res.data as DashboardResponse;
    },
  });

  return (
    <div className="min-h-[calc(100vh-88px)] px-4 py-8 relative">
      {/* Static background illustration */}
      <img
        src={MathematicsBro}
        alt=""
        className="pointer-events-none hidden lg:block absolute right-0 bottom-0 w-[560px] max-w-none opacity-20"
      />

      <div className="mx-auto w-full max-w-7xl relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Student Hub</h1>
          <p className="text-brand-black/70 font-medium mt-2">
            Your tests, attempts, and progress in one place.
          </p>
        </div>

        {isLoading ? (
          <div className="w-full h-40 flex items-center justify-center border-4 border-brand-black border-dashed opacity-60 font-bold uppercase animate-pulse">
            Loading Dashboard...
          </div>
        ) : error || !data?.success ? (
          <div className="p-8 bg-red-100 border-4 border-brand-black shadow-solid font-bold text-red-700">
            Failed to load dashboard.
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
              <StatCard label="Completed" value={data.data.stats.completedTestsCount} />
              <StatCard label="Average Score" value={data.data.stats.averageScore} />
              <StatCard label="Available" value={data.data.stats.availableTestsCount} />
              <StatCard label="Upcoming" value={data.data.stats.upcomingTestsCount} />
            </div>

            <div className="mb-6 flex items-center justify-end">
              <Link
                to="/tests"
                className="inline-flex items-center justify-center px-4 py-3 border-2 border-brand-black bg-brand-orange font-black uppercase shadow-solid-sm hover:-translate-y-1 hover:-translate-x-1 hover:shadow-solid active:translate-y-0 active:translate-x-0 active:shadow-none transition-all"
              >
                View All Tests
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SectionCard title="Available Tests">
                {data.data.availableTests.length === 0 ? (
                  <EmptyText>No active tests right now.</EmptyText>
                ) : (
                  <div className="space-y-3">
                    {data.data.availableTests.map((t) => (
                      <Link
                        key={t._id}
                        to={`/tests/${t._id}`}
                        className="block border-2 border-brand-black p-4 bg-white shadow-solid-sm hover:-translate-y-1 hover:-translate-x-1 hover:shadow-solid transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-black uppercase truncate">{t.title}</div>
                            <div className="text-sm font-medium text-brand-black/70 mt-1">
                              {t.subject} • {t.chapter}
                            </div>
                            <div className="text-xs font-bold mt-2">
                              Ends: <span className="font-medium">{formatDateTime(t.endTime)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black">{t.duration} min</div>
                            <div className="text-xs font-bold text-brand-black/70">{t.totalMarks} marks</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Recent Attempts">
                {data.data.recentAttempts.length === 0 ? (
                  <EmptyText>No attempts yet.</EmptyText>
                ) : (
                  <div className="space-y-3">
                    {data.data.recentAttempts.slice(0, 5).map((a) => (
                      <div key={a.attemptId} className="border-2 border-brand-black p-4 bg-white shadow-solid-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-black uppercase truncate">{a.testTitle}</div>
                            <div className="text-sm font-medium text-brand-black/70 mt-1">
                              {formatDateTime(a.submittedAt)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-black text-brand-orange">{a.score}</div>
                            <div className="text-xs font-bold text-brand-black/70">{a.totalQuestions} Q</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border-4 border-brand-black p-5 shadow-solid">
      <div className="text-xs font-bold uppercase tracking-widest text-brand-black/70">{label}</div>
      <div className="mt-3 text-4xl font-black">{value}</div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border-4 border-brand-black shadow-solid overflow-hidden">
      <div className="bg-brand-black text-white p-4 border-b-4 border-brand-black">
        <h2 className="text-lg font-black uppercase tracking-wider">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return <div className="p-6 text-center font-bold uppercase text-brand-black/40">{children}</div>;
}

