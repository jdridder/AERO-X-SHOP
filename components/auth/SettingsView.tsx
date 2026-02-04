"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  getProfile,
  updateProfile,
  changePassword,
  ProfileResponse,
} from "@/lib/services/api";
import {
  User,
  Shield,
  MapPin,
  Save,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Settings,
} from "lucide-react";
import Link from "next/link";

interface Toast {
  type: "success" | "error";
  message: string;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export function SettingsView() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const router = useRouter();

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: "",
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchProfile = async () => {
    try {
      const data: ProfileResponse = await getProfile();
      const nameParts = (data.name || "").split(" ");
      setProfileData({
        name: data.name || "",
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: data.email,
        address: data.shippingAddress?.address || "",
        city: data.shippingAddress?.city || "",
        postalCode: data.shippingAddress?.postalCode || "",
      });
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Failed to fetch profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSave = async () => {
    setIsSaving(true);
    try {
      const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
      const shippingAddress = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        address: profileData.address,
        city: profileData.city,
        postalCode: profileData.postalCode,
      };
      await updateProfile(fullName, shippingAddress);
      showToast("success", "PROFILE UPDATED SUCCESSFULLY");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("error", "New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showToast("error", "Password must be at least 8 characters");
      return;
    }

    if (!/[0-9]/.test(passwordData.newPassword)) {
      showToast("error", "Password must contain at least one digit");
      return;
    }

    if (!/[A-Z]/.test(passwordData.newPassword)) {
      showToast("error", "Password must contain at least one uppercase letter");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      showToast("success", "ACCESS KEY UPDATED");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleProfileInput = (key: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [key]: value }));
  };

  const handlePasswordInput = (key: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [key]: value }));
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <Loader2 className="w-10 h-10 text-accent-a animate-spin" />
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  "0 0 10px rgba(77, 77, 255, 0.3)",
                  "0 0 30px rgba(77, 77, 255, 0.5)",
                  "0 0 10px rgba(77, 77, 255, 0.3)",
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          <span className="font-mono text-xs text-primary/50 tracking-widest">LOADING SETTINGS...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pb-32 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(rgba(77, 77, 255, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(77, 77, 255, 0.2) 1px, transparent 1px)
          `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 font-mono text-xs text-primary/50 hover:text-accent-a transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO COMMAND CENTER
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <GlassPanel className="p-6 rounded-2xl backdrop-blur-xl border-accent-a/20 bg-[var(--glass-bg)]/90">
            <div className="flex items-center gap-4">
              <motion.div
                className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-a/20 to-accent-b/20 border border-accent-a/40 flex items-center justify-center"
                animate={{
                  boxShadow: [
                    "0 0 10px rgba(77, 77, 255, 0.2)",
                    "0 0 25px rgba(77, 77, 255, 0.4)",
                    "0 0 10px rgba(77, 77, 255, 0.2)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Settings className="w-5 h-5 text-accent-a" />
              </motion.div>
              <div>
                <h1 className="font-headline text-2xl md:text-3xl font-bold tracking-widest text-primary mb-1">
                  PILOT SETTINGS
                </h1>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-primary/40 tracking-wider">OPERATOR:</span>
                  <span className="font-mono text-xs text-accent-b tracking-wider">{user?.shortId || "USR-0000"}</span>
                </div>
              </div>
            </div>
          </GlassPanel>
        </motion.div>

        {/* Profile Section */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <GlassPanel className="rounded-2xl backdrop-blur-xl border-accent-a/20 bg-[var(--glass-bg)]/90 overflow-hidden">
            <div className="p-6 border-b border-primary/10">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-accent-b" />
                <h2 className="font-headline text-lg font-bold tracking-widest text-primary">
                  OPERATOR PROFILE
                </h2>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SettingsInput
                  label="FIRST NAME"
                  value={profileData.firstName}
                  onChange={(e) => handleProfileInput("firstName", e.target.value)}
                />
                <SettingsInput
                  label="LAST NAME"
                  value={profileData.lastName}
                  onChange={(e) => handleProfileInput("lastName", e.target.value)}
                />
              </div>

              <SettingsInput
                label="COMM-LINK (EMAIL)"
                value={profileData.email}
                disabled
                hint="Email cannot be changed"
              />

              <div className="pt-4 border-t border-primary/10">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-accent-a" />
                  <span className="font-headline text-sm font-bold tracking-widest text-primary/60">
                    DEFAULT DEPLOYMENT COORDINATES
                  </span>
                </div>

                <div className="space-y-4">
                  <SettingsInput
                    label="STREET ADDRESS"
                    value={profileData.address}
                    onChange={(e) => handleProfileInput("address", e.target.value)}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SettingsInput
                      label="SECTOR (CITY)"
                      value={profileData.city}
                      onChange={(e) => handleProfileInput("city", e.target.value)}
                    />
                    <SettingsInput
                      label="POSTAL CODE"
                      value={profileData.postalCode}
                      onChange={(e) => handleProfileInput("postalCode", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <motion.button
                onClick={handleProfileSave}
                disabled={isSaving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full md:w-auto px-8 py-3 bg-accent-b text-black font-headline font-bold text-sm tracking-widest rounded-lg shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? "SAVING..." : "SAVE PROFILE"}
              </motion.button>
            </div>
          </GlassPanel>
        </motion.div>

        {/* Security Section */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <GlassPanel className="rounded-2xl backdrop-blur-xl border-red-500/10 bg-[var(--glass-bg)]/90 overflow-hidden">
            <div className="p-6 border-b border-primary/10">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-red-400" />
                <h2 className="font-headline text-lg font-bold tracking-widest text-primary">
                  SECURITY PROTOCOLS
                </h2>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="p-4 rounded-lg border border-primary/10 bg-white/[0.02]">
                <h3 className="font-headline text-sm font-bold tracking-widest text-primary/60 mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-accent-a" />
                  CHANGE ACCESS KEY
                </h3>

                <div className="space-y-4">
                  <PasswordInput
                    label="CURRENT ACCESS KEY"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordInput("currentPassword", e.target.value)}
                    show={showPasswords.current}
                    onToggle={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                  />

                  <PasswordInput
                    label="NEW ACCESS KEY"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordInput("newPassword", e.target.value)}
                    show={showPasswords.new}
                    onToggle={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                    hint="Min 8 chars, 1 digit, 1 uppercase"
                  />

                  <PasswordInput
                    label="CONFIRM NEW ACCESS KEY"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordInput("confirmPassword", e.target.value)}
                    show={showPasswords.confirm}
                    onToggle={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                  />
                </div>

                <motion.button
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 w-full md:w-auto px-8 py-3 bg-white/5 border border-primary/20 text-primary font-headline font-bold text-sm tracking-widest rounded-lg hover:border-accent-a/40 hover:bg-accent-a/5 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isChangingPassword ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  {isChangingPassword ? "UPDATING..." : "UPDATE ACCESS KEY"}
                </motion.button>
              </div>

              {/* Danger Zone */}
              <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
                <h3 className="font-headline text-sm font-bold tracking-widest text-red-400 mb-2">
                  DANGER ZONE
                </h3>
                <p className="font-mono text-[10px] text-primary/40 mb-4">
                  Terminate your session and return to login portal.
                </p>
                <motion.button
                  onClick={logout}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 bg-red-500/10 border border-red-500/30 text-red-400 font-headline text-xs tracking-widest rounded-lg hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300"
                >
                  TERMINATE SESSION
                </motion.button>
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-full font-mono text-sm tracking-wider ${
              toast.type === "success"
                ? "bg-accent-b text-black shadow-[0_0_30px_rgba(204,255,0,0.4)]"
                : "bg-red-500/90 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SettingsInput({
  label,
  value,
  onChange,
  disabled,
  hint,
}: {
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="font-headline text-xs font-bold text-primary/40 tracking-widest">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="h-12 w-full rounded-md border border-primary/10 bg-white/5 px-4 font-mono text-sm text-primary caret-accent-b transition-all focus:outline-none focus:border-accent-a/50 focus:bg-accent-a/5 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {hint && (
        <p className="font-mono text-[9px] text-primary/30 tracking-wider">{hint}</p>
      )}
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  show,
  onToggle,
  hint,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  show: boolean;
  onToggle: () => void;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="font-headline text-xs font-bold text-primary/40 tracking-widest">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="h-12 w-full rounded-md border border-primary/10 bg-white/5 px-4 pr-12 font-mono text-sm text-primary caret-accent-b transition-all focus:outline-none focus:border-accent-a/50 focus:bg-accent-a/5"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary/70 transition-colors"
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {hint && (
        <p className="font-mono text-[9px] text-primary/30 tracking-wider">{hint}</p>
      )}
    </div>
  );
}
