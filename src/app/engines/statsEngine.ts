import { StatsState } from '../types/stats';

const todayKey = () => new Date().toISOString().split('T')[0];

const calcStreak = (dailySolvedMap: Record<string, number>) => {
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

export const applyAnswerProgress = (stats: StatsState): StatsState => {
  const today = todayKey();
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
    streakDays: calcStreak(dailySolvedMap),
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
