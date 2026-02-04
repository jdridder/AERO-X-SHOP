"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { useAuth } from "@/lib/hooks/useAuth";
import { getMyOrders, Order, requestReturn } from "@/lib/services/api";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  LayoutDashboard,
  Loader2,
  LogOut,
  Package,
  RotateCcw,
  Settings,
  ShoppingBag
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Toast {
  type: "success" | "error";
  message: string;
}

// Stagger animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const rowVariants = {
  hidden: {
    opacity: 0,
    x: -30,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -30 },
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

export function DashboardView() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [returnLoading, setReturnLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const router = useRouter();

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
      fetchOrders();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchOrders = async () => {
    try {
      const data = await getMyOrders();
      setOrders(data.orders);
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = async (orderId: string) => {
    setReturnLoading(orderId);
    try {
      await requestReturn(orderId);
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: "return_initiated" } : order
        )
      );
      showToast("success", "RETURN PROTOCOL INITIATED");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Return request failed");
    } finally {
      setReturnLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toISOString().split("T")[0];
  };

  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };

  const truncateId = (id: string) => {
    return id.slice(0, 8).toUpperCase();
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
          <span className="font-mono text-xs text-primary/50 tracking-widest">LOADING MANIFEST...</span>
        </motion.div>
      </div>
    );
  }

  const pathname = usePathname();

  return (
    <div className="min-h-screen p-4 md:p-8 pb-32 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(77, 77, 255, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(77, 77, 255, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px"
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 flex gap-6">
        {/* Sidebar Navigation */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="hidden md:block w-48 flex-shrink-0"
        >
          <GlassPanel className="p-3 rounded-2xl backdrop-blur-xl border-accent-a/20 bg-[var(--glass-bg)]/90 sticky top-8">
            <nav className="space-y-1">
              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                  pathname === "/dashboard"
                    ? "bg-accent-a/10 border border-accent-a/30"
                    : "hover:bg-white/5"
                )}
              >
                <LayoutDashboard className={cn(
                  "w-4 h-4 transition-colors",
                  pathname === "/dashboard" ? "text-accent-a" : "text-primary/40 group-hover:text-accent-a"
                )} />
                <span className={cn(
                  "font-headline text-xs tracking-widest transition-colors",
                  pathname === "/dashboard" ? "text-accent-a font-bold" : "text-primary/60 group-hover:text-primary"
                )}>
                  DASHBOARD
                </span>
              </Link>

              <Link
                href="/settings"
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                  pathname === "/settings"
                    ? "bg-accent-b/10 border border-accent-b/30"
                    : "hover:bg-white/5"
                )}
              >
                <Settings className={cn(
                  "w-4 h-4 transition-colors",
                  pathname === "/settings" ? "text-accent-b" : "text-primary/40 group-hover:text-accent-b"
                )} />
                <span className={cn(
                  "font-headline text-xs tracking-widest transition-colors",
                  pathname === "/settings" ? "text-accent-b font-bold" : "text-primary/60 group-hover:text-primary"
                )}>
                  SETTINGS
                </span>
              </Link>
            </nav>

            {/* Sidebar Footer */}
            <div className="mt-6 pt-4 border-t border-primary/10">
              <div className="px-2">
                <div className="font-mono text-[9px] text-primary/30 tracking-wider">PILOT ID</div>
                <div className="font-mono text-[10px] text-accent-b mt-0.5">{user?.shortId}</div>
              </div>
            </div>
          </GlassPanel>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
        {/* Header */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <GlassPanel className="p-6 rounded-2xl backdrop-blur-xl border-accent-a/20 bg-[var(--glass-bg)]/90">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Active Status Indicator */}
                <div className="relative">
                  <motion.div
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-a/20 to-accent-b/20 border border-accent-b/40 flex items-center justify-center"
                    animate={{
                      boxShadow: [
                        "0 0 10px rgba(204, 255, 0, 0.2)",
                        "0 0 25px rgba(204, 255, 0, 0.4)",
                        "0 0 10px rgba(204, 255, 0, 0.2)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Activity className="w-5 h-5 text-accent-b" />
                  </motion.div>
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent-b"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>

                <div>
                  <h1 className="font-headline text-2xl md:text-3xl font-bold tracking-widest text-primary mb-1">
                    COMMAND CENTER
                  </h1>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-primary/40 tracking-wider">OPERATOR:</span>
                    <span className="font-mono text-xs text-accent-b tracking-wider">{user?.shortId || "USR-0000"}</span>
                    <span className="font-mono text-[10px] text-primary/30">|</span>
                    <span className="font-mono text-xs text-accent-a truncate max-w-[200px]">{user?.email}</span>
                  </div>
                </div>
              </div>

              <motion.button
                onClick={logout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-primary/10 rounded-full font-mono text-xs text-primary/60 hover:text-red-400 hover:border-red-400/30 transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                LOG OUT
              </motion.button>
            </div>
          </GlassPanel>
        </motion.div>

        {/* Purchase Manifest Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 100 }}
        >
          <GlassPanel className="rounded-2xl backdrop-blur-xl border-accent-a/20 bg-[var(--glass-bg)]/90 overflow-hidden">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="p-6 border-b border-primary/10"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Package className="w-5 h-5 text-accent-b" />
                </motion.div>
                <h2 className="font-headline text-lg font-bold tracking-widest text-primary">
                  PURCHASE MANIFEST
                </h2>
                <span className="font-mono text-xs text-primary/40 tracking-wider">
                  // {orders.length} RECORD{orders.length !== 1 ? "S" : ""}
                </span>
              </div>
            </motion.div>

            {/* Table Container with Horizontal Scroll */}
            <div className="overflow-x-auto">
              {orders.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="p-12 text-center"
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ShoppingBag className="w-12 h-12 text-primary/20 mx-auto mb-4" />
                  </motion.div>
                  <p className="font-mono text-sm text-primary/40 tracking-wider">
                    NO ORDERS DETECTED IN SYSTEM
                  </p>
                  <p className="font-mono text-xs text-primary/30 mt-2">
                    Visit the shop to deploy your first assets
                  </p>
                </motion.div>
              ) : (
                <table className="w-full min-w-[800px]">
                  <thead>
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="border-b border-primary/10"
                    >
                      <th className="px-6 py-4 text-left font-headline text-[10px] tracking-widest text-primary/40 uppercase">
                        Preview
                      </th>
                      <th className="px-6 py-4 text-left font-headline text-[10px] tracking-widest text-primary/40 uppercase">
                        Product ID
                      </th>
                      <th className="px-6 py-4 text-left font-headline text-[10px] tracking-widest text-primary/40 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left font-headline text-[10px] tracking-widest text-primary/40 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left font-headline text-[10px] tracking-widest text-primary/40 uppercase">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-right font-headline text-[10px] tracking-widest text-primary/40 uppercase">
                        Price
                      </th>
                      <th className="px-6 py-4 text-center font-headline text-[10px] tracking-widest text-primary/40 uppercase">
                        Action
                      </th>
                    </motion.tr>
                  </thead>
                  <motion.tbody
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative"
                  >
                    {/* Scanline Overlay */}
                    <tr className="absolute inset-0 pointer-events-none">
                      <td colSpan={7}>
                        <div className="absolute inset-0 overflow-hidden">
                          <motion.div
                            className="absolute inset-0 opacity-[0.02] bg-gradient-to-b from-transparent via-accent-a to-transparent"
                            animate={{ y: ["0%", "100%"] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          />
                        </div>
                      </td>
                    </tr>

                    {orders.map((order) => (
                      <motion.tr
                        key={order.id}
                        variants={rowVariants}
                        className="border-b border-primary/5 hover:bg-white/[0.02] transition-colors duration-200"
                        whileHover={{
                          backgroundColor: "rgba(255, 255, 255, 0.03)",
                          transition: { duration: 0.2 },
                        }}
                      >
                        {/* Preview Thumbnail */}
                        <td className="px-6 py-4">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="w-12 h-12 bg-white/5 rounded-lg border border-primary/10 flex items-center justify-center overflow-hidden"
                          >
                            {order.items[0]?.image_url ? (
                              <img
                                src={order.items[0].image_url}
                                alt={order.items[0].name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-primary/30" />
                            )}
                          </motion.div>
                        </td>

                        {/* Product ID */}
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-accent-a tracking-wider">
                            {order.items[0]?.id ? truncateId(order.items[0].id) : "N/A"}
                          </span>
                        </td>

                        {/* Name */}
                        <td className="px-6 py-4">
                          <div>
                            <span className="font-headline text-sm text-primary tracking-wide">
                              {order.items[0]?.name || "Unknown Item"}
                            </span>
                            {order.items.length > 1 && (
                              <span className="font-mono text-[10px] text-primary/40 ml-2">
                                +{order.items.length - 1} more
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-primary/60 tracking-wider">
                            {formatDate(order.created_at)}
                          </span>
                        </td>

                        {/* Order ID */}
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-primary/40 tracking-wider">
                            {truncateId(order.id)}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4 text-right">
                          <span className="font-mono text-sm text-accent-b font-bold tracking-wider">
                            {formatPrice(order.total_price)}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4 text-center">
                          {order.status === "return_initiated" ? (
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-400/10 border border-orange-400/30 shadow-[0_0_10px_rgba(251,146,60,0.3)]"
                            >
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              >
                                <Clock className="w-3 h-3 text-orange-400" />
                              </motion.div>
                              <span className="font-mono text-[10px] text-orange-400 tracking-wider">
                                RETURN PENDING
                              </span>
                            </motion.div>
                          ) : (
                            <motion.button
                              onClick={() => handleReturn(order.id)}
                              disabled={returnLoading === order.id}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-primary/20 hover:border-accent-a/40 hover:bg-accent-a/5 transition-all duration-300 disabled:opacity-50"
                            >
                              {returnLoading === order.id ? (
                                <Loader2 className="w-3 h-3 text-accent-a animate-spin" />
                              ) : (
                                <RotateCcw className="w-3 h-3 text-primary/60" />
                              )}
                              <span className="font-mono text-[10px] text-primary/60 tracking-wider">
                                {returnLoading === order.id ? "PROCESSING..." : "INITIATE RETURN"}
                              </span>
                            </motion.button>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              )}
            </div>
          </GlassPanel>
        </motion.div>

        {/* Stats Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex flex-wrap gap-6 justify-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="font-mono text-[10px] text-primary/30 tracking-widest px-4 py-2 bg-white/[0.02] rounded-full border border-primary/5"
          >
            TOTAL ORDERS: <span className="text-accent-a font-bold">{orders.length}</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="font-mono text-[10px] text-primary/30 tracking-widest px-4 py-2 bg-white/[0.02] rounded-full border border-primary/5"
          >
            RETURNS: <span className="text-orange-400 font-bold">{orders.filter(o => o.status === "return_initiated").length}</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="font-mono text-[10px] text-primary/30 tracking-widest px-4 py-2 bg-white/[0.02] rounded-full border border-primary/5"
          >
            LIFETIME VALUE: <span className="text-accent-b font-bold">{formatPrice(orders.reduce((sum, o) => sum + o.total_price, 0))}</span>
          </motion.div>
        </motion.div>
        </div>
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
