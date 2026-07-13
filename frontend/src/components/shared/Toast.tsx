import { toast as sonnerToast } from 'sonner'
import { create } from 'zustand'

type ToastType = 'success' | 'error' | 'info'

interface ToastStore {
  addToast: (message: string, type?: ToastType) => void
}

export const useToastStore = create<ToastStore>(() => ({
  addToast: (message, type = 'info') => {
    switch (type) {
      case 'success':
        sonnerToast.success(message)
        break
      case 'error':
        sonnerToast.error(message)
        break
      case 'info':
        sonnerToast(message)
        break
    }
  },
}))

export { Toaster } from 'sonner'
