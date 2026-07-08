import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import Input from '@/components/shared/Input'
import Button from '@/components/shared/Button'
import { api } from '@/lib/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Please enter your email address')
      return
    }

    setIsLoading(true)
    try {
      await api('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-soro-deep flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/soro.png" alt="SORO" className="w-8 h-8" />
            <span className="font-display text-lg font-semibold text-soro-mist">SORO</span>
          </Link>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <h1 className="text-2xl font-display font-bold text-soro-mist mb-2">
              Check your email
            </h1>
            <p className="text-sm text-soro-fade mb-6 leading-relaxed">
              If an account with <strong className="text-soro-mist">{email}</strong> exists,
              we've sent a password reset link. It expires in 1 hour.
            </p>
            <p className="text-xs text-soro-fade/60 mb-6">
              Didn't receive it? Check your spam folder, or try again.
            </p>
            <Link
              to="/auth/login"
              className="text-sm text-soro-ember hover:underline font-medium inline-flex items-center gap-1"
            >
              <ArrowLeft size={16} />
              Back to login
            </Link>
          </motion.div>
        ) : (
          <>
            <h1 className="text-2xl font-display font-bold text-soro-mist text-center mb-1">
              Reset password
            </h1>
            <p className="text-sm text-soro-fade text-center mb-8">
              Enter your email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail size={16} />}
              />

              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={isLoading}
              >
                Send reset link
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/auth/login"
                className="text-sm text-soro-fade hover:text-soro-mist transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft size={16} />
                Back to login
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
