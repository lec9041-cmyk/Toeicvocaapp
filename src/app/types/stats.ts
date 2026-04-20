export interface StatsState {
  todaySolvedCount: number;
  totalSolvedCount: number;
  streakDays: number;
  xp: number;
  level: number;
  dailySolvedMap: Record<string, number>;
  lastStudyDate: string;
}

export interface SessionSummary {
  correct: number;
  total: number;
  xp: number;
  wrongWords: Word[];
}

export interface SessionHistoryItem {
  ts: number;
  mode: QuizMode;
  direction: QuizDirection;
  total: number;
  score: number;
  wrongCount: number;
  days: number[];
  ranges: string[];
}

export interface Word {
  day: number;
  no: number;
  english: string;
  korean: string;
  index: number;
}

export type QuizMode = 'flash' | 'mc' | 'sa';
export type QuizDirection = 'en2ko' | 'ko2en';
