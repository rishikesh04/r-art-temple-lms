import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import LearningCuate from '../../assets/Learning-cuate.svg';
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

export default function TestDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['test', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await axiosInstance.get(`/tests/${id}`);
      return res.data as TestDetailsResponse;
    },
  });

  const errorMessage = error ? getApiMessage(error, 'Failed to load test details.') : null;

  return (
    <div className="min-h-[calc(100vh-88px)] px-4 py-8 relative">
      <img
        src={LearningCuate}
        alt=""
        className="pointer-events-none hidden lg:block absolute right-0 bottom-0 w-[560px] max-w-none opacity-15"
      />

      <div className="mx-auto w-full max-w-5xl relative z-10">
        <div className="mb-6">
          <Link
            to="/tests"
            className="inline-flex items-center justify-center px-4 py-3 border-2 border-brand-black bg-white font-black uppercase shadow-solid-sm hover:-translate-y-1 hover:-translate-x-1 hover:shadow-solid active:translate-y-0 active:translate-x-0 active:shadow-none transition-all"
          >
            Back to Tests
          </Link>
        </div>

        {isLoading ? (
          <div className="w-full h-40 flex items-center justify-center border-4 border-brand-black border-dashed opacity-60 font-bold uppercase animate-pulse">
            Loading Test...
          </div>
        ) : error || !data?.success ? (
          <div className="p-8 bg-red-100 border-4 border-brand-black shadow-solid font-bold text-red-700">
            {errorMessage || 'Failed to load test details.'}
          </div>
        ) : (
          <div className="bg-white border-4 border-brand-black shadow-solid overflow-hidden">
            <div className="bg-brand-black text-white p-5 border-b-4 border-brand-black">
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{data.test.title}</h1>
              <p className="mt-2 text-sm font-medium text-white/80">
                {data.test.subject}
                {data.test.chapter ? ` • ${data.test.chapter}` : ''}
              </p>
            </div>

            <div className="p-5">
              {data.test.description ? (
                <p className="text-sm font-medium text-brand-black/80">{data.test.description}</p>
              ) : null}

              <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoTile label="Duration" value={`${data.test.duration} min`} />
                <InfoTile label="Marks" value={`${data.test.totalMarks}`} />
                <InfoTile label="Questions" value={`${data.test.questions.length}`} />
                <InfoTile label="Status" value="Published" />
              </div>

              <div className="mt-5 text-xs font-bold">
                <div>Starts: <span className="font-medium">{formatDateTime(data.test.startTime)}</span></div>
                <div>Ends: <span className="font-medium">{formatDateTime(data.test.endTime)}</span></div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  to={`/tests/${data.test._id}/attempt`}
                  className="flex-1 inline-flex items-center justify-center py-3 bg-brand-orange border-2 border-brand-black font-black uppercase shadow-solid-sm hover:-translate-y-1 hover:-translate-x-1 hover:shadow-solid active:translate-y-0 active:translate-x-0 active:shadow-none transition-all"
                >
                  Start Attempt
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-brand-black p-4 shadow-solid-sm bg-white">
      <div className="text-xs font-bold uppercase tracking-widest text-brand-black/70">{label}</div>
      <div className="mt-2 text-xl font-black">{value}</div>
    </div>
  );
}

