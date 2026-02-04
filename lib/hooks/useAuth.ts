"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, UserData } from "@/lib/store/authStore";

export function useAuth() {
  const router = useRouter();
  const {
    isAuthenticated,
    isLoading,
    user,
    setAuthenticated,
    setLoading,
    logout: storeLogout,
    clearAuth,
  } = useAuthStore();

  // Check auth status on mount by parsing JWT from cookie
  useEffect(() => {
    const checkAuthFromCookie = () => {
      try {
        const cookies = document.cookie.split(";");
        const authCookie = cookies.find((c) => c.trim().startsWith("auth_token="));

        if (authCookie) {
          const token = authCookie.split("=")[1];
          const payload = JSON.parse(atob(token.split(".")[1]));

          const userData: UserData = {
            userId: payload.userId,
            email: payload.email,
            shortId: `USR-${payload.userId.toString(16).toUpperCase().padStart(4, "0").slice(-4)}`,
          };

          setAuthenticated(userData);
        } else {
          clearAuth();
        }
      } catch {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    // Only check on mount if still loading
    if (isLoading) {
      checkAuthFromCookie();
    }
  }, [isLoading, setAuthenticated, setLoading, clearAuth]);

  // Login success handler - updates global state
  const loginSuccess = useCallback(
    (userData: { userId: number; email: string }) => {
      const user: UserData = {
        userId: userData.userId,
        email: userData.email,
        shortId: `USR-${userData.userId.toString(16).toUpperCase().padStart(4, "0").slice(-4)}`,
      };
      setAuthenticated(user);
    },
    [setAuthenticated]
  );

  // Logout handler - clears cookie and state
  const logout = useCallback(() => {
    // Clear the auth cookie
    document.cookie = "auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    storeLogout();
    router.push("/login");
  }, [storeLogout, router]);

  // Refresh auth state by re-checking cookie
  const refreshAuth = useCallback(() => {
    setLoading(true);
    const cookies = document.cookie.split(";");
    const authCookie = cookies.find((c) => c.trim().startsWith("auth_token="));

    if (authCookie) {
      try {
        const token = authCookie.split("=")[1];
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userData: UserData = {
          userId: payload.userId,
          email: payload.email,
          shortId: `USR-${payload.userId.toString(16).toUpperCase().padStart(4, "0").slice(-4)}`,
        };
        setAuthenticated(userData);
      } catch {
        clearAuth();
      }
    } else {
      clearAuth();
    }
  }, [setAuthenticated, setLoading, clearAuth]);

  // Memoized auth path to prevent unnecessary re-renders
  const authPath = useMemo(
    () => (isAuthenticated ? "/dashboard" : "/login"),
    [isAuthenticated]
  );

  return {
    isAuthenticated,
    isLoading,
    user,
    authPath,
    loginSuccess,
    logout,
    refreshAuth,
  };
}
