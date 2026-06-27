import { useState } from 'react'
import { Phone, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const CRISIS_NUMBER = '08111909909'

export default function CrisisButton() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-72 glass-card rounded-2xl p-4 border-soro-danger/30 shadow-xl shadow-soro-danger/10"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-semibold text-soro-danger">
                Need to talk to someone?
              </h3>
              <button
                onClick={() => setExpanded(false)}
                className="text-soro-fade hover:text-soro-mist transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-soro-fade mb-3 leading-relaxed">
              You don't have to go through it alone. Help is available, 24/7.
            </p>
            <a
              href={`tel:${CRISIS_NUMBER}`}
              className="btn-crisis inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm w-full justify-center"
            >
              <Phone size={16} />
              Call {CRISIS_NUMBER}
            </a>
            <p className="text-[10px] text-soro-fade/60 mt-2 text-center">
              Mental Health Awareness Nigeria Initiative
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setExpanded(!expanded)}
        className="btn-crisis w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
        aria-label="Crisis helpline"
      >
        {expanded ? <X size={20} /> : <Phone size={20} />}
      </button>
    </div>
  )
}
