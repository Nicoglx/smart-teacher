export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type AppMode = 'practice' | 'conversation';

export interface LevelInfo {
  level: CEFRLevel;
  name: string;
  description: string;
  color: string;
  bgColor: string;
}

export interface Correction {
  original: string;
  corrected: string;
  explanation: string;
}

export interface FeedbackResponse {
  transcription: string;
  overallScore: number;
  pronunciation: {
    score: number;
    feedback: string;
  };
  grammar: {
    score: number;
    corrections: Correction[];
  };
  vocabulary: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  fluency: {
    score: number;
    feedback: string;
  };
  encouragement: string;
  practiceTopics: string[];
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  timestamp: Date;
}

export interface ConversationResponse {
  transcription: string;
  response: string;
  audioBase64: string;
}

export interface AudioRecorderState {
  isRecording: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
}

export const LEVELS: LevelInfo[] = [
  {
    level: 'A1',
    name: 'Principiante',
    description: 'Frases básicas y vocabulario simple',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20 border-emerald-500/30',
  },
  {
    level: 'A2',
    name: 'Elemental',
    description: 'Comunicación en situaciones cotidianas',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/20 border-teal-500/30',
  },
  {
    level: 'B1',
    name: 'Intermedio',
    description: 'Expresar opiniones y experiencias',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/20 border-sky-500/30',
  },
  {
    level: 'B2',
    name: 'Intermedio Alto',
    description: 'Conversaciones complejas con fluidez',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/20 border-violet-500/30',
  },
  {
    level: 'C1',
    name: 'Avanzado',
    description: 'Expresión espontánea y flexible',
    color: 'text-fuchsia-400',
    bgColor: 'bg-fuchsia-500/20 border-fuchsia-500/30',
  },
  {
    level: 'C2',
    name: 'Maestría',
    description: 'Precisión y fluidez nativa',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/20 border-rose-500/30',
  },
];
