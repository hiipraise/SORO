import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { type MoodState } from '@/stores/checkinStore'

interface CheckinHeatmapProps {
  checkinHistory: Array<{ date: string; mood: MoodState }>
}

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

const MOOD_LEVELS: Record<MoodState, number> = {
  at_limit: 1,
  managing: 2,
  mixed: 3,
  okay: 4,
  good: 5,
}

export default function CheckinHeatmap({ checkinHistory }: CheckinHeatmapProps) {
  const heatmapData = useMemo(() => {
    // Build a map of date -> mood
    const moodMap: Record<string, MoodState> = {}
    for (const c of checkinHistory) {
      moodMap[c.date] = c.mood
    }

    // Generate the last 12 weeks (84 days) of data
    const today = new Date()
    const weeks: Array<Array<{ date: string; mood: MoodState | null; level: number }>> = []

    // Find the most recent Sunday or today
    const end = new Date(today)
    end.setDate(end.getDate() - end.getDay()) // go to last Sunday

    for (let w = 0; w < 12; w++) {
      const week: Array<{ date: string; mood: MoodState | null; level: number }> = []
      for (let d = 0; d < 7; d++) {
        const day = new Date(end)
        day.setDate(day.getDate() - (11 - w) * 7 + d)
        const dateStr = day.toISOString().split('T')[0]
        const mood = moodMap[dateStr] || null
        const isFuture = day > today

        week.push({
          date: dateStr,
          mood: isFuture ? null : mood,
          level: mood ? MOOD_LEVELS[mood] : 0,
        })
      }
      weeks.push(week)
    }

    return weeks
  }, [checkinHistory])

  const getColor = (level: number): string => {
    if (level === 0) return 'bg-soro-surface/40'
    if (level <= 2) return 'bg-soro-danger/40'
    if (level <= 3) return 'bg-soro-gold/30'
    if (level <= 4) return 'bg-green-500/40'
    return 'bg-green-400/60'
  }

  const getTooltip = (day: { date: string; mood: MoodState | null; level: number }): string => {
    if (day.mood === null) return `${day.date}: No check-in`
    return `${day.date}: ${day.mood.replace('_', ' ')} (level ${day.level}/5)`
  }

  const totalCheckedIn = checkinHistory.length

  return (
    <div className="glass-card rounded-2xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-soro-mist">Check-in calendar</h3>
        <span className="text-xs text-soro-fade">{totalCheckedIn} check-ins</span>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-0.5 min-w-[500px]">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 mr-1">
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="h-3 text-[8px] text-soro-fade/60 leading-3">
                {label}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {heatmapData.map((week, wi) => (
            <motion.div
              key={wi}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: wi * 0.02 }}
              className="flex flex-col gap-0.5"
            >
              {week.map((day, di) => (
                <div
                  key={di}
                  className="group relative"
                >
                  <div
                    className={`w-3 h-3 rounded-[3px] transition-colors duration-200 ${getColor(day.level)}`}
                    title={getTooltip(day)}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded-lg bg-soro-surface border border-soro-earth/20 text-[10px] text-soro-mist whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                    {getTooltip(day)}
                  </div>
                </div>
              ))}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-[10px] text-soro-fade/60">
        <span>Less</span>
        <div className="w-3 h-3 rounded-[3px] bg-soro-surface/40" />
        <div className="w-3 h-3 rounded-[3px] bg-soro-danger/40" />
        <div className="w-3 h-3 rounded-[3px] bg-soro-gold/30" />
        <div className="w-3 h-3 rounded-[3px] bg-green-500/40" />
        <div className="w-3 h-3 rounded-[3px] bg-green-400/60" />
        <span>More</span>
      </div>
    </div>
  )
}
