import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, BookOpen, Check, RefreshCw, AlertTriangle } from 'lucide-react'
import PageTransition from '@/components/layout/PageTransition'
import Button from '@/components/shared/Button'
import Spinner from '@/components/shared/Spinner'
import { useCheckinStore, MOOD_LABELS, MOOD_COLORS, type MoodState } from '@/stores/checkinStore'
import { getReflection } from '@/lib/api'

const OFFLINE_MESSAGE =
  "You're offline — your words are saved. We'll reflect when you're back."

const MOOD_BASED_MESSAGES: Record<string, string> = {
  at_limit:
    'Thank you for showing up. That takes real courage. Take a breath. You\'re not alone in this — and just acknowledging it is a step. Sending strength your way.',
  managing:
    'I hear you. Getting by is honest work. Some days that\'s enough. What\'s one small thing that could make today a tiny bit lighter?',
  mixed:
    'Mixed is valid. Life doesn\'t fit into neat boxes. It\'s okay to feel a few things at once. Which feeling is sitting heaviest right now?',
  okay:
    "Okay is a good place to be. Not great, not terrible — just okay. That's allowed. What's one thing that helped you get to okay today?",
  good:
    "That's good to hear. It's important to catch the good days too. What's going right? Let that sink in for a moment.",
}

export default function Reflect() {
  const { currentMood, ventText } = useCheckinStore()
  const [reflection, setReflection] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentMood) {
      navigate('/app/checkin')
      return
    }

    generateReflection()
  }, [currentMood])

  const generateReflection = async () => {
    setIsGenerating(true)
    setError('')

    try {
      if (navigator.onLine) {
        const data = await getReflection(currentMood as string, ventText)
        setReflection(data.reflection)
      } else {
        // Offline fallback
        setTimeout(() => {
          setReflection(OFFLINE_MESSAGE)
        }, 1500)
      }
    } catch {
      // Fallback to mood-based message
      setTimeout(() => {
        setReflection(
          MOOD_BASED_MESSAGES[currentMood as string] ||
          'Thank you for checking in. Your feelings are valid and matter.',
        )
      }, 1000)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveToJournal = () => {
    // TODO: Auto-save reflection as journal entry
    navigate('/app/journal')
  }

  if (!currentMood) return null

  const moodColor = MOOD_COLORS[currentMood as MoodState]
  const moodLabel = MOOD_LABELS[currentMood as MoodState]

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto space-y-8">
        {/* Step indicator */}
        <div className="text-center">
          <span className="text-xs font-mono text-soro-ember">STEP 2 OF 2</span>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-soro-mist mt-2 mb-1">
            Your Reflection
          </h1>
        </div>

        {/* Mood tag */}
        <div className="text-center">
          <span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{
              backgroundColor: `${moodColor}15`,
              color: moodColor,
            }}
          >
            <Sparkles size={16} />
            {moodLabel}
          </span>
        </div>

        {/* Reflection content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-soro-ember/3 rounded-full blur-3xl pointer-events-none" />

          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative mb-6">
                <Spinner size="lg" />
                <Sparkles
                  size={20}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-soro-ember"
                />
              </div>
              <p className="text-sm text-soro-fade animate-pulse">
                Listening to you...
              </p>
            </div>
          ) : (
            <div>
              {error && (
                <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-soro-danger/5 text-soro-danger">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <p className="text-xs">{error}</p>
                </div>
              )}

              <p className="text-base md:text-lg text-soro-mist leading-relaxed whitespace-pre-line">
                {reflection}
              </p>

              <div className="mt-6 pt-4 border-t border-soro-earth/10">
                <p className="text-xs text-soro-fade/60 italic">
                  SORO is not a therapist. If you're in crisis, please reach out to MANI helpline: 08111909909
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleSaveToJournal}
            fullWidth
            size="lg"
            variant="primary"
            leftIcon={<BookOpen size={18} />}
          >
            Save to journal
          </Button>

          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/app/home')}
              fullWidth
              variant="secondary"
              leftIcon={<Check size={18} />}
            >
              That's enough
            </Button>
            <Button
              onClick={generateReflection}
              variant="ghost"
              className="px-3"
              disabled={isGenerating}
            >
              <RefreshCw size={18} className={isGenerating ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
