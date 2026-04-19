import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

export type SubjectFilter = 'Math' | 'Science' | 'All';

export const listContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};

export const listItem = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function getPhase(startTime: string, endTime: string) {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (now < start) return 'upcoming' as const;
  if (now >= start && now < end) return 'active' as const;
  return 'ended' as const;
}

export function formatShortDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function getTimeRemaining(startTime: string) {
  const diff = new Date(startTime).getTime() - Date.now();
  if (diff <= 0) return 'Starting now';

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `in ${days} ${days === 1 ? 'day' : 'days'}`;
  if (hours > 0) return `in ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  if (minutes > 0) return `in ${minutes} mins`;
  return 'any moment now';
}

export function filterTestsBySubject<T extends { subject: string }>(items: T[], f: SubjectFilter): T[] {
  if (f === 'All') return items;
  return items.filter((t) => t.subject === f);
}

export function attemptTestIdString(test: { _id?: string; id?: string } | null | undefined) {
  if (!test || typeof test !== 'object') return null;
  const raw = test._id ?? test.id;
  return raw != null ? String(raw) : null;
}

export function SubjectTabs({
  value,
  onChange,
}: {
  value: SubjectFilter;
  onChange: (v: SubjectFilter) => void;
}) {
  const opts: SubjectFilter[] = ['Math', 'Science', 'All'];
  return (
    <div className="mt-5 flex gap-2">
      {opts.map((s) => {
        const active = value === s;
        return (
          <motion.button
            key={s}
            type="button"
            layout
            onClick={() => onChange(s)}
            whileTap={{ scale: 0.97 }}
            className={[
              'flex-1 rounded-full py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors',
              active
                ? 'bg-[#ff5722] text-white shadow-md shadow-orange-500/30 ring-1 ring-orange-400/40'
                : 'border border-slate-200/90 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50',
            ].join(' ')}
          >
            {s}
          </motion.button>
        );
      })}
    </div>
  );
}

export function TitleBanner({
  children,
  variant,
}: {
  children: ReactNode;
  variant: 'orange' | 'outline' | 'emerald';
}) {
  const base = 'mb-1 rounded-2xl px-4 py-4 text-center';
  if (variant === 'orange') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`${base} bg-[#ff5722] text-[15px] font-semibold tracking-tight text-white shadow-lg shadow-orange-500/30 ring-1 ring-white/15`}
      >
        {children}
      </motion.div>
    );
  }
  if (variant === 'emerald') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`${base} border border-emerald-200/90 bg-emerald-50/95 text-[15px] font-semibold tracking-tight text-emerald-950 shadow-sm`}
      >
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`${base} border border-dashed border-slate-300/90 bg-slate-100/80 text-[15px] font-semibold tracking-tight text-slate-800`}
    >
      {children}
    </motion.div>
  );
}

export function HomeFab() {
  return (
    <motion.div
      className="fixed bottom-8 left-1/2 z-30 -translate-x-1/2 w-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28, delay: 0.12 }}
    >
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Link
          to="/dashboard"
          className="flex items-center justify-center gap-3 rounded-2xl bg-[#ff5722] px-8 py-4 text-sm font-bold text-white shadow-2xl shadow-orange-500/40 ring-1 ring-white/20 backdrop-blur-md transition-all hover:brightness-105"
        >
          <Home className="h-5 w-5 text-white" strokeWidth={2.5} aria-hidden />
          <span>Back to Home</span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

type StripProps = {
  to: string;
  highlight?: boolean;
  children: ReactNode;
};

export function PremiumStrip({ to, highlight, children }: StripProps) {
  return (
    <motion.div variants={listItem} className="will-change-transform">
      <Link
        to={to}
        className={[
          'block rounded-2xl border p-4 transition-all duration-300',
          highlight
            ? 'border-[#ff5722]/45 bg-gradient-to-br from-orange-50 via-white to-amber-50/40 shadow-md shadow-orange-500/15 ring-1 ring-[#ff5722]/20 hover:shadow-lg hover:ring-[#ff5722]/30'
            : 'border-slate-200/90 bg-white shadow-sm hover:border-slate-300 hover:shadow-md',
        ].join(' ')}
      >
        {children}
      </Link>
    </motion.div>
  );
}

export function ListShell({
  bannerVariant,
  bannerTitle,
  subjectFilter,
  onSubjectChange,
  children,
}: {
  bannerVariant: 'orange' | 'outline' | 'emerald';
  bannerTitle: string;
  subjectFilter: SubjectFilter;
  onSubjectChange: (v: SubjectFilter) => void;
  children: ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-88px)] bg-gradient-to-b from-slate-50/80 to-slate-100/40 pb-32 pt-6">
      <div className="mx-auto w-full max-w-lg px-4">
        <TitleBanner variant={bannerVariant}>{bannerTitle}</TitleBanner>
        <SubjectTabs value={subjectFilter} onChange={onSubjectChange} />
        <div className="mt-6">{children}</div>
      </div>
      <HomeFab />
    </div>
  );
}
