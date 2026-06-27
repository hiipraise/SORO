import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import PageTransition from '@/components/layout/PageTransition'
import MoodOrb from '@/components/ui/MoodOrb'
import Textarea from '@/components/shared/Textarea'
import Button from '@/components/shared/Button'
import { useCheckinStore, MOOD_LABELS } from '@/stores/checkinStore'
import { createCheckin } from '@/lib/api'

export default function Checkin() {
  const { currentMood, ventText, setMood, setVentText, completeCheckin } = useCheckinStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!currentMood) {
      setError('Please select how you\'re feeling')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await createCheckin(currentMood, ventText.trim() || undefined)
      completeCheckin(currentMood)
      navigate('/app/reflect')
    } catch {
      // Still navigate to reflect even if API fails (offline support)
      completeCheckin(currentMood)
      navigate('/app/reflect')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto space-y-8">
        {/* Step indicator */}
        <div className="text-center">
          <span className="text-xs font-mono text-soro-ember">STEP 1 OF 2</span>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-soro-mist mt-2 mb-1">
            How you dey?
          </h1>
          <p className="text-sm text-soro-fade">
            Select your mood — this helps you track patterns over time.
          </p>
        </div>

        {/* Mood Orb Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="py-4"
        >
          <MoodOrb
            selected={currentMood}
            onSelect={(mood) => {
              setMood(mood)
              setError('')
            }}
            size="lg"
          />
        </motion.div>

        {/* Selected mood label */}
        {currentMood && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-soro-ember/10 text-soro-ember text-sm font-medium">
              {MOOD_LABELS[currentMood]}
            </span>
          </motion.div>
        )}

        {/* Optional vent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="glass-card rounded-2xl p-5">
            <label className="block text-sm font-medium text-soro-mist/80 mb-2">
              Want to say more? (optional)
            </label>
            <Textarea
              placeholder="No pressure. Just whatever comes to mind..."
              value={ventText}
              onChange={(e) => setVentText(e.target.value)}
              rows={4}
              className="min-h-[100px]"
            />
            <p className="text-xs text-soro-fade/60 mt-2">
              This helps SORO give you a more meaningful reflection.
            </p>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <p className="text-xs text-soro-danger bg-soro-danger/5 rounded-lg px-3 py-2 text-center">
            {error}
          </p>
        )}

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          fullWidth
          size="lg"
          disabled={!currentMood}
          isLoading={isSubmitting}
          rightIcon={<ArrowRight size={18} />}
        >
          Continue to reflection
        </Button>
      </div>
    </PageTransition>
  )
}
