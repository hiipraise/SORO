import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'

const AppShell = lazy(() => import('@/components/layout/AppShell'))
const Landing = lazy(() => import('@/pages/Landing'))
const Onboarding = lazy(() => import('@/pages/Onboarding'))
const Signup = lazy(() => import('@/pages/auth/Signup'))
const Login = lazy(() => import('@/pages/auth/Login'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))
const About = lazy(() => import('@/pages/About'))
import ToastContainer from '@/components/shared/Toast'
import ErrorBoundary from '@/components/shared/ErrorBoundary'
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
const Community = lazy(() => import('@/pages/app/Community'))
const Circles = lazy(() => import('@/pages/app/Circles'))
const CircleDetail = lazy(() => import('@/pages/app/CircleDetail'))

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastContainer />
        <ErrorBoundary>
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
              <Route path="/app/community" element={<Community />} />
              <Route path="/app/circles" element={<Circles />} />
              <Route path="/app/circles/:id" element={<CircleDetail />} />
            </Route>
            </Route>
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
