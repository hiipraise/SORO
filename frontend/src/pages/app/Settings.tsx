import { useState } from 'react'
import {
  User,
  Bell,
  Shield,
  Download,
  Trash2,
  ChevronRight,
  Heart,
  LogOut,
} from 'lucide-react'
import PageTransition from '@/components/layout/PageTransition'
import Button from '@/components/shared/Button'
import Modal from '@/components/shared/Modal'
import { useAuthStore } from '@/stores/authStore'
import { logout } from '@/lib/api'

export default function Settings() {
  const { user, authMode, logout: storeLogout } = useAuthStore()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [notifyAnchor, setNotifyAnchor] = useState(true)
  const [notifyReminder, setNotifyReminder] = useState(true)

  const handleLogout = async () => {
    await logout()
    storeLogout()
    window.location.href = '/'
  }

  const handleDeleteAccount = () => {
    // TODO: API call
    storeLogout()
    window.location.href = '/'
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
                MANI Helpline: 08111909909 — Available 24/7
              </p>
              <a
                href="tel:08111909909"
                className="btn-crisis inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Call 08111909909
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
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-soro-fade" />
                    <div>
                      <p className="text-sm text-soro-mist">Change email</p>
                      <p className="text-xs text-soro-fade">Update your email address</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-soro-fade" />
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-soro-fade" />
                    <div>
                      <p className="text-sm text-soro-mist">Change password</p>
                      <p className="text-xs text-soro-fade">Update your password</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-soro-fade" />
                </div>
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
                onChange={(e) => setNotifyAnchor(e.target.checked)}
                className="w-5 h-5 rounded border-soro-earth/30 bg-soro-surface text-soro-ember focus:ring-soro-ember/40"
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
                onChange={(e) => setNotifyReminder(e.target.checked)}
                className="w-5 h-5 rounded border-soro-earth/30 bg-soro-surface text-soro-ember focus:ring-soro-ember/40"
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
              <Button variant="ghost" size="sm">
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
            <Button variant="secondary" size="sm">
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
            onClick={handleLogout}
          >
            Log out
          </Button>
        </div>
      </div>

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
            onClick={handleDeleteAccount}
          >
            Delete forever
          </Button>
        </div>
      </Modal>
    </PageTransition>
  )
}
