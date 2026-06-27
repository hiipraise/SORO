interface AdSlotProps {
  className?: string
  format?: 'banner' | 'rectangle'
}

const styles: Record<string, string> = {
  banner: 'h-24',
  rectangle: 'h-64',
}

export default function AdSlot({ className = '', format = 'banner' }: AdSlotProps) {
  return (
    <div
      className={`
        relative flex items-center justify-center bg-soro-surface/30
        border border-soro-earth/10 rounded-xl overflow-hidden
        ${styles[format]}
        ${className}
      `}
    >
      <p className="text-xs text-soro-fade/40 font-medium">
        Ad Space &middot; Supporting SORO
      </p>
      {/* AdSense will be injected here when activated */}
      <div id="adsense-placeholder" className="absolute inset-0" />
    </div>
  )
}
