import { Link, useParams } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function TestSubmittedPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-[calc(100vh-88px)] px-4 py-10 flex flex-col items-center justify-center max-md:pb-24">
      <div className="w-full max-w-md bg-white border-4 border-brand-black shadow-solid p-8 text-center">
        <div className="text-2xl font-black uppercase tracking-tight">Test submitted successfully</div>
        <p className="mt-4 text-sm font-medium text-brand-black/75 leading-relaxed">
          Your answers are saved. Detailed results and rankings will be available after the test window ends.
        </p>
        {id ? (
          <p className="mt-2 text-xs font-bold text-brand-black/50">
            You can leave this screen safely.
          </p>
        ) : null}
      </div>

      <Link
        to="/dashboard"
        className="mt-8 inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-orange border-2 border-brand-black font-black uppercase shadow-solid-sm hover:-translate-y-1 hover:-translate-x-1 hover:shadow-solid active:translate-y-0 active:translate-x-0 active:shadow-none transition-all"
      >
        <Home size={20} strokeWidth={2.5} aria-hidden />
        Home
      </Link>
    </div>
  );
}
