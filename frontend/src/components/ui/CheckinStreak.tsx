import { Flame } from 'lucide-react'

interface CheckinStreakProps {
  streak: number
  lastCheckinDate: string | null
}

export default function CheckinStreak({ streak, lastCheckinDate }: CheckinStreakProps) {
  const today = new Date().toISOString().split('T')[0]
  const checkedInToday = lastCheckinDate === today

  return (
    <div className="flex items-center gap-2">
      <div
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
          transition-all duration-300
          ${streak > 0
            ? 'bg-soro-gold/10 text-soro-gold'
            : 'bg-soro-surface text-soro-fade'
          }
        `}
      >
        <Flame
          size={16}
          className={`streak-flame ${
            streak > 0 ? 'text-soro-gold' : 'text-soro-fade'
          }`}
        />
        <span className="font-mono font-semibold">{streak}</span>
        <span className="text-soro-fade/70">day streak</span>
      </div>

      {checkedInToday && (
        <span className="text-xs text-green-400">Checked in today ✓</span>
      )}
    </div>
  )
}
