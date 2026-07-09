import { useState, useEffect } from 'react'
import {
  User,
  Bell,
  Download,
  Trash2,
  ChevronRight,
  Heart,
  LogOut,
  Mail,
  Lock,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageTransition from '@/components/layout/PageTransition'
import Button from '@/components/shared/Button'
import Input from '@/components/shared/Input'
import Modal from '@/components/shared/Modal'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/components/shared/Toast'
import { logout, updateSettings, changePassword, exportAccountData, getSettings, deleteAccount } from '@/lib/api'
import { CRISIS_NUMBER, CRISIS_ORGANIZATION } from '@/lib/crisis'

export default function Settings() {
  const { user, authMode, logout: storeLogout, setUser } = useAuthStore()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const addToast = useToastStore((s) => s.addToast)
  const queryClient = useQueryClient()

  const { data: settings } = useQuery<{ notification_anchor?: boolean; notification_reminder?: boolean }>({
    queryKey: ['settings'],
    queryFn: getSettings as () => Promise<{ notification_anchor?: boolean; notification_reminder?: boolean }>,
  })

  const notifyAnchor = settings?.notification_anchor ?? true
  const notifyReminder = settings?.notification_reminder ?? true

  const notifyMutation = useMutation({
    mutationFn: (data: { notification_anchor: boolean; notification_reminder: boolean }) =>
      updateSettings(data as Record<string, unknown>),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      addToast('Notification preferences updated', 'success')
    },
    onError: () => {
      addToast('Failed to save notification setting', 'error')
    },
  })

  const emailMutation = useMutation({
    mutationFn: (newEmail: string) => updateSettings({ email: newEmail } as Record<string, unknown>),
    onSuccess: (_data, newEmail) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      if (user) {
        setUser({ ...user, email: newEmail }, useAuthStore.getState().token!, 'email')
      }
      addToast('Email updated successfully', 'success')
      setShowEmailModal(false)
    },
    onError: (err: any) => {
      setEmailError(err.message || 'Failed to update email')
    },
  })

  const passwordMutation = useMutation({
    mutationFn: ({ current, newPw }: { current: string; newPw: string }) =>
      changePassword(current, newPw),
    onSuccess: () => {
      addToast('Password changed successfully', 'success')
      setShowPasswordModal(false)
    },
    onError: (err: any) => {
      setPasswordError(err.message || 'Failed to change password')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteAccount(),
    onSuccess: () => {
      storeLogout()
      addToast('Your account has been permanently deleted.', 'info')
      setTimeout(() => { window.location.href = '/' }, 500)
    },
    onError: () => {
      addToast('Failed to delete account. Please try again.', 'error')
      setIsDeleting(false)
      setShowDeleteModal(false)
    },
  })

  const [isSavingEmail, setIsSavingEmail] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Listen for PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      ;(deferredPrompt as Event & { prompt: () => Promise<void> }).prompt()
      const result = await (deferredPrompt as Event & { userChoice: Promise<{ outcome: string }> }).userChoice
      if (result.outcome === 'accepted') {
        addToast('SORO installed!', 'success')
      }
      setDeferredPrompt(null)
    } else {
      addToast('Open this page in your browser and use the "Add to Home Screen" option.', 'info')
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const data = await exportAccountData() as Record<string, unknown>
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `soro-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      addToast('Data exported successfully', 'success')
    } catch {
      addToast('Failed to export data', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      storeLogout()
      addToast("See you soon. You're signed out.", 'info')
      setTimeout(() => { window.location.href = '/' }, 500)
    } catch {
      addToast('Failed to sign out', 'error')
      setIsLoggingOut(false)
      setShowLogoutModal(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    deleteMutation.mutate(undefined, {
      onSettled: () => {
        setIsDeleting(false)
        setShowDeleteModal(false)
      },
    })
  }

  const handleNotifyToggle = (key: 'anchor' | 'reminder', value: boolean) => {
    notifyMutation.mutate({
      notification_anchor: key === 'anchor' ? value : notifyAnchor,
      notification_reminder: key === 'reminder' ? value : notifyReminder,
    })
  }

  return (
    <PageTransition>
      <div className="space-y-8 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-soro-mist">
            Settings
          </h1>
          <p className="text-sm text-soro-fade mt-1">
            Manage your account and preferences
          </p>
        </div>

        {/* Crisis Resources — always pinned at top */}
        <div className="glass-card rounded-2xl p-5 border-soro-danger/20 bg-soro-danger/5">
          <div className="flex items-start gap-3">
            <Heart size={20} className="text-soro-danger shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-soro-mist mb-1">
                Need to talk to someone right now?
              </h3>
              <p className="text-xs text-soro-fade mb-3">
                {CRISIS_ORGANIZATION}: {CRISIS_NUMBER} — Available 24/7
              </p>
              <a
                href={`tel:${CRISIS_NUMBER}`}
                className="btn-crisis inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Call {CRISIS_NUMBER}
              </a>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <section>
          <h2 className="text-sm font-medium text-soro-fade uppercase tracking-wider mb-3">
            Account
          </h2>
          <div className="glass-card rounded-2xl divide-y divide-soro-earth/10">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User size={18} className="text-soro-fade" />
                <div>
                  <p className="text-sm text-soro-mist">
                    {authMode === 'anonymous' ? 'Anonymous User' : user?.email || 'Not set'}
                  </p>
                  <p className="text-xs text-soro-fade">
                    {authMode === 'anonymous' ? 'Anonymous mode' : 'Email account'}
                  </p>
                </div>
              </div>
            </div>

            {authMode !== 'anonymous' && (
              <>
                <button
                  onClick={() => {
                    setEmail(user?.email || '')
                    setEmailError('')
                    setShowEmailModal(true)
                  }}
                  className="w-full p-4 flex items-center justify-between hover:bg-soro-earth/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-soro-fade" />
                    <div>
                      <p className="text-sm text-soro-mist">Change email</p>
                      <p className="text-xs text-soro-fade">Update your email address</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-soro-fade shrink-0" />
                </button>

                <button
                  onClick={() => {
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                    setPasswordError('')
                    setShowPasswordModal(true)
                  }}
                  className="w-full p-4 flex items-center justify-between hover:bg-soro-earth/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Lock size={18} className="text-soro-fade" />
                    <div>
                      <p className="text-sm text-soro-mist">Change password</p>
                      <p className="text-xs text-soro-fade">Update your password</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-soro-fade shrink-0" />
                </button>
              </>
            )}
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-sm font-medium text-soro-fade uppercase tracking-wider mb-3">
            Notifications
          </h2>
          <div className="glass-card rounded-2xl divide-y divide-soro-earth/10">
            <label className="p-4 flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-soro-fade" />
                <div>
                  <p className="text-sm text-soro-mist">Daily anchor time</p>
                  <p className="text-xs text-soro-fade">Get a notification for today's anchor</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyAnchor}
                disabled={notifyMutation.isPending}
                onChange={(e) => handleNotifyToggle('anchor', e.target.checked)}
                className="w-5 h-5 rounded border-soro-earth/30 bg-soro-surface text-soro-ember focus:ring-soro-ember/40 disabled:opacity-50"
              />
            </label>

            <label className="p-4 flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-soro-fade" />
                <div>
                  <p className="text-sm text-soro-mist">Check-in reminder</p>
                  <p className="text-xs text-soro-fade">Remind me if I haven't checked in</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyReminder}
                disabled={notifyMutation.isPending}
                onChange={(e) => handleNotifyToggle('reminder', e.target.checked)}
                className="w-5 h-5 rounded border-soro-earth/30 bg-soro-surface text-soro-ember focus:ring-soro-ember/40 disabled:opacity-50"
              />
            </label>
          </div>
        </section>

        {/* Privacy & Data */}
        <section>
          <h2 className="text-sm font-medium text-soro-fade uppercase tracking-wider mb-3">
            Privacy & Data
          </h2>
          <div className="glass-card rounded-2xl divide-y divide-soro-earth/10">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Download size={18} className="text-soro-fade" />
                <div>
                  <p className="text-sm text-soro-mist">Export my data</p>
                  <p className="text-xs text-soro-fade">Download all your entries</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" isLoading={isExporting} onClick={handleExport}>
                Export
              </Button>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trash2 size={18} className="text-soro-fade" />
                <div>
                  <p className="text-sm text-soro-mist">Delete account</p>
                  <p className="text-xs text-soro-fade">Permanently delete all data</p>
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete
              </Button>
            </div>
          </div>
        </section>

        {/* PWA */}
        <section>
          <h2 className="text-sm font-medium text-soro-fade uppercase tracking-wider mb-3">
            App
          </h2>
          <div className="glass-card rounded-2xl p-4">
            <p className="text-sm text-soro-mist mb-2">
              Add SORO to your home screen
            </p>
            <p className="text-xs text-soro-fade mb-3">
              For the best experience, install SORO as an app on your device.
            </p>
            <Button variant="secondary" size="sm" onClick={handleInstall}>
              Install app
            </Button>
          </div>
        </section>

        {/* About */}
        <section>
          <h2 className="text-sm font-medium text-soro-fade uppercase tracking-wider mb-3">
            About
          </h2>
          <div className="glass-card rounded-2xl divide-y divide-soro-earth/10">
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm text-soro-mist">Version</span>
              <span className="text-sm text-soro-fade">0.1.0</span>
            </div>
            <div className="p-4">
              <p className="text-xs text-soro-fade leading-relaxed">
                SORO is a mental wellness and financial resilience platform for
                Nigerian youth. Built in Lagos by someone who lived it.
                Free forever. No premium. No paywall.
              </p>
            </div>
          </div>
        </section>

        {/* Logout */}
        <div className="pb-8">
          <Button
            variant="ghost"
            fullWidth
            size="lg"
            leftIcon={<LogOut size={18} />}
            onClick={() => setShowLogoutModal(true)}
          >
            Log out
          </Button>
        </div>
      </div>

      {/* Change Email Modal */}
      <Modal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        title="Change email"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setEmailError('')
            if (!email || !email.includes('@')) {
              setEmailError('Please enter a valid email address')
              return
            }
            setIsSavingEmail(true)
            emailMutation.mutate(email, {
              onSettled: () => setIsSavingEmail(false),
            })
          }}
          className="space-y-4 pt-1"
        >
          <Input
            label="New email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {emailError && (
            <p className="text-xs text-soro-danger bg-soro-danger/5 rounded-lg px-3 py-2">
              {emailError}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => setShowEmailModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              fullWidth
              isLoading={isSavingEmail}
            >
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change password"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setPasswordError('')
            if (!currentPassword) {
              setPasswordError('Please enter your current password')
              return
            }
            if (!newPassword || newPassword.length < 6) {
              setPasswordError('New password must be at least 6 characters')
              return
            }
            if (newPassword !== confirmPassword) {
              setPasswordError('New passwords do not match')
              return
            }
            setIsSavingPassword(true)
            passwordMutation.mutate({ current: currentPassword, newPw: newPassword }, {
              onSettled: () => setIsSavingPassword(false),
            })
          }}
          className="space-y-4 pt-1"
        >
          <Input
            label="Current password"
            type="password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <Input
            label="New password"
            type="password"
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <Input
            label="Confirm new password"
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {passwordError && (
            <p className="text-xs text-soro-danger bg-soro-danger/5 rounded-lg px-3 py-2">
              {passwordError}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => setShowPasswordModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              fullWidth
              isLoading={isSavingPassword}
            >
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Sign out?"
      >
        <p className="text-sm text-soro-fade mb-6">
          You'll need to sign in again to access your data. Your entries and
          check-ins will still be saved.
        </p>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            fullWidth
            disabled={isLoggingOut}
            onClick={() => setShowLogoutModal(false)}
          >
            Stay signed in
          </Button>
          <Button
            variant="secondary"
            fullWidth
            isLoading={isLoggingOut}
            onClick={handleLogout}
          >
            Sign out
          </Button>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete account?"
      >
        <p className="text-sm text-soro-fade mb-6">
          This action cannot be undone. All your entries, check-ins, and data
          will be permanently deleted.
        </p>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            fullWidth
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            fullWidth
            isLoading={isDeleting}
            onClick={handleDeleteAccount}
          >
            Delete forever
          </Button>
        </div>
      </Modal>
    </PageTransition>
  )
}
