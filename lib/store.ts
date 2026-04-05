import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserStore {
  userId: string | null;
  username: string | null;
  sourceLang: string;
  targetLang: string;
  selectedTopic: string;
  setAuth: (id: string | null, name: string | null) => void;
  setLanguages: (source: string, target: string) => void;
  setTopic: (topic: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      userId: null,
      username: null,
      sourceLang: "English",
      targetLang: "Spanish",
      selectedTopic: "Alphabet and Letters",
      setAuth: (id, name) => set({ userId: id, username: name }),
      setLanguages: (s, t) => set({ sourceLang: s, targetLang: t }),
      setTopic: (t) => set({ selectedTopic: t }),
      logout: () => set({ userId: null, username: null }),
    }),
    { name: 'user-storage' }
  )
)
