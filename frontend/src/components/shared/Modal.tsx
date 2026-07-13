import { type ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  maxWidth?: string
  showClose?: boolean
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
  showClose = true,
}: ModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full ${maxWidth} bg-soro-surface border border-soro-earth/20 rounded-2xl shadow-modal shadow-black/50`}
              >
                {(title || showClose) && (
                  <div className="flex items-center justify-between px-6 py-4 border-b border-soro-earth/10">
                    <Dialog.Title className="text-lg font-display font-semibold text-soro-mist m-0">
                      {title}
                    </Dialog.Title>
                    {showClose && (
                      <Dialog.Close asChild>
                        <button
                          className="p-1 rounded-lg text-soro-fade hover:text-soro-mist hover:bg-soro-earth/10 transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </Dialog.Close>
                    )}
                  </div>
                )}
                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                  {children}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
