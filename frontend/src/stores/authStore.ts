import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AuthMode = 'anonymous' | 'email'

export interface User {
  id: string
  email?: string
  is_anonymous: boolean
  created_at: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  authMode: AuthMode | null
  onboardingComplete: boolean

  setUser: (user: User, token: string, mode: AuthMode) => void
  setOnboardingComplete: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      authMode: null,
      onboardingComplete: false,

      setUser: (user, token, mode) =>
        set({
          user,
          token,
          isAuthenticated: true,
          authMode: mode,
        }),

      setOnboardingComplete: () => set({ onboardingComplete: true }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          authMode: null,
          onboardingComplete: false,
        }),
    }),
    {
      name: 'soro-auth',
    },
  ),
)
