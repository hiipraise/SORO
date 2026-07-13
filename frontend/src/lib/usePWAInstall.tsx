import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'

const DISMISSED_KEY = 'soro-pwa-dismissed'

interface PWAInstallContextValue {
  /** The captured beforeinstallprompt event, null if not available / not on Chrome */
  deferredPrompt: Event | null
  /** Whether the app is already installed (standalone mode) */
  isInstalled: boolean
  /** Whether the user is on iOS Safari (which doesn't support beforeinstallprompt) */
  isIOS: boolean
  /** Whether to show the install prompt UI */
  showPrompt: boolean
  /** Trigger the native install prompt */
  handleInstall: () => Promise<void>
  /** Dismiss the install prompt (persisted to localStorage) */
  handleDismiss: () => void
  /** Reset the dismissed flag (for testing) */
  resetDismissed: () => void
  /** Whether the prompt was ever dismissed in this browser */
  wasDismissed: boolean
}

const PWAInstallContext = createContext<PWAInstallContextValue | null>(null)

function detectIOS(): boolean {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(ua)
}

function detectInstalled(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  )
}

export function PWAInstallProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [wasDismissed, setWasDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISSED_KEY) === 'true'
    } catch {
      return false
    }
  })
  const isInstalled = detectInstalled()
  const isIOS = detectIOS()
  useEffect(() => {
    // If already installed, don't bother listening
    if (isInstalled) return

    const handler = (e: Event) => {
      e.preventDefault()
      console.log('[PWA] beforeinstallprompt event captured:', e)
      setDeferredPrompt(e)

      // Show prompt after a delay unless previously dismissed
      if (!wasDismissed) {
        setTimeout(() => setShowPrompt(true), 3000)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)
    console.log('[PWA] beforeinstallprompt listener registered')

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      console.log('[PWA] beforeinstallprompt listener removed')
    }
  }, [isInstalled, wasDismissed])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) {
      console.log('[PWA] No deferred prompt available')
      return
    }

    const promptEvent = deferredPrompt as Event & {
      prompt: () => Promise<void>
      userChoice: Promise<{ outcome: string }>
    }

    console.log('[PWA] Triggering install prompt')
    await promptEvent.prompt()
    const result = await promptEvent.userChoice
    console.log('[PWA] Install result:', result.outcome)

    if (result.outcome === 'accepted') {
      setShowPrompt(false)
    }

    setDeferredPrompt(null)
  }, [deferredPrompt])

  const handleDismiss = useCallback(() => {
    setShowPrompt(false)
    setWasDismissed(true)
    try {
      localStorage.setItem(DISMISSED_KEY, 'true')
      console.log('[PWA] Dismissed — saved to localStorage')
    } catch {
      // localStorage not available
    }
  }, [])

  const resetDismissed = useCallback(() => {
    setWasDismissed(false)
    try {
      localStorage.removeItem(DISMISSED_KEY)
      console.log('[PWA] Dismissed flag reset')
    } catch {
      // localStorage not available
    }
  }, [])

  // Expose reset on window in dev for easy console testing
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    ;(window as any).__resetPWADismissed = resetDismissed
  }

  return (
    <PWAInstallContext.Provider
      value={{
        deferredPrompt,
        isInstalled,
        isIOS,
        showPrompt,
        handleInstall,
        handleDismiss,
        resetDismissed,
        wasDismissed,
      }}
    >
      {children}
    </PWAInstallContext.Provider>
  )
}

export function usePWAInstall(): PWAInstallContextValue {
  const ctx = useContext(PWAInstallContext)
  if (!ctx) {
    throw new Error('usePWAInstall must be used within <PWAInstallProvider>')
  }
  return ctx
}
