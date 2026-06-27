import { type TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-soro-mist/80">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full rounded-xl border bg-soro-surface px-4 py-3 text-sm text-soro-mist
            placeholder:text-soro-fade/50 transition-all duration-200 resize-y min-h-[100px]
            focus:outline-none focus:ring-2 focus:ring-soro-ember/40
            ${error
              ? 'border-soro-danger focus:ring-soro-danger/40'
              : 'border-soro-earth/20 hover:border-soro-earth/40 focus:border-soro-ember/50'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-xs text-soro-danger mt-0.5">{error}</p>
        )}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
export default Textarea
