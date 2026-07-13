import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Smartphone } from 'lucide-react'
import { usePWAInstall } from '@/lib/usePWAInstall'

export default function InstallPrompt() {
  const {
    deferredPrompt,
    isInstalled,
    isIOS,
    showPrompt,
    handleInstall,
    handleDismiss,
  } = usePWAInstall()

  // Don't show anything if already installed
  if (isInstalled) return null

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

                {/* iOS instructions — Safari doesn't support beforeinstallprompt */}
                {isIOS ? (
                  <>
                    <p className="text-xs text-soro-fade mt-1 leading-relaxed">
                      Add SORO to your home screen for the best experience.
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-soro-fade/70">
                      <Smartphone size={14} className="shrink-0" />
                      <span>
                        Tap{' '}
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-soro-surface text-soro-mist text-[10px] font-bold border border-soro-earth/20">
                          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                            <rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
                            <line x1="6" y1="12" x2="10" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                          </svg>
                        </span>{' '}
                        Share →{' '}
                        <span className="font-semibold text-soro-mist">Add to Home Screen</span>
                      </span>
                    </div>
                  </>
                ) : deferredPrompt ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <p className="text-xs text-soro-fade mt-0.5">
                      Install SORO for quick access and offline support.
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={handleDismiss}
                        className="text-xs text-soro-fade hover:text-soro-mist transition-colors"
                      >
                        Got it
                      </button>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={handleDismiss}
                className="text-soro-fade hover:text-soro-mist transition-colors shrink-0"
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
