interface ProgressBarProps {
  progress: number
  label?: string
  showPercent?: boolean
  color?: 'ember' | 'gold' | 'safe' | 'danger'
  size?: 'sm' | 'md'
}

const colorStyles: Record<string, string> = {
  ember: 'bg-gradient-to-r from-soro-ember to-[#d4733e]',
  gold: 'bg-gradient-to-r from-soro-gold to-[#e0b53a]',
  safe: 'bg-gradient-to-r from-soro-safe to-green-500',
  danger: 'bg-soro-danger',
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
}

export default function ProgressBar({
  progress,
  label,
  showPercent = false,
  color = 'ember',
  size = 'md',
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress))

  return (
    <div className="flex flex-col gap-1">
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-soro-fade">{label}</span>}
          {showPercent && (
            <span className="font-mono text-soro-mist/70">{Math.round(clampedProgress)}%</span>
          )}
        </div>
      )}
      <div
        className={`w-full rounded-full bg-soro-deep/50 overflow-hidden ${sizeStyles[size]}`}
      >
        <div
          className={`${colorStyles[color]} h-full rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  )
}
