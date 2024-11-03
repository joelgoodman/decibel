import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Core state management with Zustand
interface AppState {
  user: any | null
  theme: 'light' | 'dark'
  settings: Record<string, any>
  setUser: (user: any | null) => void
  setTheme: (theme: 'light' | 'dark') => void
  updateSettings: (settings: Record<string, any>) => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      theme: 'light',
      settings: {},
      setUser: (user) => set({ user }),
      setTheme: (theme) => set({ theme }),
      updateSettings: (settings) => set({ settings }),
    }),
    {
      name: 'app-storage',
    }
  )
)