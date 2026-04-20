import { useAppStore } from '../store/useAppStore';

export function SettingsPage() {
  const { state, updateSettings } = useAppStore();

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white border border-gray-200 shadow-sm">
        <div className="text-sm font-semibold text-gray-700 mb-3">오늘 목표 문제 수</div>
        <input
          type="number"
          min={1}
          value={state.settings.todayGoal}
          onChange={(e) => updateSettings({ todayGoal: Math.max(1, parseInt(e.target.value || '1', 10)) })}
          className="w-full rounded-xl border border-gray-200 px-3 py-3"
        />
      </div>
    </div>
  );
}
