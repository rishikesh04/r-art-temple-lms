import { Routes, Route, Link, NavLink, useLocation, matchPath } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { Menu, UserCircle, LogOut, ChevronDown, LogIn, UserPlus, LayoutDashboard, ClipboardList, BarChart3, Home as HomeIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const AdminLayout = lazy(() => import('./pages/Admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const StudentManagement = lazy(() => import('./pages/Admin/StudentManagement'));
const AdminTestsManager = lazy(() => import('./pages/Admin/AdminTestsManager'));
const AdminQuestionBank = lazy(() => import('./pages/Admin/AdminQuestionBank'));
const AdminTestResults = lazy(() => import('./pages/Admin/AdminTestResults'));
import ErrorBoundary from './components/ErrorBoundary';
const StudentDashboard = lazy(() => import('./pages/Student/StudentDashboard'));
const TestsList = lazy(() => import('./pages/Student/TestsList'));
const TestDetailsPage = lazy(() => import('./pages/Student/TestDetails'));
const TestStartPage = lazy(() => import('./pages/Student/TestStartPage'));
const AttemptTestPage = lazy(() => import('./pages/Student/AttemptTest'));
const AttemptResultPage = lazy(() => import('./pages/Student/AttemptResult'));
const StudentLeaderboardPage = lazy(() => import('./pages/Student/Leaderboard'));
const TestSubmittedPage = lazy(() => import('./pages/Student/TestSubmitted'));
const StudentStubPage = lazy(() => import('./pages/Student/StudentStubPage'));
const UpcomingTestsPage = lazy(() => import('./pages/Student/UpcomingTestsPage'));
const PastTestsPage = lazy(() => import('./pages/Student/PastTestsPage'));
const MyAttemptsPage = lazy(() => import('./pages/Student/MyAttemptsPage'));
const PerformancePage = lazy(() => import('./pages/Student/PerformancePage'));
const SubjectFoldersPage = lazy(() => import('./pages/Student/SubjectFoldersPage'));

function firstNameFromFullName(name: string) {
  const t = name.trim();
  if (!t) return '';
  return t.split(/\s+/)[0] ?? t;
}

function App() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const hideGlobalChrome = Boolean(matchPath('/tests/:id/attempt', location.pathname)) ||
    Boolean(matchPath('/tests/:id/submitted', location.pathname)) ||
    Boolean(matchPath('/tests/:testId/leaderboard', location.pathname)) ||
    Boolean(matchPath('/attempts/:id', location.pathname));
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Prevent background page from shifting/scrolling when menu is open
  useEffect(() => {
    if (!isMobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobileNavOpen]);

  return (
    <div className="min-h-screen flex flex-col selection:bg-brand-orange/20 selection:text-slate-900">

      {/* NAVBAR — hidden during timed attempt (immersive test UI only) */}
      {!hideGlobalChrome ? (
        <nav className="w-full bg-white/95 backdrop-blur-sm border-b border-slate-200/90 px-4 md:px-12 py-3 md:py-4 z-50 sticky top-0">
          <div className="mx-auto w-full max-w-7xl relative">
            {user?.role === 'student' ? (
              <>
                {/* Mobile student: menu | logo | first name */}
                <div className="md:hidden grid grid-cols-[auto_1fr_auto] items-center gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => setIsMobileNavOpen((v) => !v)}
                    className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm text-slate-800"
                    aria-label="Open menu"
                  >
                    <Menu size={20} />
                  </button>
                  <Link
                    to="/dashboard"
                    className="flex min-w-0 items-center justify-center gap-2 group"
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    <div className="h-9 w-9 shrink-0 rounded-xl bg-brand-orange border border-orange-700/15 shadow-sm flex items-center justify-center font-bold text-base text-white transition-transform group-hover:-translate-y-0.5">
                      R
                    </div>
                    <span className="truncate font-semibold text-[15px] tracking-tight text-slate-900">Art Temple</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen((o) => !o)}
                    className="flex max-w-[min(7.25rem,30vw)] items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-1.5 py-1 shadow-sm"
                    aria-expanded={isProfileOpen}
                    aria-haspopup="true"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200 font-semibold text-sm uppercase text-slate-800">
                      {user.name.charAt(0)}
                    </span>
                    <span className="truncate text-left text-[11px] font-semibold uppercase tracking-tight text-slate-700">
                      {firstNameFromFullName(user.name)}
                    </span>
                  </button>
                </div>

                {/* Desktop student */}
                <div className="hidden md:flex items-center justify-between gap-6 w-full">
                  <Link to="/dashboard" className="flex items-center gap-3 group md:flex-1">
                    <div className="w-10 h-10 bg-brand-orange border border-orange-700/15 shadow-sm flex items-center justify-center font-bold text-xl text-white transition-transform group-hover:-translate-y-0.5 rounded-xl">
                      R
                    </div>
                    <span className="font-semibold text-2xl tracking-tight text-slate-900">Art Temple</span>
                  </Link>
                  <div className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
                    <Link to="/" className="hover:text-brand-orange transition-colors">
                      Platform
                    </Link>
                    <NavLink
                      to="/dashboard"
                      className={({ isActive }) =>
                        `rounded-lg px-3 py-2 transition-colors ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
                      }
                    >
                      Hub
                    </NavLink>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen((o) => !o)}
                    className="h-12 inline-flex items-center gap-2 px-4 bg-slate-50 border border-slate-200 shadow-sm hover:bg-slate-100/80 transition-all rounded-full"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 font-semibold text-lg uppercase text-slate-800 shrink-0">
                      {user.name.charAt(0)}
                    </span>
                    <span className="max-w-[10rem] truncate font-medium text-sm text-slate-800">{user.name}</span>
                    <ChevronDown size={16} className="text-slate-500 shrink-0" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {user && location.pathname === '/' && (
                    <Link
                      to={user.role === 'admin' ? '/admin' : '/dashboard'}
                      className="w-10 h-10 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm text-brand-orange"
                    >
                      <HomeIcon size={18} />
                    </Link>
                  )}
                  <Link
                    to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/'}
                    className="flex min-w-0 items-center justify-center gap-2 group"
                  >
                    <div className="h-9 w-9 shrink-0 rounded-xl bg-brand-orange border border-orange-700/15 shadow-sm flex items-center justify-center font-bold text-base text-white transition-transform group-hover:-translate-y-0.5">
                      R
                    </div>
                  </Link>
                </div>

                <div className="flex items-center gap-3 md:gap-6">
                  <div className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
                    {user && location.pathname === '/' && (
                      <Link
                        to={user.role === 'admin' ? '/admin' : '/dashboard'}
                        className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-brand-orange hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                      >
                        <HomeIcon size={18} />
                      </Link>
                    )}
                    {user && (
                      <NavLink
                        to={user.role === 'admin' ? '/admin' : '/dashboard'}
                        className={({ isActive }) =>
                          `rounded-lg px-3 py-2 transition-colors ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
                        }
                      >
                        Hub
                      </NavLink>
                    )}
                  </div>

                  {!user ? (
                    <>
                      <div className="hidden md:flex items-center gap-2">
                        <Link
                          to="/login"
                          className="h-11 inline-flex items-center justify-center rounded-xl px-5 bg-white border border-slate-200 shadow-sm text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                        >
                          Sign in
                        </Link>
                        <Link
                          to="/signup"
                          className="h-11 inline-flex items-center justify-center rounded-xl px-5 bg-brand-orange border border-orange-700/15 shadow-sm text-sm font-semibold text-white transition hover:brightness-105"
                        >
                          Sign up
                        </Link>
                      </div>
                      <div className="md:hidden flex items-center gap-2">
                        <Link
                          to="/login"
                          className="h-11 inline-flex items-center justify-center px-4 border border-slate-200 shadow-sm bg-white font-semibold uppercase text-xs tracking-wide rounded-xl text-slate-800"
                        >
                          <LogIn size={16} />
                          <span className="ml-2">Login</span>
                        </Link>
                        <Link
                          to="/signup"
                          className="h-11 inline-flex items-center justify-center px-4 border border-orange-700/15 shadow-sm bg-brand-orange font-semibold uppercase text-xs tracking-wide rounded-xl text-white"
                        >
                          <UserPlus size={16} />
                          <span className="ml-2">Signup</span>
                        </Link>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsProfileOpen((o) => !o)}
                      className="h-11 md:h-12 inline-flex items-center gap-2 px-2 sm:px-3 md:px-4 bg-slate-50 border border-slate-200 shadow-sm hover:bg-slate-100/80 transition-all rounded-full"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 font-semibold text-lg text-slate-800 uppercase shrink-0">
                        {user.name.charAt(0)}
                      </span>
                      <span className="hidden md:inline max-w-[10rem] truncate font-medium text-sm text-slate-800">
                        {user.name}
                      </span>
                      <ChevronDown size={16} className="text-slate-500 hidden sm:block" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Profile dropdown (logged-in: one panel, shared triggers) */}
            {user ? (
              <AnimatePresence>
                {isProfileOpen ? (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} aria-hidden />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 shadow-xl z-50 flex flex-col rounded-2xl overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-100 bg-slate-50/90">
                        <p className="font-semibold text-base truncate text-slate-900">{user.name}</p>
                        <p className="font-medium text-sm text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 bg-slate-900 text-white text-[10px] font-semibold uppercase tracking-wide rounded-md">
                          {user.role}
                        </span>
                      </div>
                      <div className="p-2">
                        <button
                          type="button"
                          className="w-full flex items-center gap-3 px-4 py-3 font-medium text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left rounded-lg"
                        >
                          <UserCircle size={18} /> Account Details
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 font-medium text-sm text-red-600 hover:bg-red-50 transition-colors mt-1 text-left rounded-lg"
                        >
                          <LogOut size={18} /> Disconnect
                        </button>
                      </div>
                    </motion.div>
                  </>
                ) : null}
              </AnimatePresence>
            ) : null}
          </div>
        </nav>
      ) : null}

      {/* Mobile drawer (students: left sheet + logout; others: compact sheet) */}
      {!hideGlobalChrome ? (
        <AnimatePresence>
          {isMobileNavOpen ? (
            <div className="md:hidden fixed inset-0 z-40">
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/40"
                aria-label="Close menu"
                onClick={() => setIsMobileNavOpen(false)}
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.22 }}
                className="absolute left-0 top-0 bottom-0 w-[min(20rem,88vw)] bg-white border-r border-slate-200 shadow-xl flex flex-col pt-[5.25rem]"
              >
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
                  <Link
                    to="/"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 font-semibold text-sm text-slate-800 shadow-sm bg-white"
                  >
                    Platform
                    <LayoutDashboard size={18} />
                  </Link>

                  {user && user.role === 'student' ? (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsMobileNavOpen(false)}
                        className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 font-semibold text-sm text-slate-800 shadow-sm bg-white"
                      >
                        Overview
                        <LayoutDashboard size={18} />
                      </Link>
                      <Link
                        to="/dashboard/performance"
                        onClick={() => setIsMobileNavOpen(false)}
                        className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 font-semibold text-sm text-slate-800 shadow-sm bg-white"
                      >
                        Analytics
                        <BarChart3 size={18} />
                      </Link>
                    </>
                  ) : null}

                  {user && user.role === 'admin' ? (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileNavOpen(false)}
                      className="flex items-center justify-between rounded-xl bg-brand-orange border border-orange-700/15 px-4 py-3 font-semibold text-sm text-white shadow-sm"
                    >
                      Admin hub
                      <LayoutDashboard size={18} />
                    </Link>
                  ) : null}
                </div>

                {user ? (
                  <div className="p-3 border-t border-slate-200 bg-white">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileNavOpen(false);
                        logout();
                      }}
                      className="w-full py-3.5 rounded-xl bg-brand-orange border border-orange-700/15 font-semibold text-sm text-white shadow-sm transition hover:brightness-105"
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </motion.aside>
            </div>
          ) : null}
        </AnimatePresence>
      ) : null}

      {/* PAGES */}
      <div className="flex-1">
        <Suspense fallback={<PageLoader hideGlobalChrome={hideGlobalChrome} />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/dashboard" element={
              <ProtectedRoute allowedRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/performance" element={
              <ProtectedRoute allowedRole="student">
                <PerformancePage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/live" element={
              <ProtectedRoute allowedRole="student">
                <StudentStubPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/upcoming-tests" element={
              <ProtectedRoute allowedRole="student">
                <UpcomingTestsPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/past-tests" element={
              <ProtectedRoute allowedRole="student">
                <PastTestsPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/my-attempts" element={
              <ProtectedRoute allowedRole="student">
                <MyAttemptsPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/subject/:subjectName" element={
              <ProtectedRoute allowedRole="student">
                <ErrorBoundary>
                  <SubjectFoldersPage />
                </ErrorBoundary>
              </ProtectedRoute>
            } />

            <Route path="/tests" element={
              <ProtectedRoute allowedRole="student">
                <TestsList />
              </ProtectedRoute>
            } />
            <Route path="/tests/:id/start" element={
              <ProtectedRoute allowedRole="student">
                <TestStartPage />
              </ProtectedRoute>
            } />
            <Route path="/tests/:id" element={
              <ProtectedRoute allowedRole="student">
                <TestDetailsPage />
              </ProtectedRoute>
            } />
            <Route path="/tests/:id/attempt" element={
              <ProtectedRoute allowedRole="student">
                <AttemptTestPage />
              </ProtectedRoute>
            } />
            <Route path="/tests/:id/submitted" element={
              <ProtectedRoute allowedRole="student">
                <TestSubmittedPage />
              </ProtectedRoute>
            } />

            <Route path="/attempts/:id" element={
              <ProtectedRoute allowedRole="student">
                <AttemptResultPage />
              </ProtectedRoute>
            } />
            <Route path="/tests/:testId/leaderboard" element={
              <ProtectedRoute allowedRole="student">
                <StudentLeaderboardPage />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute allowedRole="admin">
                <ErrorBoundary>
                  <AdminLayout />
                </ErrorBoundary>
              </ProtectedRoute>
            }>
              <Route index element={<ErrorBoundary><AdminDashboard /></ErrorBoundary>} />
              <Route path="students" element={<ErrorBoundary><StudentManagement /></ErrorBoundary>} />
              <Route path="questions" element={<ErrorBoundary><AdminQuestionBank /></ErrorBoundary>} />
              <Route path="tests" element={<ErrorBoundary><AdminTestsManager /></ErrorBoundary>} />
              <Route path="results" element={<ErrorBoundary><AdminTestResults /></ErrorBoundary>} />
            </Route>
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

export default App;

function PageLoader({ hideGlobalChrome = false }: { hideGlobalChrome?: boolean }) {
  return (
    <div className={hideGlobalChrome ? 'min-h-[100dvh] px-4 py-8' : 'min-h-[calc(100vh-88px)] px-4 py-8'}>
      <div className="mx-auto w-full max-w-4xl">
        <div className="w-full h-40 flex items-center justify-center rounded-2xl border border-dashed border-slate-300 text-slate-500 text-sm font-medium animate-pulse">
          Loading…
        </div>
      </div>
    </div>
  );
}