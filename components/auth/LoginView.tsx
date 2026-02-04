"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { login, register } from "@/lib/services/api";
import { useAuth } from "@/lib/hooks/useAuth";
import { Eye, EyeOff, Shield, AlertTriangle, CheckCircle, Zap } from "lucide-react";

type Mode = "login" | "register";

interface Toast {
  type: "success" | "error";
  message: string;
}

export function LoginView() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { loginSuccess } = useAuth();

  // Generate particle data only on the client after mounting
  // Using useMemo with mounted dependency ensures values are stable after first client render
  const particleData = useMemo(() => {
    if (!mounted) return [];
    return [...Array(6)].map((_, i) => ({
      id: i,
      initialX: Math.random() * 100,
      duration: 8 + Math.random() * 4,
    }));
  }, [mounted]);

  // Set mounted to true after initial client render to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    if (type === "error") {
      setTimeout(() => setToast(null), 4000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let response;
      if (mode === "login") {
        response = await login(email, password);
      } else {
        response = await register(email, password);
      }

      // Update global auth state
      loginSuccess({ userId: response.userId, email: response.email });

      // Show success toast
      showToast("success", "SYSTEM ACCESS GRANTED");

      // Trigger exit animation
      setIsRedirecting(true);

      // Smooth transition to dashboard
      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Authentication failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(77, 77, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(77, 77, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px"
        }} />
      </div>

      {/* Floating Particles - Only rendered after client mount to prevent hydration mismatch */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {mounted && particleData.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-accent-a/30 rounded-full"
            initial={{ x: `${particle.initialX}%`, y: "100%", opacity: 0 }}
            animate={{ y: "-10%", opacity: [0, 1, 0] }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.id * 1.5,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Success Transition Overlay */}
      <AnimatePresence>
        {isRedirecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-canvas"
          >
            {/* Expanding Ring Effect */}
            <motion.div
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 20, opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute w-20 h-20 rounded-full border-2 border-accent-b"
            />
            <motion.div
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 15, opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
              className="absolute w-20 h-20 rounded-full border border-accent-a"
            />

            {/* Center Icon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative z-10 flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-accent-b/20 border border-accent-b/50 flex items-center justify-center">
                <Zap className="w-8 h-8 text-accent-b" />
              </div>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="font-headline text-sm tracking-widest text-accent-b"
              >
                INITIALIZING DASHBOARD...
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Login Container */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{
          opacity: isRedirecting ? 0 : 1,
          y: isRedirecting ? -50 : 0,
          scale: isRedirecting ? 0.9 : 1,
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <GlassPanel className="p-8 rounded-2xl backdrop-blur-2xl border-accent-a/30 bg-[var(--glass-bg)]/90">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-a/10 border border-accent-a/30 mb-4"
            >
              <Shield className="w-8 h-8 text-accent-a" />
            </motion.div>
            <h1 className="font-headline text-2xl font-bold tracking-widest text-primary mb-2">
              {mode === "login" ? "SYSTEM ACCESS" : "CREATE CLEARANCE"}
            </h1>
            <p className="font-mono text-xs text-primary/50 tracking-wider">
              AERO-X COMMAND CENTER // {mode === "login" ? "AUTHENTICATION REQUIRED" : "NEW OPERATOR REGISTRATION"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <label className="font-headline text-xs tracking-widest text-primary/60 uppercase">
                Operator ID / Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@aero-x.io"
                required
                disabled={isLoading || isRedirecting}
                className="w-full px-4 py-3 bg-white/5 border border-primary/10 rounded-lg font-mono text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:border-accent-a/50 focus:ring-1 focus:ring-accent-a/20 transition-all duration-300 disabled:opacity-50"
              />
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <label className="font-headline text-xs tracking-widest text-primary/60 uppercase">
                Access Key
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  minLength={8}
                  disabled={isLoading || isRedirecting}
                  className="w-full px-4 py-3 pr-12 bg-white/5 border border-primary/10 rounded-lg font-mono text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:border-accent-a/50 focus:ring-1 focus:ring-accent-a/20 transition-all duration-300 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isRedirecting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary/70 transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading || isRedirecting}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-accent-b text-black font-headline font-bold text-sm tracking-widest rounded-lg shadow-[0_0_30px_rgba(204,255,0,0.3)] hover:shadow-[0_0_40px_rgba(204,255,0,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  AUTHENTICATING...
                </span>
              ) : (
                mode === "login" ? "INITIALIZE LOGIN" : "CREATE CLEARANCE"
              )}
            </motion.button>
          </form>

          {/* Mode Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-center"
          >
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              disabled={isLoading || isRedirecting}
              className="font-mono text-xs text-primary/50 hover:text-accent-a transition-colors duration-300 tracking-wider border border-primary/10 px-4 py-2 rounded-full hover:border-accent-a/30 disabled:opacity-50"
            >
              {mode === "login" ? "CREATE CLEARANCE" : "EXISTING OPERATOR? LOGIN"}
            </button>
          </motion.div>

          {/* Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <motion.div
              className="absolute inset-0 opacity-[0.03] bg-gradient-to-b from-transparent via-accent-a to-transparent"
              animate={{ y: ["0%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </GlassPanel>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-4 text-center"
        >
          <span className="font-mono text-[10px] text-primary/30 tracking-widest">
            ENCRYPTED // TLS 1.3 // SECURE TRANSMISSION
          </span>
        </motion.div>
      </motion.div>

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
