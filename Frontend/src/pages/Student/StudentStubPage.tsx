import { Link, useLocation } from 'react-router-dom';

const META: Record<string, { title: string; description: string }> = {
  '/dashboard/performance': {
    title: 'Performance',
    description: 'This screen will show your full performance analytics. We will connect it next.',
  },
  '/dashboard/live': {
    title: 'Live',
    description: 'This screen will open when you tap Live during an active test window. Coming next.',
  },
  '/dashboard/upcoming-tests': {
    title: 'Upcoming tests',
    description: 'This screen will list upcoming tests in detail. Coming next.',
  },
  '/dashboard/past-tests': {
    title: 'Past tests',
    description: 'This screen will list past tests. Coming next.',
  },
  '/dashboard/my-attempts': {
    title: 'My attempts',
    description: 'This screen will show your attempts hub. Coming next.',
  },
};

export default function StudentStubPage() {
  const { pathname } = useLocation();
  const meta = META[pathname] ?? {
    title: 'Page',
    description: 'Nothing here yet.',
  };

  return (
    <div className="min-h-[calc(100vh-88px)] px-4 py-8">
      <div className="mx-auto max-w-lg">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand-orange mb-6"
        >
          ← Back to home
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{meta.title}</h1>
          <p className="mt-4 text-sm font-medium text-slate-600 leading-relaxed">{meta.description}</p>
        </div>
      </div>
    </div>
  );
}
