import { StatsSummaryCards } from '../components/stats/StatsSummaryCards';
import { useAppStore } from '../store/useAppStore';

const ymd = (date: Date) => date.toISOString().split('T')[0];

export function StatsPage() {
  const { state } = useAppStore();
  const goal = Math.max(1, state.settings.todayGoal);
  const todayProgress = Math.min((state.stats.todaySolvedCount / goal) * 100, 100);
  const recent7 = Array.from({ length: 7 }, (_, idx) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - idx));
    const key = ymd(date);
    return { key, count: state.stats.dailySolvedMap[key] || 0 };
  });
  const max = Math.max(...recent7.map((item) => item.count), 1);
  const recentSessions = state.sessionHistory.slice(0, 8);

  const monthDays = Array.from({ length: 28 }, (_, idx) => {
    const date = new Date();
    date.setDate(date.getDate() - (27 - idx));
    const key = ymd(date);
    return { key, count: state.stats.dailySolvedMap[key] || 0 };
  });

  const wrongWordsSet = new Set(state.wrongWords.map((word) => word.english));
  const recentWrongCount = recentSessions.reduce((sum, session) => sum + session.wrongCount, 0);

  const rangeSummary = recentSessions.reduce<Record<string, { total: number; solved: number }>>((acc, session) => {
    session.ranges.forEach((range) => {
      const prev = acc[range] || { total: 0, solved: 0 };
      acc[range] = {
        total: prev.total + session.total,
        solved: prev.solved + session.score,
      };
    });
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <StatsSummaryCards
        totalSolved={state.stats.totalSolvedCount}
        streakDays={state.stats.streakDays}
        xp={state.stats.xp}
        level={state.stats.level}
      />

      <div className="rounded-3xl p-5 bg-white border border-gray-200 shadow-sm">
        <div className="text-sm font-semibold text-gray-700">오늘 학습 / 목표</div>
        <div className="mt-2 text-3xl font-bold">
          {state.stats.todaySolvedCount} / {goal}
        </div>
        <div className="text-xs text-gray-500 mt-1">진행률 {todayProgress.toFixed(0)}%</div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-3">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${todayProgress}%` }} />
        </div>
      </div>

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

      <div className="rounded-3xl p-5 bg-white border border-gray-200 shadow-sm">
        <div className="text-sm font-semibold text-gray-700 mb-3">최근 4주 학습 기록</div>
        <div className="grid grid-cols-7 gap-2">
          {monthDays.map((item) => (
            <div
              key={item.key}
              title={`${item.key} · ${item.count}개`}
              className={`h-8 rounded-md border ${
                item.count === 0
                  ? 'bg-gray-50 border-gray-200'
                  : item.count < 10
                    ? 'bg-blue-100 border-blue-200'
                    : item.count < 20
                      ? 'bg-blue-300 border-blue-400'
                      : 'bg-blue-500 border-blue-600'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="rounded-3xl p-5 bg-white border border-gray-200 shadow-sm">
        <div className="text-sm font-semibold text-gray-700 mb-3">최근 세션</div>
        <div className="space-y-2">
          {recentSessions.length === 0 ? (
            <div className="text-sm text-gray-500">아직 학습 기록이 없습니다.</div>
          ) : (
            recentSessions.map((session) => (
              <div key={session.ts} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">
                    {new Date(session.ts).toLocaleDateString()} · {session.mode.toUpperCase()} · {session.direction}
                  </div>
                  <div>
                    {session.score}/{session.total}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  오답 {session.wrongCount}개 · DAY {session.days.join(', ')} · {session.ranges.join(', ')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-3xl p-5 bg-white border border-gray-200 shadow-sm">
        <div className="text-sm font-semibold text-gray-700 mb-3">오답 요약</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3">
            <div className="text-xs text-gray-600">누적 오답 단어</div>
            <div className="text-2xl font-bold">{wrongWordsSet.size}</div>
          </div>
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
            <div className="text-xs text-gray-600">최근 세션 오답 합계</div>
            <div className="text-2xl font-bold">{recentWrongCount}</div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl p-5 bg-white border border-gray-200 shadow-sm">
        <div className="text-sm font-semibold text-gray-700 mb-3">범위별 정답 요약</div>
        <div className="space-y-2">
          {Object.keys(rangeSummary).length === 0 ? (
            <div className="text-sm text-gray-500">범위 요약을 만들 학습 기록이 없습니다.</div>
          ) : (
            Object.entries(rangeSummary).map(([range, summary]) => {
              const pct = summary.total > 0 ? (summary.solved / summary.total) * 100 : 0;
              return (
                <div key={range}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="font-medium">{range}</div>
                    <div>{summary.solved}/{summary.total} ({pct.toFixed(0)}%)</div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
