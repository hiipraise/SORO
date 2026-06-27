import { type ReactNode } from 'react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 text-soro-fade/50">
        {icon || <Inbox size={48} />}
      </div>
      <h3 className="text-lg font-display font-semibold text-soro-mist mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-soro-fade max-w-xs mb-6">{description}</p>
      )}
      {action}
    </div>
  )
}
