interface TodayProgressCardProps {
  solved: number;
  goal: number;
}

export function TodayProgressCard({ solved, goal }: TodayProgressCardProps) {
  const pct = Math.min((solved / Math.max(goal, 1)) * 100, 100);
  return (
    <div className="rounded-3xl p-6 bg-white border border-gray-200 shadow-sm">
      <div className="text-sm text-gray-500 mb-2">오늘 학습</div>
      <div className="text-4xl font-bold">{solved} / {goal}</div>
      <div className="text-sm text-gray-500 mt-1 mb-4">목표 단어 달성</div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
