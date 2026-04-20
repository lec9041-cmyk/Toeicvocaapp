import { QuizDirection, QuizMode, Word } from './stats';

export interface QuizSessionMeta {
  mode: QuizMode;
  direction: QuizDirection;
  count: number;
  days: number[];
  ranges: string[];
}

export interface ResumeSession {
  mode: QuizMode;
  direction: QuizDirection;
  count: number;
  days: number[];
  ranges: string[];
  remainingWords: Word[];
  updatedAt: number;
}

export interface AnswerRecordInput {
  isCorrect: boolean;
}
