import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserData {
  userId: number;
  email: string;
  shortId: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserData | null;

  setAuthenticated: (user: UserData) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  clearAuth: () => void;
}

const generateShortId = (userId: number): string => {
  const hash = userId.toString(16).toUpperCase().padStart(4, "0");
  return `USR-${hash.slice(-4)}`;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isLoading: true,
      user: null,

      setAuthenticated: (user: UserData) =>
        set({
          isAuthenticated: true,
          isLoading: false,
          user: {
            ...user,
            shortId: generateShortId(user.userId),
          },
        }),

      setLoading: (loading: boolean) =>
        set({ isLoading: loading }),

      logout: () =>
        set({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        }),

      clearAuth: () =>
        set({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        }),
    }),
    {
      name: "aero-x-auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
