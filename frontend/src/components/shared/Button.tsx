import { type ButtonHTMLAttributes, type ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
  slideFill?: boolean
}

const variantStyles: Record<string, string> = {
  primary:
    'bg-gradient-to-r from-soro-ember to-[#d4733e] text-white hover:shadow-lg hover:shadow-soro-ember/25 active:scale-[0.98]',
  secondary:
    'border border-soro-earth/30 bg-soro-surface text-soro-mist hover:border-soro-earth/50 hover:bg-soro-earth/10',
  ghost:
    'text-soro-fade hover:text-soro-mist hover:bg-soro-surface/50',
  danger:
    'bg-soro-danger text-white hover:bg-red-700 active:scale-[0.98]',
  gold:
    'bg-gradient-to-r from-soro-gold to-[#e0b53a] text-soro-deep font-bold hover:shadow-lg hover:shadow-soro-gold/25 active:scale-[0.98]',
}

const slideFillVariants: Record<string, string> = {
  primary:
    'bg-soro-ember/8 border border-soro-ember/25 text-white',
  secondary:
    'bg-transparent border border-soro-earth/20 text-soro-mist',
  ghost:
    'bg-transparent text-soro-fade',
  danger:
    'bg-soro-danger/10 border border-soro-danger/30 text-white',
  gold:
    'bg-soro-gold/8 border border-soro-gold/25 text-soro-mist',
}

const slideFillLayer: Record<string, string> = {
  primary: 'bg-gradient-to-r from-soro-ember to-[#d4733e]',
  secondary: 'bg-soro-earth/30',
  ghost: 'bg-soro-surface/50',
  danger: 'bg-soro-danger',
  gold: 'bg-gradient-to-r from-soro-gold to-[#e0b53a]',
}

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  slideFill = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading

  if (slideFill) {
    return (
      <button
        className={`
          group relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl font-semibold
          transition-all duration-200 focus:outline-none focus:ring-2
          focus:ring-soro-ember/40 focus:ring-offset-2 focus:ring-offset-soro-deep
          cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
          ${slideFillVariants[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        disabled={isDisabled}
        {...props}
      >
        {/* Slide-fill layer */}
        <span
          className={`
            absolute inset-0 rounded-[inherit] -z-[1]
            scale-x-0 group-hover:scale-x-100 origin-left
            transition-transform duration-[400ms] ease-[cubic-bezier(0.65,0,0.35,1)]
            ${slideFillLayer[variant]}
          `}
        />
        {/* Content layer */}
        <span className="relative z-10 inline-flex items-center gap-2">
          {isLoading ? (
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : leftIcon}
          {children}
          {!isLoading && rightIcon}
        </span>
      </button>
    )
  }

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-semibold
        transition-all duration-200 focus:outline-none focus:ring-2
        focus:ring-soro-ember/40 focus:ring-offset-2 focus:ring-offset-soro-deep
        cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  )
}
