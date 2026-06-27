import { motion } from 'framer-motion'
import type { MoodState } from '@/stores/checkinStore'
import { MOOD_LABELS, MOOD_COLORS } from '@/stores/checkinStore'

interface MoodOrbProps {
  selected: MoodState | null
  onSelect: (mood: MoodState) => void
  size?: 'sm' | 'lg'
}

const moods: MoodState[] = ['at_limit', 'managing', 'mixed', 'okay', 'good']

const sizeStyles: Record<string, string> = {
  sm: 'w-14 h-14 text-[10px]',
  lg: 'w-24 h-24 text-xs',
}

const moodIcons: Record<MoodState, string> = {
  at_limit: '\u{1F4A5}', // 💥
  managing: '\u{1F34B}', // 🍋
  mixed: '\u{1F937}', // 🤷
  okay: '\u{270C}', // ✌
  good: '\u{2600}', // ☀
}

export default function MoodOrb({ selected, onSelect, size = 'lg' }: MoodOrbProps) {
  return (
    <div className={`flex items-center justify-center gap-3 md:gap-4 flex-wrap`}>
      {moods.map((mood) => {
        const isSelected = selected === mood
        const color = MOOD_COLORS[mood]

        return (
          <motion.button
            key={mood}
            onClick={() => onSelect(mood)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className={`
              relative flex flex-col items-center gap-1.5 rounded-2xl
              transition-all duration-300 cursor-pointer
              ${sizeStyles[size]}
              ${isSelected
                ? 'ring-2 ring-offset-2 ring-offset-soro-deep shadow-lg'
                : 'opacity-60 hover:opacity-90'
              }
            `}
            style={{
              backgroundColor: `${color}15`,
              borderColor: isSelected ? color : `${color}30`,
              borderWidth: 2,
              boxShadow: isSelected ? `0 0 30px ${color}30` : 'none',
            }}
          >
            {/* Orb glow */}
            {isSelected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: `radial-gradient(circle at center, ${color}20, transparent)`,
                }}
              />
            )}

            {/* Icon */}
            <span className="text-2xl relative z-10">{moodIcons[mood]}</span>

            {/* Label */}
            <span
              className="font-medium text-center leading-tight relative z-10"
              style={{
                color: isSelected ? color : undefined,
                fontSize: size === 'lg' ? '10px' : '8px',
              }}
            >
              {MOOD_LABELS[mood]}
            </span>

            {/* Pulse ring for selected */}
            {isSelected && (
              <motion.div
                initial={{ opacity: 0.6, scale: 1 }}
                animate={{ opacity: 0, scale: 1.3 }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl border-2 pointer-events-none"
                style={{ borderColor: color }}
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
