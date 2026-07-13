import { type ReactNode, type HTMLAttributes } from 'react'
import { motion } from 'framer-motion'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'highlight' | 'danger' | 'safe' | 'interactive'
  padding?: 'sm' | 'md' | 'lg'
  animate?: boolean
  delay?: number
}

const variantStyles: Record<string, string> = {
  default: 'glass-card border-soro-earth/10',
  highlight: 'glass-card border-soro-ember/20 bg-soro-ember/5',
  danger: 'glass-card border-soro-danger/20 bg-soro-danger/5',
  safe: 'glass-card border-soro-safe/20 bg-soro-safe/5',
  interactive:
    'glass-card border-soro-earth/10 hover:border-soro-ember/20 transition-all duration-200 cursor-pointer',
}

const paddingStyles: Record<string, string> = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6 md:p-8',
}

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  animate = false,
  delay = 0,
  className = '',
  ...props
}: CardProps) {
  const baseClasses = `rounded-2xl ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay }}
        className={baseClasses}
        {...(props as any)}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={baseClasses} {...props}>
      {children}
    </div>
  )
}
