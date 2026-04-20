import { Button } from '../components/ui/button';
import { TodayProgressCard } from '../components/home/TodayProgressCard';
import { useAppStore } from '../store/useAppStore';

interface HomePageProps {
  onStartLearning: () => void;
}

export function HomePage({ onStartLearning }: HomePageProps) {
  const { state } = useAppStore();
  const hasResume = !!state.resumeSession;

  return (
    <div className="space-y-4">
      <TodayProgressCard solved={state.stats.todaySolvedCount} goal={state.settings.todayGoal} />

      <Button onClick={onStartLearning} className="w-full py-6 text-lg rounded-2xl">
        학습 시작
      </Button>

      {hasResume && (
        <div className="rounded-2xl p-4 bg-amber-50 border border-amber-200 text-sm text-amber-900">
          이어하기 가능한 학습 세션이 있습니다. Learn 탭에서 이어서 진행하세요.
        </div>
      )}
    </div>
  );
}
