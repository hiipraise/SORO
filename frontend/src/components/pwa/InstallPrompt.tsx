import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setDismissed(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [dismissed])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    ;(deferredPrompt as Event & { prompt: () => Promise<void> }).prompt()
    const result = await (deferredPrompt as Event & { userChoice: Promise<{ outcome: string }> }).userChoice
    if (result.outcome === 'accepted') {
      setShowPrompt(false)
      setDismissed(true)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-24 md:bottom-4 left-4 right-4 z-40 max-w-sm mx-auto"
        >
          <div className="glass-card rounded-2xl p-4 border-soro-earth/20 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-soro-ember/10 flex items-center justify-center shrink-0">
                <Download size={20} className="text-soro-ember" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-soro-mist">
                  Install SORO
                </h3>
                <p className="text-xs text-soro-fade mt-0.5">
                  Add to your home screen for the best experience.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={handleInstall}
                    className="btn-ember px-4 py-1.5 rounded-xl text-xs font-semibold"
                  >
                    Install
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="text-xs text-soro-fade hover:text-soro-mist transition-colors"
                  >
                    Not now
                  </button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-soro-fade hover:text-soro-mist transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
