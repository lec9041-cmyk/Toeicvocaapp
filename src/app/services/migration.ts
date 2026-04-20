import { STORAGE_KEYS } from '../constants/storageKeys';
import { storage } from './storage';
import { StatsState } from '../types/stats';

const todayKey = () => new Date().toISOString().split('T')[0];

export const defaultStatsState: StatsState = {
  todaySolvedCount: 0,
  totalSolvedCount: 0,
  streakDays: 0,
  xp: 0,
  level: 1,
  dailySolvedMap: {},
  lastStudyDate: '',
};

const calculateStreak = (dailySolvedMap: Record<string, number>) => {
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const key = cursor.toISOString().split('T')[0];
    if ((dailySolvedMap[key] || 0) <= 0) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

export const migrateStatsToV3 = (): StatsState => {
  const v3 = storage.get<StatsState | null>(STORAGE_KEYS.STATS_V3, null);
  if (v3) return v3;

  const legacy = storage.get<any>(STORAGE_KEYS.STATS_V2, null);
  const legacyDaily = storage.get<Record<string, number>>(STORAGE_KEYS.DAILY_V1, {});

  if (legacy && typeof legacy === 'object' && 'todaySolvedCount' in legacy) {
    storage.set(STORAGE_KEYS.STATS_V3, legacy as StatsState);
    return legacy as StatsState;
  }

  const today = todayKey();
  if (
    legacy &&
    typeof legacy === 'object' &&
    typeof legacy.todayCount === 'number' &&
    typeof legacy.totalSolved === 'number'
  ) {
    const migrated: StatsState = {
      todaySolvedCount: legacyDaily[today] ?? legacy.todayCount ?? 0,
      totalSolvedCount: legacy.totalSolved ?? 0,
      streakDays: calculateStreak(legacyDaily),
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
