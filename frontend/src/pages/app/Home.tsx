import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PenLine, BookOpen, BarChart3, Anchor, ArrowRight, Sparkles } from 'lucide-react'
import PageTransition from '@/components/layout/PageTransition'
import CheckinStreak from '@/components/ui/CheckinStreak'
import AnchorCard from '@/components/ui/AnchorCard'
import AdSlot from '@/components/ui/AdSlot'
import { useCheckinStore } from '@/stores/checkinStore'
import { getTodayAnchor } from '@/lib/api'

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
  const { streak, lastCheckinDate, checkinHistory } = useCheckinStore()
  const [localAnchor, setLocalAnchor] = useState<{ content: string; source: string; type: string } | null>(null)
  const [anchorLoading, setAnchorLoading] = useState(true)

  const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as keyof typeof DAY_ANCHORS

  useEffect(() => {
    async function loadAnchor() {
      try {
        const data = await getTodayAnchor() as any
        if (data && data.content) {
          setLocalAnchor(data)
        } else {
          setLocalAnchor(DAY_ANCHORS[dayOfWeek])
        }
      } catch {
        setLocalAnchor(DAY_ANCHORS[dayOfWeek])
      } finally {
        setAnchorLoading(false)
      }
    }
    loadAnchor()
  }, [dayOfWeek])

  const today = new Date().toISOString().split('T')[0]
  const checkedInToday = lastCheckinDate === today
  const latestMood = checkinHistory.length > 0 ? checkinHistory[checkinHistory.length - 1] : null

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
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

        {/* Streak + Check-in Status */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CheckinStreak streak={streak} lastCheckinDate={lastCheckinDate} />
          {latestMood && checkedInToday && (
            <span className="text-xs text-soro-fade bg-soro-surface px-3 py-1.5 rounded-full border border-soro-earth/10">
              Last mood: {latestMood.mood.replace('_', ' ')}
            </span>
          )}
        </div>

        {/* Check-in CTA */}
        {!checkedInToday && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Link
              to="/app/checkin"
              className="block btn-ember rounded-2xl p-6 md:p-8 text-center relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Sparkles size={32} className="mx-auto mb-3 text-white/80" />
              <h2 className="text-xl md:text-2xl font-display font-bold text-white mb-1">
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
            </h2>
            <p className="text-sm text-soro-fade mb-4">
              That's strength. Come back tomorrow.
            </p>
            <Link
              to="/app/reflect"
              className="text-sm text-soro-ember hover:underline font-medium inline-flex items-center gap-1"
            >
              View your last reflection
              <ArrowRight size={14} />
            </Link>
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

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-display font-semibold text-soro-mist mb-3">
            Quick actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="glass-card rounded-2xl p-4 hover:border-soro-ember/20 transition-all duration-200 group"
              >
                <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon size={20} className={action.color} />
                </div>
                <h3 className="text-sm font-semibold text-soro-mist mb-0.5">
                  {action.label}
                </h3>
                <p className="text-xs text-soro-fade">{action.desc}</p>
              </Link>
            ))}
          </div>
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
          <Link
            to="/app/journal"
            className="block glass-card rounded-2xl p-5 border-soro-earth/10 hover:border-soro-ember/20 transition-all"
          >
            <div className="flex items-center gap-3">
              <BookOpen size={20} className="text-soro-fade" />
              <p className="text-sm text-soro-fade">
                No journal entries yet.{' '}
                <span className="text-soro-ember hover:underline">Write your first entry</span>
              </p>
            </div>
          </Link>
        </div>

        {/* Ad Slot */}
        <AdSlot className="mt-8" />
      </div>
    </PageTransition>
  )
}
