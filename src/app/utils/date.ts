const pad2 = (value: number) => String(value).padStart(2, '0');

export const toLocalDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
};

export const getTodayLocalDateKey = (): string => toLocalDateKey(new Date());

export const getDateKeyDaysAgo = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return toLocalDateKey(date);
};

export const calculateLocalDateStreak = (dailySolvedMap: Record<string, number>): number => {
  let streak = 0;
  let offset = 0;

  while (true) {
    const key = getDateKeyDaysAgo(offset);
    if ((dailySolvedMap[key] || 0) <= 0) break;
    streak += 1;
    offset += 1;
  }

  return streak;
};
