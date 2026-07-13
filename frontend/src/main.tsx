import { StrictMode, Suspense, lazy, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import { useToastStore } from '@/components/shared/Toast'
import './index.css'

const AppShell = lazy(() => import('@/components/layout/AppShell'))
const Landing = lazy(() => import('@/pages/Landing'))
const Onboarding = lazy(() => import('@/pages/Onboarding'))
const Signup = lazy(() => import('@/pages/auth/Signup'))
const Login = lazy(() => import('@/pages/auth/Login'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))
const About = lazy(() => import('@/pages/About'))
import { Toaster } from '@/components/shared/Toast'
import ErrorBoundary from '@/components/shared/ErrorBoundary'
import { PWAInstallProvider } from '@/lib/usePWAInstall'
const RequireAuth = lazy(() => import('@/components/auth/RequireAuth'))
const Home = lazy(() => import('@/pages/app/Home'))
const Checkin = lazy(() => import('@/pages/app/Checkin'))
const Reflect = lazy(() => import('@/pages/app/Reflect'))
const Journal = lazy(() => import('@/pages/app/Journal'))
const JournalEditor = lazy(() => import('@/pages/app/JournalEditor'))
const Insights = lazy(() => import('@/pages/app/Insights'))
const Anchor = lazy(() => import('@/pages/app/Anchor'))
const Settings = lazy(() => import('@/pages/app/Settings'))
const Finance = lazy(() => import('@/pages/app/Finance'))
const DebtTracker = lazy(() => import('@/pages/app/DebtTracker'))
const GoalTracker = lazy(() => import('@/pages/app/GoalTracker'))


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-[60dvh]">
      <div className="w-8 h-8 border-2 border-soro-ember/30 border-t-soro-ember rounded-full animate-spin" />
    </div>
  )
}

function SessionExpiredHandler() {
  const navigate = useNavigate()
  const location = useLocation()
  const addToast = useToastStore((s) => s.addToast)

  useEffect(() => {
    const handleSessionExpired = () => {
      // Preserve current route for redirect after re-login
      const redirect = encodeURIComponent(location.pathname + location.search)
      addToast('Session expired — please log back in.', 'error')
      // Clear local state
      localStorage.removeItem('soro_token')
      localStorage.removeItem('soro-auth')
      // Clear query cache
      queryClient.clear()
      // Redirect
      navigate(`/auth/login?redirect=${redirect}`, { replace: true })
    }

    window.addEventListener('soro:session-expired', handleSessionExpired)
    return () => window.removeEventListener('soro:session-expired', handleSessionExpired)
  }, [navigate, location, addToast])

  return null
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SessionExpiredHandler />
        <Toaster position="bottom-center" toastOptions={{ style: { background: '#161B22', border: '1px solid rgba(139, 94, 60, 0.2)', color: '#E8EDF2' }, className: 'rounded-xl text-sm' }} />
        <ErrorBoundary>
          <PWAInstallProvider>
          <Suspense fallback={<Spinner />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/about" element={<About />} />

            {/* App routes — wrapped in RequireAuth + AppShell */}
            <Route element={<RequireAuth />}>
              <Route element={<AppShell />}>
              <Route path="/app/home" element={<Home />} />
              <Route path="/app/checkin" element={<Checkin />} />
              <Route path="/app/reflect" element={<Reflect />} />
              <Route path="/app/journal" element={<Journal />} />
              <Route path="/app/journal/:id" element={<JournalEditor />} />
              <Route path="/app/insights" element={<Insights />} />
              <Route path="/app/anchor" element={<Anchor />} />
              <Route path="/app/settings" element={<Settings />} />
              <Route path="/app/finance" element={<Finance />} />
              <Route path="/app/finance/debt" element={<DebtTracker />} />
              <Route path="/app/finance/goals" element={<GoalTracker />} />

            </Route>
            </Route>
          </Routes>
        </Suspense>
        </PWAInstallProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
    </MotionConfig>
  </StrictMode>,
)
