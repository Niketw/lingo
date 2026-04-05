import { create } from 'zustand'

interface LessonStore {
  lessonData: any | null;
  currentIdx: number;
  correctCount: number;
  showFeedback: boolean;
  feedbackData: any | null;
  setLessonData: (data: any) => void;
  nextQuestion: () => void;
  setFeedback: (data: any) => void;
  clearFeedback: () => void;
  incrementCorrect: () => void;
  reset: () => void;
}

export const useLessonStore = create<LessonStore>()((set) => ({
  lessonData: null,
  currentIdx: 0,
  correctCount: 0,
  showFeedback: false,
  feedbackData: null,
  setLessonData: (data) => set({ lessonData: data }),
  nextQuestion: () => set((state) => ({ currentIdx: state.currentIdx + 1 })),
  setFeedback: (data) => set({ feedbackData: data, showFeedback: true }),
  clearFeedback: () => set({ showFeedback: false, feedbackData: null }),
  incrementCorrect: () => set((state) => ({ correctCount: state.correctCount + 1 })),
  reset: () => set({ lessonData: null, currentIdx: 0, correctCount: 0, showFeedback: false, feedbackData: null }),
}))
