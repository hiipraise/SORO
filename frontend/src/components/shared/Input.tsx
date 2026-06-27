import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-soro-mist/80">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-soro-fade pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full rounded-xl border bg-soro-surface text-sm text-soro-mist
              placeholder:text-soro-fade/50 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-soro-ember/40
              ${leftIcon ? 'pl-10' : 'px-4'} py-2.5
              ${error
                ? 'border-soro-danger focus:ring-soro-danger/40'
                : 'border-soro-earth/20 hover:border-soro-earth/40 focus:border-soro-ember/50'
              }
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-soro-danger mt-0.5">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-soro-fade mt-0.5">{helperText}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
export default Input
