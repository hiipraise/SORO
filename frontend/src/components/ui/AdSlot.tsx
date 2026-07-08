interface AdSlotProps {
  className?: string
  format?: 'banner' | 'rectangle'
}

const sizeStyles: Record<string, string> = {
  banner: 'h-24',
  rectangle: 'h-64',
}

const adsEnabled = import.meta.env.VITE_ADS_ENABLED === 'true'
const adMode = import.meta.env.VITE_ADS_MODE ?? 'placeholder'

export default function AdSlot({ className = '', format = 'banner' }: AdSlotProps) {
  if (!adsEnabled) return null

  const isPlaceholder = adMode === 'placeholder'

  return (
    <div
      className={`
        relative flex items-center justify-center overflow-hidden
        rounded-xl
        ${isPlaceholder
          ? 'bg-soro-surface/30 border border-soro-earth/10'
          : 'bg-transparent border border-dashed border-soro-earth/5'
        }
        ${sizeStyles[format]}
        ${className}
      `}
    >
      {isPlaceholder ? (
        <p className="text-xs text-soro-fade/40 font-medium">
          Ad Space &middot; Supporting SORO
        </p>
      ) : (
        <>
          {/* Live production slot — invisible until AdSense injects content */}
          <div className="adsense-slot absolute inset-0" />
        </>
      )}
    </div>
  )
}
