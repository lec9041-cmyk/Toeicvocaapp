import { STORAGE_KEYS } from '../constants/storageKeys';
import { storage } from './storage';
import { StatsState } from '../types/stats';
import { getTodayLocalDateKey, calculateLocalDateStreak } from '../utils/date';

export const defaultStatsState: StatsState = {
  todaySolvedCount: 0,
  totalSolvedCount: 0,
  streakDays: 0,
  xp: 0,
  level: 1,
  dailySolvedMap: {},
  lastStudyDate: '',
};

export const migrateStatsToV3 = (): StatsState => {
  const today = getTodayLocalDateKey();
  const v3 = storage.get<StatsState | null>(STORAGE_KEYS.STATS_V3, null);

  if (v3) {
    const normalized = {
      ...v3,
      todaySolvedCount: v3.dailySolvedMap?.[today] || 0,
      streakDays: calculateLocalDateStreak(v3.dailySolvedMap || {}),
    };
    storage.set(STORAGE_KEYS.STATS_V3, normalized);
    return normalized;
  }

  const legacy = storage.get<any>(STORAGE_KEYS.STATS_V2, null);
  const legacyDaily = storage.get<Record<string, number>>(STORAGE_KEYS.DAILY_V1, {});

  if (legacy && typeof legacy === 'object' && 'todaySolvedCount' in legacy) {
    const migratedLegacy = legacy as StatsState;
    const next = {
      ...migratedLegacy,
      todaySolvedCount: migratedLegacy.dailySolvedMap?.[today] || migratedLegacy.todaySolvedCount || 0,
      streakDays: calculateLocalDateStreak(migratedLegacy.dailySolvedMap || {}),
    };
    storage.set(STORAGE_KEYS.STATS_V3, next);
    return next;
  }

  if (
    legacy &&
    typeof legacy === 'object' &&
    typeof legacy.todayCount === 'number' &&
    typeof legacy.totalSolved === 'number'
  ) {
    const migrated: StatsState = {
      todaySolvedCount: legacyDaily[today] ?? legacy.todayCount ?? 0,
      totalSolvedCount: legacy.totalSolved ?? 0,
      streakDays: calculateLocalDateStreak(legacyDaily),
      xp: legacy.xp ?? 0,
      level: legacy.level ?? 1,
      dailySolvedMap: legacyDaily ?? {},
      lastStudyDate: legacy.lastStudyDate ?? '',
    };
    storage.set(STORAGE_KEYS.STATS_V3, migrated);
    return migrated;
  }

  const migrated = { ...defaultStatsState };
  storage.set(STORAGE_KEYS.STATS_V3, migrated);
  return migrated;
};
