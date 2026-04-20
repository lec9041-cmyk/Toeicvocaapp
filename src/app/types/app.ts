import { ResumeSession } from './quiz';
import { SettingsState } from './settings';
import { SessionHistoryItem, StatsState, Word } from './stats';

export interface AppState {
  stats: StatsState;
  settings: SettingsState;
  words: Word[];
  selectedDays: number[];
  selectedRanges: string[];
  wrongWords: Word[];
  resumeSession: ResumeSession | null;
  sessionHistory: SessionHistoryItem[];
}
