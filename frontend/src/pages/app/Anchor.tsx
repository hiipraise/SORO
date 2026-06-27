import { motion } from 'framer-motion'
import { Bookmark, Sparkles } from 'lucide-react'
import PageTransition from '@/components/layout/PageTransition'
import AnchorCard from '@/components/ui/AnchorCard'
import AdSlot from '@/components/ui/AdSlot'

const DAY_LABELS: Record<string, string> = {
  Monday: 'Monday — Action',
  Tuesday: 'Tuesday — Reflection',
  Wednesday: 'Wednesday — Faith',
  Thursday: 'Thursday — Finance Truth',
  Friday: 'Friday — Someone Who Made It',
  Saturday: 'Saturday — Rest',
  Sunday: 'Sunday — Gratitude',
}

const ANCHOR_ARCHIVE = [
  {
    content: 'The only way out is through. One step today. That\'s all you need.',
    source: 'SORO',
    type: 'prompt' as const,
    day: 'Monday',
  },
  {
    content: 'What is one thing you\'re carrying that isn\'t yours to carry?',
    source: 'Reflection prompt',
    type: 'prompt' as const,
    day: 'Tuesday',
  },
  {
    content: 'Your current situation is not your final destination.',
    source: 'Nigerian proverb',
    type: 'quote' as const,
    day: 'Wednesday',
  },
  {
    content: 'Debt does not define your destiny. It is a chapter, not the whole book.',
    source: 'SORO Finance',
    type: 'quote' as const,
    day: 'Thursday',
  },
  {
    content: 'I lost everything at 22. By 25, I had built something from nothing. The secret? I showed up every single day.',
    source: 'Chidi, 27',
    type: 'story' as const,
    day: 'Friday',
  },
  {
    content: 'Rest is not a reward for finishing. It is fuel for continuing.',
    source: 'SORO',
    type: 'prompt' as const,
    day: 'Saturday',
  },
  {
    content: 'What went well this week? What are you grateful for — even if it\'s small?',
    source: 'Gratitude prompt',
    type: 'prompt' as const,
    day: 'Sunday',
  },
]

export default function Anchor() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const todayAnchor = ANCHOR_ARCHIVE.find((a) => a.day === today)

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-soro-mist">
            Daily Anchor
          </h1>
          <p className="text-sm text-soro-fade mt-1">
            Ground yourself. One thought at a time.
          </p>
        </div>

        {/* Today's Anchor */}
        {todayAnchor && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-soro-ember" />
              <h2 className="text-sm font-semibold text-soro-mist">Today's anchor</h2>
            </div>
            <AnchorCard
              content={todayAnchor.content}
              source={todayAnchor.source}
              dayLabel={DAY_LABELS[today] || today}
              type={todayAnchor.type}
            />
          </div>
        )}

        {/* Weekly cadence */}
        <div>
          <h2 className="text-lg font-display font-semibold text-soro-mist mb-4">
            This week
          </h2>
          <div className="space-y-3">
            {ANCHOR_ARCHIVE.map((anchor, i) => (
              <motion.div
                key={anchor.day}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <div className={`glass-card rounded-2xl p-4 transition-all ${
                  anchor.day === today
                    ? 'border-soro-ember/30 bg-soro-ember/5'
                    : 'border-soro-earth/10 hover:border-soro-earth/20'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-soro-ember uppercase tracking-wider">
                        {DAY_LABELS[anchor.day]}
                      </span>
                      <p className="text-sm text-soro-mist mt-1.5 leading-relaxed">
                        "{anchor.content}"
                      </p>
                      {anchor.source && (
                        <p className="text-xs text-soro-fade mt-1">— {anchor.source}</p>
                      )}
                    </div>
                    <button className="p-1.5 rounded-lg text-soro-fade hover:text-soro-gold hover:bg-soro-gold/10 transition-colors shrink-0">
                      <Bookmark size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Ad Slot */}
        <AdSlot className="mt-8" />
      </div>
    </PageTransition>
  )
}
