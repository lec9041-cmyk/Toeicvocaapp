import { QuizDirection, QuizMode } from './stats';

export interface SettingsState {
  todayGoal: number;
  mode: QuizMode;
  direction: QuizDirection;
  count: number;
  orderMode: 'random' | 'sequential';
  shuffleChoices: boolean;
}

export const DEFAULT_SETTINGS: SettingsState = {
  todayGoal: 30,
  mode: 'flash',
  direction: 'en2ko',
  count: 30,
  orderMode: 'random',
  shuffleChoices: true,
};
