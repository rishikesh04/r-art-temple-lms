import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { getApiMessage } from '../../utils/apiMessage';
import Locked403 from '../../assets/403 Error Forbidden-pana.svg';
import Review404 from '../../assets/Time management-rafiki.svg';


type AttemptAnswer = {
  questionId: string | null;
  questionText: string;
  options: string[];
  selectedAnswer: number | null;
  correctAnswer: number | null;
  isCorrect: boolean;
  explanation: string;
  subject: string;
  chapter: string;
  difficulty: string;
};

type AttemptDetails = {
  attemptId: string;
  testTitle: string;
  subject: string | null;
  score: number;
  totalQuestions: number;
  accuracy: number;
  submittedAt: string;
  answers: AttemptAnswer[];
};

type AttemptDetailsResponse = {
  success: boolean;
  data: AttemptDetails;
};

const formatDateTime = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
};

export default function AttemptResultPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['attempt', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await axiosInstance.get(`/attempts/my-attempts/${id}`);
      return res.data as AttemptDetailsResponse;
    },
  });

  const errorMessage = error ? getApiMessage(error, 'Failed to load attempt result.') : null;

  return (
    <div className="min-h-[calc(100vh-88px)] px-4 py-8 relative">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center px-4 py-3 border-2 border-brand-black bg-white font-black uppercase shadow-solid-sm hover:-translate-y-1 hover:-translate-x-1 hover:shadow-solid active:translate-y-0 active:translate-x-0 active:shadow-none transition-all"
          >
            Back to Hub
          </Link>

          <Link
            to="/tests"
            className="inline-flex items-center justify-center px-4 py-3 border-2 border-brand-black bg-brand-orange font-black uppercase shadow-solid-sm hover:-translate-y-1 hover:-translate-x-1 hover:shadow-solid active:translate-y-0 active:translate-x-0 active:shadow-none transition-all"
          >
            Tests
          </Link>
        </div>

        {isLoading ? (
          <div className="w-full h-40 flex items-center justify-center border-4 border-brand-black border-dashed opacity-60 font-bold uppercase animate-pulse">
            Loading Result...
          </div>
        ) : error || !data?.success ? (
          <div className="bg-white border-4 border-brand-black shadow-solid overflow-hidden">
            <div className="bg-brand-black text-white p-4 border-b-4 border-brand-black">
              <div className="font-black uppercase text-lg">Result unavailable</div>
              <div className="text-sm font-medium text-white/80 mt-1">
                {errorMessage || 'Failed to load attempt result.'}
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <img
                src={(errorMessage || '').toLowerCase().includes('locked') ? Locked403 : Review404}
                alt=""
                className="w-full max-w-md mx-auto opacity-90"
              />
              <div className="space-y-3">
              <p className="text-3xl font-black text-center" style={{ color: '#ff5722' }}>
  Result will be available when test ends
</p>

                <div className="font-black uppercase text-xl">What this means</div>
                <p className="font-medium text-brand-black/70">
                  This platform is time-locked by the backend for fairness. When the test ends, the full review
                  (answers + explanations) becomes available.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/dashboard"
                    className="flex-1 inline-flex items-center justify-center py-3 bg-white border-2 border-brand-black font-black uppercase shadow-solid-sm"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    to="/tests"
                    className="flex-1 inline-flex items-center justify-center py-3 bg-brand-orange border-2 border-brand-black font-black uppercase shadow-solid-sm"
                  >
                    Explore Tests
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ResultView attempt={data.data} />
        )}
      </div>
    </div>
  );
}

function ResultView({ attempt }: { attempt: AttemptDetails }) {
  return (
    <div className="space-y-6">
      <div className="bg-white border-4 border-brand-black shadow-solid overflow-hidden">
        <div className="bg-brand-black text-white p-5 border-b-4 border-brand-black">
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{attempt.testTitle}</h1>
          <p className="mt-2 text-sm font-medium text-white/80">
            {attempt.subject ? attempt.subject : '—'} • Submitted {formatDateTime(attempt.submittedAt)}
          </p>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Stat label="Score" value={`${attempt.score} / ${attempt.totalQuestions}`} />
          <Stat label="Accuracy" value={`${attempt.accuracy}%`} />
          <Stat label="Questions" value={`${attempt.totalQuestions}`} />
        </div>
      </div>

      <div className="bg-white border-4 border-brand-black shadow-solid overflow-hidden">
        <div className="bg-brand-black text-white p-4 border-b-4 border-brand-black">
          <div className="font-black uppercase text-lg">Review</div>
          <div className="text-sm font-medium text-white/80 mt-1">
            Answers and explanations are shown because the test has ended (backend-enforced).
          </div>
        </div>

        <div className="p-5 space-y-4">
          {attempt.answers.map((a, idx) => (
            <div key={`${a.questionId ?? idx}`} className="border-2 border-brand-black shadow-solid-sm overflow-hidden">
              <div className="p-4 flex items-start justify-between gap-3 bg-white">
                <div className="min-w-0">
                  <div className="text-xs font-black uppercase text-brand-black/70">Q{idx + 1}</div>
                  <div className="mt-2 font-medium">{a.questionText}</div>
                  <div className="mt-2 text-xs font-bold text-brand-black/60">
                    {a.chapter ? a.chapter : '—'}
                    {a.difficulty ? ` • ${a.difficulty}` : ''}
                  </div>
                </div>
                <div
                  className={[
                    'px-3 py-1 border-2 border-brand-black shadow-solid-sm text-xs font-black uppercase',
                    a.isCorrect ? 'bg-green-400' : 'bg-red-200',
                  ].join(' ')}
                >
                  {a.isCorrect ? 'Correct' : 'Wrong'}
                </div>
              </div>

              <div className="p-4 border-t-2 border-brand-black/20 bg-brand-gray/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="border-2 border-brand-black/20 bg-white p-3">
                    <div className="text-xs font-black uppercase text-brand-black/70">Your answer</div>
                    <div className="mt-1 font-bold">
                      {a.selectedAnswer === null || a.selectedAnswer === undefined
                        ? 'Not answered'
                        : a.options[a.selectedAnswer] ?? `Option ${a.selectedAnswer + 1}`}
                    </div>
                  </div>
                  <div className="border-2 border-brand-black/20 bg-white p-3">
                    <div className="text-xs font-black uppercase text-brand-black/70">Correct answer</div>
                    <div className="mt-1 font-bold">
                      {a.correctAnswer === null || a.correctAnswer === undefined
                        ? '—'
                        : a.options[a.correctAnswer] ?? `Option ${a.correctAnswer + 1}`}
                    </div>
                  </div>
                </div>

                {a.explanation ? (
                  <div className="mt-3 border-2 border-brand-black/20 bg-white p-3">
                    <div className="text-xs font-black uppercase text-brand-black/70">Explanation</div>
                    <div className="mt-1 font-medium text-brand-black/80 whitespace-pre-line">{a.explanation}</div>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-brand-black p-4 shadow-solid-sm bg-white">
      <div className="text-xs font-bold uppercase tracking-widest text-brand-black/70">{label}</div>
      <div className="mt-2 text-2xl font-black">{value}</div>
    </div>
  );
}

