import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Heart, Brain, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useCheckinStore } from '@/stores/checkinStore'
import { createAnonymousSession, createCheckin } from '@/lib/api'

interface OnboardingStep {
  title: string
  subtitle: string
}

const steps: OnboardingStep[] = [
  {
    title: 'What brings you here?',
    subtitle: 'No pressure. Pick what fits.',
  },
  {
    title: 'How are you right now?',
    subtitle: 'Be honest — nobody else will see this.',
  },
  {
    title: 'Stay anonymous or create account?',
    subtitle: 'Your choice. Both are free.',
  },
]

const reasons = [
  { value: 'wellness', label: 'Mental wellness', icon: Heart, desc: 'I need space to process' },
  { value: 'finance', label: 'Financial resilience', icon: Sparkles, desc: "I'm trying to get my money right" },
  { value: 'both', label: 'Both', icon: Brain, desc: 'They\'re connected for me' },
  { value: 'looking', label: 'Just looking', icon: Brain, desc: 'Curious to see what this is' },
]

const moodOptions = [
  { value: 'at_limit', label: 'Carrying something', emoji: '\u{1F494}' },
  { value: 'managing', label: 'Managing', emoji: '\u{1F34B}' },
  { value: 'mixed', label: 'Mixed feelings', emoji: '\u{1F937}' },
  { value: 'okay', label: "I'm okay", emoji: '\u{270C}' },
  { value: 'good', label: "I'm good", emoji: '\u{1F60A}' },
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [reason, setReason] = useState<string | null>(null)
  const [currentMood, setCurrentMood] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const authSetUser = useAuthStore((s) => s.setUser)
  const completeOnboarding = useAuthStore((s) => s.setOnboardingComplete)
  const checkinCompleteCheckin = useCheckinStore((s) => s.completeCheckin)

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const handleFinish = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await createAnonymousSession()
      authSetUser(
        { id: data.anonymous_id, is_anonymous: true, created_at: new Date().toISOString() },
        data.token,
        'anonymous',
      )
      // Wire the onboarding mood into a real first check-in
      if (currentMood) {
        try {
          await createCheckin(currentMood)
          checkinCompleteCheckin(currentMood as any)
        } catch {
          // Best-effort — don't block onboarding on check-in failure
        }
      }
      completeOnboarding()
      navigate('/app/home')
    } catch {
      setError('Unable to connect. Check your internet connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-soro-deep flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className={`p-2 rounded-xl transition-colors ${
              step > 0
                ? 'text-soro-fade hover:text-soro-mist hover:bg-soro-surface'
                : 'opacity-0 pointer-events-none'
            }`}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i <= step ? 'bg-soro-ember w-6' : 'bg-soro-earth/20 w-2'
                }`}
              />
            ))}
          </div>
          <div className="w-10" /> {/* spacer */}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Step 0: Reason */}
            {step === 0 && (
              <div>
                <h1 className="text-2xl font-display font-bold text-soro-mist mb-1">
                  {steps[0].title}
                </h1>
                <p className="text-sm text-soro-fade mb-8">{steps[0].subtitle}</p>

                <div className="flex flex-col gap-3">
                  {reasons.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => {
                        setReason(r.value)
                        handleNext()
                      }}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left ${
                        reason === r.value
                          ? 'border-soro-ember bg-soro-ember/10'
                          : 'border-soro-earth/20 hover:border-soro-earth/40 bg-soro-surface'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        reason === r.value ? 'bg-soro-ember/20' : 'bg-soro-earth/10'
                      }`}>
                        <r.icon size={20} className={reason === r.value ? 'text-soro-ember' : 'text-soro-fade'} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-soro-mist">{r.label}</p>
                        <p className="text-xs text-soro-fade">{r.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Mood */}
            {step === 1 && (
              <div>
                <h1 className="text-2xl font-display font-bold text-soro-mist mb-1">
                  {steps[1].title}
                </h1>
                <p className="text-sm text-soro-fade mb-8">{steps[1].subtitle}</p>

                <div className="flex flex-col gap-3">
                  {moodOptions.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => {
                        setCurrentMood(m.value)
                        handleNext()
                      }}
                      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 ${
                        currentMood === m.value
                          ? 'border-soro-ember bg-soro-ember/10'
                          : 'border-soro-earth/20 hover:border-soro-earth/40 bg-soro-surface'
                      }`}
                    >
                      <span className="text-2xl">{m.emoji}</span>
                      <span className="font-medium text-sm text-soro-mist">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Anonymous or Account */}
            {step === 2 && (
              <div>
                <h1 className="text-2xl font-display font-bold text-soro-mist mb-1">
                  {steps[2].title}
                </h1>
                <p className="text-sm text-soro-fade mb-8">{steps[2].subtitle}</p>

                {/* P3.18: Anonymity limits info card */}
                <div className="glass-card rounded-2xl p-4 mb-4 border-soro-ember/20 bg-soro-ember/5">
                  <div className="flex items-start gap-3">
                    <Brain size={18} className="text-soro-ember shrink-0 mt-0.5" />
                    <div className="text-xs text-soro-fade leading-relaxed">
                      <p className="font-medium text-soro-mist mb-1 text-sm">
                        Here's how anonymity works
                      </p>
                      <p className="mb-2">
                        Your entries are saved to this device. If you switch phones
                        or clear your browser, your data stays here.
                      </p>
                      <p>
                        Create a free account anytime to keep everything — your
                        check-ins, journal, and progress — across devices.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={handleFinish}
                    disabled={isLoading}
                    className="btn-ember w-full py-4 rounded-2xl text-base font-semibold flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Stay anonymous
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  {/* Error state */}
                  {error && (
                    <p className="text-sm text-soro-danger bg-soro-danger/5 rounded-xl px-4 py-3 text-center">
                      {error}
                    </p>
                  )}

                  <div className="relative flex items-center gap-3 py-2">
                    <div className="flex-1 h-px bg-soro-earth/20" />
                    <span className="text-xs text-soro-fade">or</span>
                    <div className="flex-1 h-px bg-soro-earth/20" />
                  </div>

                  <button
                    onClick={() => navigate('/auth/signup')}
                    className="w-full py-4 rounded-2xl text-base font-semibold border border-soro-earth/30 text-soro-mist hover:bg-soro-surface transition-all"
                  >
                    Create account with email
                  </button>

                  <p className="text-xs text-soro-fade/60 text-center mt-2">
                    Anonymous mode uses local storage. Clearing browser data will lose your entries.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
