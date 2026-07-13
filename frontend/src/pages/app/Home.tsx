import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PenLine, BookOpen, BarChart3, Anchor, ArrowRight, Sparkles, Wallet, Target } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import PageTransition from '@/components/layout/PageTransition'
import CheckinStreak from '@/components/ui/CheckinStreak'
import AnchorCard from '@/components/ui/AnchorCard'
import AdSlot from '@/components/ui/AdSlot'
import EmptyState from '@/components/shared/EmptyState'
import Card from '@/components/shared/Card'
import ProgressBar from '@/components/shared/ProgressBar'
import Button from '@/components/shared/Button'
import { useCheckinStore } from '@/stores/checkinStore'
import { useAuthStore } from '@/stores/authStore'
import { getTodayAnchor, getMoodInsights, getJournalEntries, getReflections, getDebts, getGoals } from '@/lib/api'
import { staggerContainer, staggerItem } from '@/lib/motion'

const quickActions = [
  {
    to: '/app/checkin',
    label: 'Check in',
    desc: 'How you dey today?',
    icon: PenLine,
    color: 'text-soro-ember',
    bg: 'bg-soro-ember/10',
  },
  {
    to: '/app/journal',
    label: 'Journal',
    desc: 'Write it out',
    icon: BookOpen,
    color: 'text-soro-gold',
    bg: 'bg-soro-gold/10',
  },
  {
    to: '/app/insights',
    label: 'Insights',
    desc: 'See your patterns',
    icon: BarChart3,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
  },
  {
    to: '/app/anchor',
    label: 'Anchor',
    desc: 'Daily grounding',
    icon: Anchor,
    color: 'text-soro-earth',
    bg: 'bg-soro-earth/10',
  },
]

const MOOD_COLORS: Record<string, string> = {
  at_limit: '#C0392B',
  managing: '#E8834A',
  mixed: '#F5C842',
  okay: '#8B5E3C',
  good: '#2E8B57',
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = now - date
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
}

const DAY_ANCHORS: Record<string, { content: string; source: string; type: string }> = {
  Monday: {
    content: 'The only way out is through. One step today. That\'s all you need.',
    source: 'SORO',
    type: 'prompt',
  },
  Tuesday: {
    content: 'What is one thing you\'re carrying that isn\'t yours to carry?',
    source: 'Reflection prompt',
    type: 'prompt',
  },
  Wednesday: {
    content: 'Your current situation is not your final destination.',
    source: 'Nigerian proverb',
    type: 'quote',
  },
  Thursday: {
    content: 'Debt does not define your destiny. It is a chapter, not the whole book.',
    source: 'SORO Finance',
    type: 'quote',
  },
  Friday: {
    content: 'I lost everything at 22. By 25, I had built something from nothing. The secret? I showed up every single day.',
    source: 'Chidi, 27',
    type: 'story',
  },
  Saturday: {
    content: 'Rest is not a reward for finishing. It is fuel for continuing.',
    source: 'SORO',
    type: 'prompt',
  },
  Sunday: {
    content: 'What went well this week? What are you grateful for — even if it\'s small?',
    source: 'Gratitude prompt',
    type: 'prompt',
  },
}

