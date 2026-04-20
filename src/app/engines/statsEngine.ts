export interface Stats {
  todayCount: number;
  streak: number;
  totalSolved: number;
  xp: number;
  level: number;
  lastStudyDate: string;
  dailyLog: { [date: string]: number };
}

export const DEFAULT_STATS: Stats = {
  todayCount: 0,
  streak: 0,
  totalSolved: 0,
  xp: 0,
  level: 1,
  lastStudyDate: '',
  dailyLog: {},
};

export const getTodayKey = () => new Date().toISOString().split('T')[0];
const isDateKey = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

export const calculateStreakFromDailyLog = (dailyLog: { [date: string]: number }, fromDate?: string) => {
  const start = fromDate && isDateKey(fromDate) ? new Date(fromDate) : new Date();
  if (Number.isNaN(start.getTime())) return 0;

  let streak = 0;
  const cursor = new Date(start);
  while (true) {
    const key = cursor.toISOString().split('T')[0];
    if ((dailyLog[key] || 0) <= 0) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

export const normalizeStats = (raw: unknown): Stats => {
  if (!raw || typeof raw !== 'object') return DEFAULT_STATS;
  const candidate = raw as Partial<Stats>;

  if (
    typeof candidate.todayCount === 'number' &&
    typeof candidate.streak === 'number' &&
    typeof candidate.totalSolved === 'number' &&
    typeof candidate.xp === 'number' &&
    typeof candidate.level === 'number' &&
    candidate.dailyLog &&
    typeof candidate.dailyLog === 'object'
  ) {
    const dailyLog = candidate.dailyLog as { [date: string]: number };
    return {
      ...DEFAULT_STATS,
      ...candidate,
      todayCount: dailyLog[getTodayKey()] || candidate.todayCount || 0,
      streak: calculateStreakFromDailyLog(dailyLog),
      dailyLog,
    };
  }

  const legacyDailyRaw = localStorage.getItem('toeic_daily_v1');
  let legacyDailyLog: { [date: string]: number } = {};
  if (legacyDailyRaw) {
    try {
      const parsed = JSON.parse(legacyDailyRaw);
      if (parsed && typeof parsed === 'object') {
        legacyDailyLog = Object.fromEntries(
          Object.entries(parsed).filter(
            ([key, value]) => isDateKey(key) && typeof value === 'number'
          )
        );
      }
    } catch {
      legacyDailyLog = {};
    }
  }

  const totalSolved = Object.values(raw as Record<string, any>).reduce((sum, entry) => {
    if (!entry || typeof entry !== 'object') return sum;
    return sum + (entry.correctCount || 0) + (entry.wrongCount || 0);
  }, 0);

  const today = getTodayKey();
  const lastStudyDate = Object.keys(legacyDailyLog).sort().at(-1) || '';
  return {
    ...DEFAULT_STATS,
    totalSolved,
    todayCount: legacyDailyLog[today] || 0,
    dailyLog: legacyDailyLog,
    lastStudyDate,
    streak: calculateStreakFromDailyLog(legacyDailyLog),
  };
};

export const loadStatsFromStorage = (): Stats => {
  const savedStats = localStorage.getItem('toeic_stats_v2');
  if (!savedStats) return DEFAULT_STATS;
  try {
    return normalizeStats(JSON.parse(savedStats));
  } catch {
    return DEFAULT_STATS;
  }
};

export const saveStatsToStorage = (stats: Stats) => {
  localStorage.setItem('toeic_stats_v2', JSON.stringify(stats));
  localStorage.setItem('toeic_daily_v1', JSON.stringify(stats.dailyLog));
};

export const applyQuestionProgress = (stats: Stats, solvedCount: number = 1): Stats => {
  const solved = Math.max(0, solvedCount);
  if (!solved) return stats;

  const today = getTodayKey();
  const newDailyLog = {
    ...stats.dailyLog,
    [today]: (stats.dailyLog[today] || 0) + solved,
  };

  return {
    ...stats,
    todayCount: newDailyLog[today] || 0,
    totalSolved: stats.totalSolved + solved,
    lastStudyDate: today,
    dailyLog: newDailyLog,
    streak: calculateStreakFromDailyLog(newDailyLog),
  };
};

export const finalizeSessionStats = (
  stats: Stats,
  payload: { xp: number }
): Stats => {
  const newXP = stats.xp + payload.xp;
  const nextLevelThreshold = 100 * stats.level;
  const level = newXP >= nextLevelThreshold ? stats.level + 1 : stats.level;
  return {
    ...stats,
    xp: newXP,
    level,
  };
};
