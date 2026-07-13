import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Award } from 'lucide-react'
import Button from '@/components/shared/Button'

interface CelebrationModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  emoji?: string
}

const CONFETTI_COLORS = [
  '#E8834A', '#F5C842', '#2E8B57', '#C0392B',
  '#8B5E3C', '#E8EDF2', '#f9a8d4', '#60a5fa',
]

interface ConfettiPiece {
  id: number
  x: number
  color: string
  delay: number
  size: number
  rotation: number
}

export default function CelebrationModal({ isOpen, onClose, title, emoji = '🎉' }: CelebrationModalProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    if (isOpen) {
      const pieces = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        delay: Math.random() * 0.5,
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
      }))
      setConfetti(pieces)
    } else {
      setConfetti([])
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Confetti */}
          {confetti.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                opacity: 1,
                y: -20,
                x: `${piece.x}vw`,
                rotate: 0,
              }}
              animate={{
                opacity: 0,
                y: '100vh',
                rotate: piece.rotation * 3,
              }}
              transition={{
                duration: 2.5 + piece.delay,
                ease: 'easeIn',
                delay: piece.delay,
              }}
              className="confetti-piece"
              style={{
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                position: 'fixed',
                top: 0,
                zIndex: 60,
              }}
            />
          ))}

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.4, ease: 'easeOut', type: 'spring' }}
            className="relative w-full max-w-sm bg-soro-surface border border-soro-gold/20 rounded-3xl shadow-2xl shadow-soro-gold/5 overflow-hidden text-center"
          >
            {/* Glow */}
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-soro-gold/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-soro-ember/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative px-8 py-10">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-soro-gold/10 flex items-center justify-center mx-auto mb-6"
              >
                <Award size={40} className="text-soro-gold" />
              </motion.div>

              {/* Emoji */}
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="text-5xl mb-4"
              >
                {emoji}
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-display font-bold text-soro-mist mb-2"
              >
                You did that!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-soro-fade text-sm mb-1"
              >
                &ldquo;{title}&rdquo;
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-soro-gold text-base font-semibold font-display mb-8"
              >
                E don clear! ✨
              </motion.p>

              {/* Action */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  slideFill
                  onClick={onClose}
                  variant="gold"
                  size="lg"
                  fullWidth
                  leftIcon={<Sparkles size={18} />}
                >
                  Keep going
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