export default function Home() {
  const { lastCheckinDate: localLastDate, checkinHistory } = useCheckinStore()
  const { user } = useAuthStore()
  const [localAnchor, setLocalAnchor] = useState<{ content: string; source: string; type: string } | null>(null)

  const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as keyof typeof DAY_ANCHORS

  // Extract first name from email for personalized greeting
  const firstName = user?.email ? user.email.split('@')[0].split(/[._]/)[0].replace(/^./, (c) => c.toUpperCase()) : null

  // Fetch server insights for streak & latest check-in
  const { data: moodData, isLoading: insightsLoading } = useQuery({
    queryKey: ['mood-insights'],
    queryFn: getMoodInsights,
  })

  // Fetch today's anchor (fallback to day-based anchor on error)
  const { data: serverAnchor, isLoading: anchorLoading } = useQuery({
    queryKey: ['today-anchor'],
    queryFn: getTodayAnchor,
  })

  // Fetch latest journal entry (first page is enough for preview)
  const { data: entriesPage, isLoading: journalLoading } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: () => getJournalEntries(0, 20),
  })
  const entriesData = entriesPage?.items

  // Fetch latest reflection
  const { data: reflectionsData, isLoading: reflectionLoading } = useQuery({
    queryKey: ['reflections'],
    queryFn: getReflections,
  })

  // Fetch financial data for snapshot
  const { data: debtsPage, isLoading: financeLoading } = useQuery({
    queryKey: ['debts'],
    queryFn: () => getDebts(0, 50),
  })
  const { data: goalsPage } = useQuery({
    queryKey: ['goals'],
    queryFn: () => getGoals(0, 50),
  })

  const anyMoodData = moodData as any
  const anyEntries = (entriesPage?.items ?? []) as any[]
  const anyReflections = reflectionsData as any[]
  const debts = (debtsPage?.items ?? []) as any[]
  const goals = (goalsPage?.items ?? []) as any[]

  // Server-sourced data
  const serverStreak = anyMoodData?.stats?.streak ?? null
  const serverLastDate = anyMoodData?.data?.length > 0
    ? anyMoodData.data[anyMoodData.data.length - 1].date.split('T')[0]
    : null
  const serverLatestMood = anyMoodData?.data?.length > 0
    ? { mood: anyMoodData.data[anyMoodData.data.length - 1].mood_state, date: anyMoodData.data[anyMoodData.data.length - 1].date }
    : null

  // Mood data for trend visualization (last 7 days)
  const moodTrendDays = anyMoodData?.data
    ? [...anyMoodData.data].slice(-7).reverse()
    : []
  const hasTrendData = moodTrendDays.length > 0

  // Use server data when available, fall back to local store
  const effectiveStreak = serverStreak ?? (insightsLoading ? useCheckinStore.getState().streak : 0)
  const effectiveLastDate = serverLastDate ?? (insightsLoading ? localLastDate : null)
  const effectiveLatestMood = serverLatestMood ?? (insightsLoading && checkinHistory.length > 0
    ? { mood: checkinHistory[checkinHistory.length - 1].mood, date: checkinHistory[checkinHistory.length - 1].date }
    : null
  )

  // Financial snapshot — best active goal or debt summary
  const activeGoal = goals.find((g: any) => g.status === 'active')
  const activeDebts = debts.filter((d: any) => d.status !== 'cleared')
  const totalDebtRemaining = activeDebts.reduce((s: number, d: any) => s + (d.amount - d.amount_paid), 0)
  const hasFinanceData = activeGoal || activeDebts.length > 0

  // Set anchor from server data or fall back to day-based anchor
  useEffect(() => {
    if (!anchorLoading && !localAnchor) {
      if (serverAnchor && (serverAnchor as any)?.content) {
        setLocalAnchor(serverAnchor as any)
      } else {
        setLocalAnchor(DAY_ANCHORS[dayOfWeek])
      }
    }
  }, [serverAnchor, anchorLoading, dayOfWeek, localAnchor])

  // Latest entry & reflection
  const latestEntry = anyEntries?.length > 0
    ? [...anyEntries].sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )[0]
    : null
  const latestReflection = anyReflections?.length > 0 ? anyReflections[0] : null

  const today = new Date().toISOString().split('T')[0]
  const checkedInToday = effectiveLastDate === today

  const getGreeting = () => {
    const hour = new Date().getHours()
    const base = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    return firstName ? `${base}, ${firstName}` : base
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-soro-mist">
            {getGreeting()}
          </h1>
          <p className="text-soro-fade text-sm mt-1">
            How you dey today?
          </p>
        </div>

        {/* Streak + Mood Trend + Check-in Status */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          {insightsLoading ? (
            <div className="flex items-center gap-3">
              <div className="h-8 w-32 bg-soro-surface rounded-full animate-pulse" />
              <div className="h-6 w-48 bg-soro-surface rounded-lg animate-pulse" />
            </div>
          ) : (
            <>
              <CheckinStreak streak={effectiveStreak} lastCheckinDate={effectiveLastDate} />
              {effectiveLatestMood && checkedInToday && (
                <span className="text-xs text-soro-fade bg-soro-surface px-3 py-1.5 rounded-full border border-soro-earth/10">
                  Last mood: {effectiveLatestMood.mood.replace('_', ' ')}
                </span>
              )}
            </>
          )}
        </div>

        {/* 7-day mood trend */}
        {!insightsLoading && hasTrendData && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="glass-card rounded-xl px-4 py-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-soro-fade font-medium">7-day mood trend</span>
              <Link to="/app/insights" className="text-[10px] text-soro-ember hover:underline">View insights</Link>
            </div>
            <div className="flex items-end gap-1.5 h-8">
              {moodTrendDays.slice(0, 7).map((day: any, i: number) => {
                const color = MOOD_COLORS[day.mood_state] || '#6B7280'
                const intensity = ['good', 'okay', 'mixed', 'managing', 'at_limit'].indexOf(day.mood_state)
                const height = Math.max(30, 100 - intensity * 14) // taller = better mood
                return (
                  <div
                    key={i}
                    className="relative flex-1 group"
                  >
                    <div
                      className="w-full rounded-sm transition-all duration-200 group-hover:opacity-80"
                      style={{
                        height: `${height}%`,
                        backgroundColor: color,
                        opacity: 0.7 + (1 - i * 0.06),
                      }}
                    />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] text-soro-fade whitespace-nowrap bg-soro-surface px-1.5 py-0.5 rounded">
                      {new Date(day.date).toLocaleDateString('en-NG', { weekday: 'short' })} — {day.mood_state.replace('_', ' ')}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Check-in CTA — elevated */}
        {!checkedInToday && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Link
              to="/app/checkin"
              className="relative block rounded-2xl p-8 md:p-10 text-center overflow-hidden group border border-soro-ember/20 glow-ember"
              style={{
                background: 'linear-gradient(135deg, rgba(232,131,74,0.95), rgba(212,115,62,0.95))',
              }}
            >
              {/* Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {/* Pulsing sparkle icon */}
              <motion.div
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles size={36} className="mx-auto mb-3 text-white/90" />
              </motion.div>
              <h2 className="text-xl md:text-2xl font-display font-bold text-white mb-2">
                How are you feeling?
              </h2>
              <p className="text-white/70 text-sm">
                Tap to check in — takes 30 seconds
              </p>
            </Link>
          </motion.div>
        )}

        {/* Checked in state */}
        {checkedInToday && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-6 text-center border-soro-safe/20"
          >
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
              <Sparkles size={24} className="text-green-400" />
            </div>
            <h2 className="text-lg font-display font-semibold text-soro-mist mb-1">
              You checked in today
            </h2>            <p className="text-sm text-soro-fade mb-4">
              That's strength. Come back tomorrow.
            </p>
            {!reflectionLoading && latestReflection && (
              <div className="text-left bg-soro-surface/50 rounded-xl p-4 mb-4 border border-soro-earth/10">
                <p className="text-xs text-soro-fade/60 mb-1.5 font-medium">Your last reflection</p>
                <p className="text-sm text-soro-mist leading-relaxed line-clamp-3">
                  {latestReflection.content}
                </p>
              </div>
            )}
            <Link
              to={latestReflection ? '/app/journal' : '/app/checkin'}
              className="text-sm text-soro-ember hover:underline font-medium inline-flex items-center gap-1"
            >
              {latestReflection ? 'Write in your journal' : 'Check in to get a reflection'}
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        )}

        {/* Financial Snapshot */}
        {!financeLoading && hasFinanceData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-display font-semibold text-soro-mist">
                Financial snapshot
              </h2>
              <Link to="/app/finance" className="text-xs text-soro-ember hover:underline flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {activeGoal ? (
              <Link to="/app/finance/goals" className="block glass-card rounded-2xl p-5 border-soro-gold/10 hover:border-soro-gold/25 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-soro-gold/10 flex items-center justify-center">
                    <Target size={18} className="text-soro-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-soro-mist truncate group-hover:text-soro-gold transition-colors">
                      {activeGoal.title}
                    </p>
                    <p className="text-xs text-soro-fade">
                      ₦{activeGoal.current_amount?.toLocaleString() || 0} / ₦{activeGoal.target_amount?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
                <ProgressBar progress={activeGoal.progress || 0} size="sm" color="gold" />
              </Link>
            ) : activeDebts.length > 0 ? (
              <Link to="/app/finance/debt" className="block glass-card rounded-2xl p-5 border-soro-ember/10 hover:border-soro-ember/25 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-soro-ember/10 flex items-center justify-center">
                    <Wallet size={18} className="text-soro-ember" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-soro-mist">Debt tracker</p>
                    <p className="text-xs text-soro-fade">
                      ₦{totalDebtRemaining.toLocaleString()} remaining across {activeDebts.length} debt{activeDebts.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <ProgressBar
                  progress={activeDebts.reduce((s: number, d: any) => s + (d.amount_paid / d.amount) * 100, 0) / activeDebts.length}
                  size="sm"
                  color="ember"
                />
              </Link>
            ) : null}
          </motion.div>
        )}

        {/* Today's Anchor */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-display font-semibold text-soro-mist">
              Today's Anchor
            </h2>
            <Link
              to="/app/anchor"
              className="text-xs text-soro-ember hover:underline flex items-center gap-1"
            >
              View archive <ArrowRight size={12} />
            </Link>
          </div>
          {anchorLoading ? (
            <div className="glass-card rounded-2xl p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-soro-surface rounded w-3/4" />
                <div className="h-4 bg-soro-surface rounded w-1/2" />
              </div>
            </div>
          ) : localAnchor ? (
            <AnchorCard
              content={localAnchor.content}
              source={localAnchor.source}
              dayLabel={dayOfWeek}
              type={localAnchor.type as any}
            />
          ) : null}
        </div>

        {/* Quick Actions — animated */}
        <div>
          <h2 className="text-lg font-display font-semibold text-soro-mist mb-3">
            Quick actions
          </h2>
          {insightsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-card rounded-2xl p-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-soro-surface mb-3" />
                  <div className="h-4 bg-soro-surface rounded w-3/4 mb-1" />
                  <div className="h-3 bg-soro-surface rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              {quickActions.map((action) => (
                <motion.div key={action.to} variants={staggerItem}>
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Link
                      to={action.to}
                      className="block glass-card rounded-2xl p-4 hover:border-soro-ember/20 transition-colors duration-200 group"
                    >
                      <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <action.icon size={20} className={action.color} />
                      </div>
                      <h3 className="text-sm font-semibold text-soro-mist mb-0.5">
                        {action.label}
                      </h3>
                      <p className="text-xs text-soro-fade">{action.desc}</p>
                    </Link>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Last journal preview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-display font-semibold text-soro-mist">
              Your Journal
            </h2>
            <Link
              to="/app/journal"
              className="text-xs text-soro-ember hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {journalLoading ? (
            <div className="glass-card rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-soro-surface rounded w-3/4 mb-2" />
              <div className="h-3 bg-soro-surface rounded w-1/2" />
            </div>
          ) : latestEntry ? (
            <Link
              to={`/app/journal/${latestEntry.id}`}
              className="block glass-card rounded-2xl p-5 border-soro-earth/10 hover:border-soro-ember/20 transition-all group"
            >
              <h3 className="text-sm font-semibold text-soro-mist mb-1 group-hover:text-soro-ember transition-colors truncate">
                {latestEntry.title || 'Untitled'}
              </h3>
              <p className="text-sm text-soro-fade line-clamp-2 mb-2">
                {latestEntry.content}
              </p>
              <span className="text-xs text-soro-fade/60">
                {formatRelativeTime(latestEntry.created_at)}
              </span>
            </Link>
          ) : (
            <div className="glass-card rounded-2xl p-8">
              <EmptyState
                icon={<BookOpen size={40} className="text-soro-fade/50" />}
                title="No entries yet"
                description="Your journal is empty — a blank page waiting for your voice."
                action={
                  <Link to="/app/journal/new">
                    <Button slideFill size="sm" leftIcon={<BookOpen size={16} />}>
                      Write your first entry
                    </Button>
                  </Link>
                }
              />
            </div>
          )}
        </div>

        {/* Ad Slot */}
        <div className="relative">
          <span className="text-[10px] font-medium text-soro-fade/40 uppercase tracking-wider mb-1.5 block">Ad</span>
          <Card padding="sm">
            <AdSlot className="!mt-0" />
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}
