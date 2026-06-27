import { Bookmark, Share2 } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface AnchorCardProps {
  content: string
  source?: string
  dayLabel: string
  type?: 'verse' | 'quote' | 'prompt' | 'story'
}

export default function AnchorCard({
  content,
  source,
  dayLabel,
  type = 'quote',
}: AnchorCardProps) {
  const [bookmarked, setBookmarked] = useState(false)

  const typeLabels: Record<string, string> = {
    verse: 'Scripture',
    quote: 'Wisdom',
    prompt: 'Reflection',
    story: 'Story',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-soro-earth/5 rounded-full blur-3xl pointer-events-none" />

      {/* Day label */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-soro-ember uppercase tracking-wider">
          {dayLabel} &middot; {typeLabels[type]}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setBookmarked(!bookmarked)}
            className={`p-1.5 rounded-lg transition-colors ${
              bookmarked
                ? 'text-soro-gold bg-soro-gold/10'
                : 'text-soro-fade hover:text-soro-mist hover:bg-soro-surface'
            }`}
          >
            <Bookmark size={16} />
          </button>
          <button className="p-1.5 rounded-lg text-soro-fade hover:text-soro-mist hover:bg-soro-surface transition-colors">
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <blockquote className="text-lg md:text-xl font-display text-soro-mist leading-relaxed italic">
        "{content}"
      </blockquote>

      {/* Source */}
      {source && (
        <p className="mt-4 text-sm text-soro-fade">— {source}</p>
      )}
    </motion.div>
  )
}
