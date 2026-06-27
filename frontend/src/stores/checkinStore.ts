import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MoodState = 'at_limit' | 'managing' | 'mixed' | 'okay' | 'good'

export const MOOD_LABELS: Record<MoodState, string> = {
  at_limit: "E don do me",
  managing: "I dey manage",
  mixed: "E dey somehow",
  okay: "I'm okay sha",
  good: "I dey shine",
}

export const MOOD_COLORS: Record<MoodState, string> = {
  at_limit: '#C0392B',
  managing: '#E8834A',
  mixed: '#F5C842',
  okay: '#8B5E3C',
  good: '#2E8B57',
}

interface CheckinState {
  currentMood: MoodState | null
  ventText: string
  streak: number
  lastCheckinDate: string | null
  checkinHistory: Array<{
    date: string
    mood: MoodState
  }>

  setMood: (mood: MoodState) => void
  setVentText: (text: string) => void
  completeCheckin: (mood: MoodState) => void
  resetCheckin: () => void
}

export const useCheckinStore = create<CheckinState>()(
  persist(
    (set, get) => ({
      currentMood: null,
      ventText: '',
      streak: 0,
      lastCheckinDate: null,
      checkinHistory: [],

      setMood: (mood) => set({ currentMood: mood }),

      setVentText: (text) => set({ ventText: text }),

      completeCheckin: (mood) => {
        const today = new Date().toISOString().split('T')[0]
        const { lastCheckinDate, streak, checkinHistory } = get()

        let newStreak = 1
        if (lastCheckinDate) {
          const lastDate = new Date(lastCheckinDate)
          const todayDate = new Date(today)
          const diffDays = Math.floor(
            (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
          )
          if (diffDays === 1) {
            newStreak = streak + 1
          } else if (diffDays === 0) {
            newStreak = streak // Same day, don't change streak
          }
        }

        set({
          currentMood: mood,
          lastCheckinDate: today,
          streak: newStreak,
          checkinHistory: [
            ...checkinHistory,
            { date: today, mood },
          ],
        })
      },

      resetCheckin: () =>
        set({
          currentMood: null,
          ventText: '',
        }),
    }),
    {
      name: 'soro-checkin',
      partialize: (state) => ({
        streak: state.streak,
        lastCheckinDate: state.lastCheckinDate,
        checkinHistory: state.checkinHistory,
      }),
    },
  ),
)
