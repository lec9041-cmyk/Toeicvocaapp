import { Play } from 'lucide-react';
import { Button } from '../ui/button';

interface LearnControlPanelProps {
  canStart: boolean;
  availableCount: number;
  onStart: () => void;
}

export function LearnControlPanel({ canStart, availableCount, onStart }: LearnControlPanelProps) {
  return (
    <div className="rounded-3xl p-6 bg-white border border-gray-200 shadow-sm space-y-4">
      <div>
        <div className="text-sm text-gray-500">학습 가능 단어</div>
        <div className="text-3xl font-bold">{availableCount}개</div>
      </div>
      <Button onClick={onStart} disabled={!canStart} className="w-full py-6 text-lg rounded-2xl">
        <Play className="size-5 mr-2" />
        학습 시작
      </Button>
    </div>
  );
}
