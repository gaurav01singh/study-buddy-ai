import { create } from "zustand";
import { ParsedNote } from "@/lib/pdf-parser";
import { AIResponse } from "@/lib/ai-service";

export interface Subject {
  id: string;
  name: string;
  color: string;
  notes: ParsedNote[];
  files: File[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  response?: AIResponse;
  timestamp: Date;
}

interface AppState {
  subjects: Subject[];
  activeSubjectId: string | null;
  chatHistory: Record<string, ChatMessage[]>;
  setSubjects: (subjects: Subject[]) => void;
  addSubject: (subject: Subject) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  setActiveSubject: (id: string | null) => void;
  addChatMessage: (subjectId: string, message: ChatMessage) => void;
  clearChat: (subjectId: string) => void;
}

const SUBJECT_COLORS = [
  "hsl(14, 90%, 55%)",   // primary coral
  "hsl(175, 60%, 40%)",  // secondary teal
  "hsl(50, 95%, 55%)",   // accent yellow
];

export const useAppStore = create<AppState>((set) => ({
  subjects: [],
  activeSubjectId: null,
  chatHistory: {},

  setSubjects: (subjects) => set({ subjects }),

  addSubject: (subject) =>
    set((state) => ({
      subjects: [...state.subjects, {
        ...subject,
        color: SUBJECT_COLORS[state.subjects.length % 3],
      }],
    })),

  updateSubject: (id, updates) =>
    set((state) => ({
      subjects: state.subjects.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),

  setActiveSubject: (id) => set({ activeSubjectId: id }),

  addChatMessage: (subjectId, message) =>
    set((state) => ({
      chatHistory: {
        ...state.chatHistory,
        [subjectId]: [...(state.chatHistory[subjectId] || []), message],
      },
    })),

  clearChat: (subjectId) =>
    set((state) => ({
      chatHistory: {
        ...state.chatHistory,
        [subjectId]: [],
      },
    })),
}));
