import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import Input from '@/components/shared/Input'
import Button from '@/components/shared/Button'
import HeroMosaic from '@/components/shared/HeroMosaic'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/components/shared/Toast'
import { login } from '@/lib/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)
  const setOnboardingComplete = useAuthStore((s) => s.setOnboardingComplete)
  const addToast = useToastStore((s) => s.addToast)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      const data = await login(email, password)
      setUser(data.user as any, data.token, 'email')
      setOnboardingComplete()
      addToast('Welcome back!', 'success')
      navigate('/app/home')
    } catch (err: any) {
      setError(err.message || 'Failed to log in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-soro-deep flex items-center justify-center px-4 py-8 overflow-hidden">
      {/* Mosaic background */}
      <div className="absolute inset-0">
        <HeroMosaic
          images={[
            { src: "/assets/img/in_debt.jpg", alt: "" },
            { src: "/assets/img/student.jpg", alt: "" },
            { src: "/assets/img/hero.jpg", alt: "" },
            { src: "/assets/img/young_grad.jpg", alt: "" },
            { src: "/assets/img/grieving.jpg", alt: "" },
          ]}
          className="grayscale contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-soro-deep via-soro-deep/80 to-soro-deep/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-soro-deep/90 via-transparent to-transparent h-32" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-soro-deep to-transparent" />
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-soro-deep to-transparent hidden md:block" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-soro-deep to-transparent hidden md:block" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/soro.png" alt="SORO" className="w-8 h-8" />
            <span className="font-display text-lg font-semibold text-soro-mist">
              SORO
            </span>
          </Link>
        </div>

        <h1 className="text-2xl font-display font-bold text-soro-mist text-center mb-1">
          Welcome back
        </h1>
        <p className="text-sm text-soro-fade text-center mb-8">
          Continue where you left off.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-soro-fade hover:text-soro-mist transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-soro-danger bg-soro-danger/5 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button
            slideFill
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}
            rightIcon={<ArrowRight size={18} />}
          >
            Log in
          </Button>
        </form>

        <div className="mt-6 space-y-3 text-center">
          <p className="text-sm text-soro-fade">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="text-soro-ember hover:underline font-medium">
              Sign up
            </Link>
          </p>
          <p className="text-sm">
            <Link to="/onboarding" className="text-soro-fade hover:text-soro-mist transition-colors">
              Continue anonymously instead
            </Link>
          </p>
          <p className="text-xs text-soro-fade/60">
            <Link to="/auth/forgot-password" className="hover:text-soro-ember transition-colors">
              Forgot password?
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
