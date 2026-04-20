import { StatsSummaryCards } from '../components/stats/StatsSummaryCards';
import { useAppStore } from '../store/useAppStore';
import { getDateKeyDaysAgo } from '../utils/date';

export function StatsPage() {
  const { state } = useAppStore();
  const recent7 = Array.from({ length: 7 }, (_, idx) => {
    const key = getDateKeyDaysAgo(6 - idx);
    return { key, count: state.stats.dailySolvedMap[key] || 0 };
  });
  const max = Math.max(...recent7.map((item) => item.count), 1);

  return (
    <div className="space-y-4">
      <StatsSummaryCards
        totalSolved={state.stats.totalSolvedCount}
        streakDays={state.stats.streakDays}
        xp={state.stats.xp}
        level={state.stats.level}
      />

      <div className="rounded-3xl p-5 bg-white border border-gray-200 shadow-sm">
        <div className="text-sm font-semibold text-gray-700 mb-4">최근 7일 학습</div>
        <div className="h-32 flex items-end gap-2">
          {recent7.map((item) => (
            <div key={item.key} className="flex-1 bg-gray-100 rounded-t-lg relative h-full">
              <div
                className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg"
                style={{ height: `${(item.count / max) * 100}%` }}
                title={`${item.key}: ${item.count}개`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
