interface StatsSummaryCardsProps {
  totalSolved: number;
  streakDays: number;
  xp: number;
  level: number;
}

export function StatsSummaryCards({ totalSolved, streakDays, xp, level }: StatsSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl p-4 bg-blue-50 border border-blue-200">
        <div className="text-xs text-gray-600">총 학습</div>
        <div className="text-2xl font-bold">{totalSolved}</div>
      </div>
      <div className="rounded-2xl p-4 bg-orange-50 border border-orange-200">
        <div className="text-xs text-gray-600">연속 학습</div>
        <div className="text-2xl font-bold">{streakDays}일</div>
      </div>
      <div className="rounded-2xl p-4 bg-purple-50 border border-purple-200">
        <div className="text-xs text-gray-600">XP</div>
        <div className="text-2xl font-bold">{xp}</div>
      </div>
      <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-200">
        <div className="text-xs text-gray-600">Level</div>
        <div className="text-2xl font-bold">Lv.{level}</div>
      </div>
    </div>
  );
}
