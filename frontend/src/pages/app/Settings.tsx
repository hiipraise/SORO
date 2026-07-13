import { useState } from "react";
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
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageTransition from "@/components/layout/PageTransition";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import Card from "@/components/shared/Card";
import Modal from "@/components/shared/Modal";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/components/shared/Toast";
import { useNavigate } from "react-router-dom";
import {
  logout,
  updateSettings,
  changePassword,
  exportAccountData,
  getSettings,
  deleteAccount,
  claimAccount,
} from "@/lib/api";
import { CRISIS_NUMBER, CRISIS_ORGANIZATION } from "@/lib/crisis";
import { usePWAInstall } from "@/lib/usePWAInstall";
import { motion } from "framer-motion";
import { staggerItem } from "@/lib/motion";

export default function Settings() {
  const { user, authMode, logout: storeLogout, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [claimEmail, setClaimEmail] = useState("");
  const [claimPassword, setClaimPassword] = useState("");
  const [claimError, setClaimError] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { deferredPrompt, handleInstall: pwaInstall, isIOS } = usePWAInstall();
  const addToast = useToastStore((s) => s.addToast);
  const queryClient = useQueryClient();

  const { data: settings } = useQuery<{
    notification_anchor?: boolean;
    notification_reminder?: boolean;
  }>({
    queryKey: ["settings"],
    queryFn: getSettings as () => Promise<{
      notification_anchor?: boolean;
      notification_reminder?: boolean;
    }>,
  });

  const notifyAnchor = settings?.notification_anchor ?? true;
  const notifyReminder = settings?.notification_reminder ?? true;

  const notifyMutation = useMutation({
    mutationFn: (data: {
      notification_anchor: boolean;
      notification_reminder: boolean;
    }) => updateSettings(data as Record<string, unknown>),
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      addToast("Notification preferences updated", "success");
    },
    onError: () => {
      addToast("Failed to save notification setting", "error");
    },
  });

  const emailMutation = useMutation({
    mutationFn: (newEmail: string) =>
      updateSettings({ email: newEmail } as Record<string, unknown>),
    onSuccess: (_data, newEmail) => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      if (user) {
        setUser(
          { ...user, email: newEmail },
          useAuthStore.getState().token!,
          "email",
        );
      }
      addToast("Email updated successfully", "success");
      setShowEmailModal(false);
    },
    onError: (err: any) => {
      setEmailError(err.message || "Failed to update email");
    },
  });

  const passwordMutation = useMutation({
    mutationFn: ({ current, newPw }: { current: string; newPw: string }) =>
      changePassword(current, newPw),
    onSuccess: () => {
      addToast("Password changed successfully", "success");
      setShowPasswordModal(false);
    },
    onError: (err: any) => {
      setPasswordError(err.message || "Failed to change password");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAccount(),
    onSuccess: () => {
      storeLogout();
      addToast("Your account has been permanently deleted.", "info");
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    },
    onError: () => {
      addToast("Failed to delete account. Please try again.", "error");
      setIsDeleting(false);
      setShowDeleteModal(false);
    },
  });

  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      await pwaInstall();
      addToast("SORO installed!", "success");
    } else if (isIOS) {
      addToast(
        "Tap the Share button → Add to Home Screen to install SORO.",
        "info",
      );
    } else {
      addToast(
        'Open this page in your browser and use the "Add to Home Screen" option.',
        "info",
      );
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = (await exportAccountData()) as Record<string, unknown>;
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `soro-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast("Data exported successfully", "success");
    } catch {
      addToast("Failed to export data", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      storeLogout();
      addToast("See you soon. You're signed out.", "info");
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch {
      addToast("Failed to sign out", "error");
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    deleteMutation.mutate(undefined, {
      onSettled: () => {
        setIsDeleting(false);
        setShowDeleteModal(false);
      },
    });
  };

  const handleNotifyToggle = (key: "anchor" | "reminder", value: boolean) => {
    notifyMutation.mutate({
      notification_anchor: key === "anchor" ? value : notifyAnchor,
      notification_reminder: key === "reminder" ? value : notifyReminder,
    });
  };

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
        <Card variant="danger">
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
        </Card>

        {/* Account Section */}
        <motion.section variants={staggerItem}>
          <h2 className="text-sm font-medium text-soro-fade uppercase tracking-wider mb-3">
            Account
          </h2>
          <Card className="divide-y divide-soro-earth/10">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User size={18} className="text-soro-fade" />
                <div>
                  <p className="text-sm text-soro-mist">
                    {authMode === "anonymous"
                      ? "Anonymous User"
                      : user?.email || "Not set"}
                  </p>
                  <p className="text-xs text-soro-fade">
                    {authMode === "anonymous"
                      ? "Anonymous mode"
                      : "Email account"}
                  </p>
                </div>
              </div>
            </div>

            {/* P0.3: Save progress prompt for anonymous users */}
            {authMode === "anonymous" && (
              <div className="p-4 bg-soro-ember/5 border-t border-soro-ember/10 rounded-b-2xl">
                <p className="text-xs text-soro-ember font-medium mb-1">
                  Save your progress — create an account
                </p>
                <p className="text-[10px] text-soro-fade/70 mb-2 leading-relaxed">
                  Your entries are saved to this device. Create a free account
                  to keep them if you switch phones or clear your browser.
                </p>
                <Button
                  slideFill
                  size="sm"
                  onClick={() => {
                    setClaimEmail("");
                    setClaimPassword("");
                    setClaimError("");
                    setShowClaimModal(true);
                  }}
                >
                  Create free account
                </Button>
              </div>
            )}

            {authMode !== "anonymous" && (
              <>
                <button
                  onClick={() => {
                    setEmail(user?.email || "");
                    setEmailError("");
                    setShowEmailModal(true);
                  }}
                  className="w-full p-4 flex items-center justify-between hover:bg-soro-earth/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-soro-fade" />
                    <div>
                      <p className="text-sm text-soro-mist">Change email</p>
                      <p className="text-xs text-soro-fade">
                        Update your email address
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-soro-fade shrink-0" />
                </button>

                <button
                  onClick={() => {
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordError("");
                    setShowPasswordModal(true);
                  }}
                  className="w-full p-4 flex items-center justify-between hover:bg-soro-earth/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Lock size={18} className="text-soro-fade" />
                    <div>
                      <p className="text-sm text-soro-mist">Change password</p>
                      <p className="text-xs text-soro-fade">
                        Update your password
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-soro-fade shrink-0" />
                </button>
              </>
            )}
          </Card>
        </motion.section>

        {/* Notifications */}
        <motion.section variants={staggerItem}>
          <h2 className="text-sm font-medium text-soro-fade uppercase tracking-wider mb-3">
            Notifications
          </h2>
          <Card className="divide-y divide-soro-earth/10">
            <label className="p-4 flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-soro-fade" />
                <div>
                  <p className="text-sm text-soro-mist">Daily anchor time</p>
                  <p className="text-xs text-soro-fade">
                    Get a notification for today's anchor
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyAnchor}
                disabled={notifyMutation.isPending}
                onChange={(e) => handleNotifyToggle("anchor", e.target.checked)}
                className="w-5 h-5 rounded border-soro-earth/30 bg-soro-surface text-soro-ember focus:ring-soro-ember/40 disabled:opacity-50"
              />
            </label>

            <label className="p-4 flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-soro-fade" />
                <div>
                  <p className="text-sm text-soro-mist">Check-in reminder</p>
                  <p className="text-xs text-soro-fade">
                    Remind me if I haven't checked in
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyReminder}
                disabled={notifyMutation.isPending}
                onChange={(e) =>
                  handleNotifyToggle("reminder", e.target.checked)
                }
                className="w-5 h-5 rounded border-soro-earth/30 bg-soro-surface text-soro-ember focus:ring-soro-ember/40 disabled:opacity-50"
              />
            </label>
          </Card>
        </motion.section>

        {/* Privacy & Data */}
        <motion.section variants={staggerItem}>
          <h2 className="text-sm font-medium text-soro-fade uppercase tracking-wider mb-3">
            Privacy & Data
          </h2>
          <Card className="divide-y divide-soro-earth/10">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Download size={18} className="text-soro-fade" />
                <div>
                  <p className="text-sm text-soro-mist">Export my data</p>
                  <p className="text-xs text-soro-fade">
                    Download all your entries
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                isLoading={isExporting}
                onClick={handleExport}
              >
                Export
              </Button>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trash2 size={18} className="text-soro-fade" />
                <div>
                  <p className="text-sm text-soro-mist">Delete account</p>
                  <p className="text-xs text-soro-fade">
                    Permanently delete all data
                  </p>
                </div>
              </div>{" "}
              <Button
                slideFill
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete
              </Button>
            </div>
          </Card>
        </motion.section>

        {/* PWA */}
        <motion.section variants={staggerItem}>
          <h2 className="text-sm font-medium text-soro-fade uppercase tracking-wider mb-3">
            App
          </h2>
          <Card padding="sm">
            <p className="text-sm text-soro-mist mb-2">
              Add SORO to your home screen
            </p>
            <p className="text-xs text-soro-fade mb-3">
              For the best experience, install SORO as an app on your device.
            </p>
            <Button
              slideFill
              variant="secondary"
              size="sm"
              onClick={handleInstallApp}
            >
              Install app
            </Button>
          </Card>
        </motion.section>

        {/* About */}
        <motion.section variants={staggerItem}>
          <h2 className="text-sm font-medium text-soro-fade uppercase tracking-wider mb-3">
            About
          </h2>
          <Card className="divide-y divide-soro-earth/10">
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm text-soro-mist">Version</span>
              <span className="text-sm text-soro-fade">0.1.0</span>
            </div>
            <div className="p-4">
              <p className="text-xs text-soro-fade leading-relaxed">
                SORO is a mental wellness and financial resilience platform for
                Nigerian youth. Built in Lagos by someone who lived it. Free
                forever. No premium. No paywall.
              </p>
            </div>
          </Card>
        </motion.section>

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

      {/* P0.3: Claim Account Modal */}
      <Modal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        title="Save your progress"
      >
        <p className="text-xs text-soro-fade mb-4 leading-relaxed">
          Create a free account to keep all your check-ins, journal entries,
          and financial data. You can always come back to them.
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setClaimError("");
            if (!claimEmail || !claimEmail.includes("@")) {
              setClaimError("Please enter a valid email address");
              return;
            }
            if (!claimPassword || claimPassword.length < 6) {
              setClaimError("Password must be at least 6 characters");
              return;
            }
            setIsClaiming(true);
            try {
              const data = await claimAccount(claimEmail, claimPassword);
              setUser(
                {
                  id: data.user.id as string,
                  email: data.user.email as string,
                  is_anonymous: false,
                  created_at: data.user.created_at as string,
                },
                data.token,
                "email",
              );
              addToast("Account created! All your data is saved.", "success");
              setShowClaimModal(false);
            } catch (err: any) {
              setClaimError(err.message || "Failed to create account");
            } finally {
              setIsClaiming(false);
            }
          }}
          className="space-y-4"
        >
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={claimEmail}
            onChange={(e) => setClaimEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            value={claimPassword}
            onChange={(e) => setClaimPassword(e.target.value)}
          />

          {claimError && (
            <p className="text-xs text-soro-danger bg-soro-danger/5 rounded-lg px-3 py-2">
              {claimError}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => setShowClaimModal(false)}
            >
              Skip for now
            </Button>
            <Button slideFill type="submit" fullWidth isLoading={isClaiming}>
              Save my data
            </Button>
          </div>
        </form>
      </Modal>

      {/* Change Email Modal */}
      <Modal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        title="Change email"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setEmailError("");
            if (!email || !email.includes("@")) {
              setEmailError("Please enter a valid email address");
              return;
            }
            setIsSavingEmail(true);
            emailMutation.mutate(email, {
              onSettled: () => setIsSavingEmail(false),
            });
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
            <Button slideFill type="submit" fullWidth isLoading={isSavingEmail}>
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
            e.preventDefault();
            setPasswordError("");
            if (!currentPassword) {
              setPasswordError("Please enter your current password");
              return;
            }
            if (!newPassword || newPassword.length < 6) {
              setPasswordError("New password must be at least 6 characters");
              return;
            }
            if (newPassword !== confirmPassword) {
              setPasswordError("New passwords do not match");
              return;
            }
            setIsSavingPassword(true);
            passwordMutation.mutate(
              { current: currentPassword, newPw: newPassword },
              {
                onSettled: () => setIsSavingPassword(false),
              },
            );
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
              slideFill
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
          </Button>{" "}
          <Button
            slideFill
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
            slideFill
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
  );
}
