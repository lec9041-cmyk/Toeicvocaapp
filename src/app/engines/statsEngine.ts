import { getTodayLocalDateKey, calculateLocalDateStreak } from '../utils/date';
import { StatsState } from '../types/stats';

export const applyAnswerProgress = (stats: StatsState): StatsState => {
  const today = getTodayLocalDateKey();
  const dailySolvedMap = {
    ...stats.dailySolvedMap,
    [today]: (stats.dailySolvedMap[today] || 0) + 1,
  };

  return {
    ...stats,
    todaySolvedCount: dailySolvedMap[today] || 0,
    totalSolvedCount: stats.totalSolvedCount + 1,
    dailySolvedMap,
    lastStudyDate: today,
    streakDays: calculateLocalDateStreak(dailySolvedMap),
  };
};

export const finalizeCompletedSession = (
  stats: StatsState,
  payload: { xp: number }
): StatsState => {
  const xp = stats.xp + payload.xp;
  const nextThreshold = stats.level * 100;
  const level = xp >= nextThreshold ? stats.level + 1 : stats.level;
  return { ...stats, xp, level };
};
