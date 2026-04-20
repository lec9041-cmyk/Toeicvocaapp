import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { applyAnswerProgress, finalizeCompletedSession } from '../engines/statsEngine';
import { finalizeSession } from '../engines/sessionEngine';
import { buildResumeSnapshot } from '../engines/quizEngine';
import { migrateStatsToV3, defaultStatsState } from '../services/migration';
import { storage } from '../services/storage';
import { AppState } from '../types/app';
import { ResumeSession, QuizSessionMeta } from '../types/quiz';
import { DEFAULT_SETTINGS, SettingsState } from '../types/settings';
import { SessionSummary, Word } from '../types/stats';

interface AppStoreContextValue {
  state: AppState;
  setWords: (words: Word[]) => void;
  setSelectedDays: (days: number[]) => void;
  setSelectedRanges: (ranges: string[]) => void;
  updateSettings: (partial: Partial<SettingsState>) => void;
  recordAnswer: () => void;
  saveResumeSession: (meta: QuizSessionMeta, remainingWords: Word[]) => void;
  clearResumeSession: () => void;
  finalizeQuizSession: (summary: SessionSummary, meta: QuizSessionMeta) => void;
}

const AppStoreContext = createContext<AppStoreContextValue | null>(null);

const defaultState: AppState = {
  stats: defaultStatsState,
  settings: DEFAULT_SETTINGS,
  words: [],
  selectedDays: [1],
  selectedRanges: ['core', 'basic', '800', '900'],
  wrongWords: [],
  resumeSession: null,
  sessionHistory: [],
};

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      stats: migrateStatsToV3(),
      settings: storage.get(STORAGE_KEYS.SETTINGS_V1, DEFAULT_SETTINGS),
      wrongWords: storage.get(STORAGE_KEYS.WRONG_WORDS_V1, [] as Word[]),
      resumeSession: storage.get<ResumeSession | null>(STORAGE_KEYS.RESUME_SESSION_V1, null),
      sessionHistory: storage.get(STORAGE_KEYS.SESSION_HISTORY_V1, []),
    }));
  }, []);

  const persist = (next: AppState) => {
    storage.set(STORAGE_KEYS.STATS_V3, next.stats);
    storage.set(STORAGE_KEYS.SETTINGS_V1, next.settings);
    storage.set(STORAGE_KEYS.WRONG_WORDS_V1, next.wrongWords);
    storage.set(STORAGE_KEYS.SESSION_HISTORY_V1, next.sessionHistory);
    if (next.resumeSession) storage.set(STORAGE_KEYS.RESUME_SESSION_V1, next.resumeSession);
    else storage.remove(STORAGE_KEYS.RESUME_SESSION_V1);
  };

  const value = useMemo<AppStoreContextValue>(() => ({
    state,
    setWords: (words) => setState((prev) => ({ ...prev, words })),
    setSelectedDays: (days) => setState((prev) => ({ ...prev, selectedDays: days })),
    setSelectedRanges: (ranges) => setState((prev) => ({ ...prev, selectedRanges: ranges })),
    updateSettings: (partial) =>
      setState((prev) => {
        const next = { ...prev, settings: { ...prev.settings, ...partial } };
        persist(next);
        return next;
      }),
    recordAnswer: () =>
      setState((prev) => {
        const next = { ...prev, stats: applyAnswerProgress(prev.stats) };
        persist(next);
        return next;
      }),
    saveResumeSession: (meta, remainingWords) =>
      setState((prev) => {
        const resumeSession = remainingWords.length ? buildResumeSnapshot(meta, remainingWords) : null;
        const next = { ...prev, resumeSession };
        persist(next);
        return next;
      }),
    clearResumeSession: () =>
      setState((prev) => {
        const next = { ...prev, resumeSession: null };
        persist(next);
        return next;
      }),
    finalizeQuizSession: (summary, meta) =>
      setState((prev) => {
        const stats = finalizeCompletedSession(prev.stats, { xp: summary.xp });
        const wrongWords = summary.wrongWords.length
          ? [...prev.wrongWords, ...summary.wrongWords].filter(
              (word, index, self) => index === self.findIndex((w) => w.english === word.english)
            )
          : prev.wrongWords;
        const sessionItem = finalizeSession({
          mode: meta.mode,
          direction: meta.direction,
          total: summary.total,
          score: summary.correct,
          days: meta.days,
          ranges: meta.ranges,
        });
        const next: AppState = {
          ...prev,
          stats,
          wrongWords,
          resumeSession: null,
          sessionHistory: [sessionItem, ...prev.sessionHistory].slice(0, 200),
        };
        persist(next);
        return next;
      }),
  }), [state]);

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export const useAppStore = () => {
  const context = useContext(AppStoreContext);
  if (!context) throw new Error('useAppStore must be used within AppStoreProvider');
  return context;
};
