import { Play } from 'lucide-react';
import { Button } from '../ui/button';
import { QuizDirection, QuizMode } from '../../types/stats';

const RANGE_OPTIONS = [
  { key: 'core', label: 'CORE (1-40)' },
  { key: 'basic', label: 'BASIC (41-68)' },
  { key: '800', label: '800점대 (69-136)' },
  { key: '900', label: '900점대 (137+)' },
] as const;

interface LearnControlPanelProps {
  canStart: boolean;
  availableCount: number;
  mode: QuizMode;
  direction: QuizDirection;
  count: number;
  selectedDays: number[];
  selectedRanges: string[];
  orderMode: 'random' | 'sequential';
  shuffleChoices: boolean;
  onModeChange: (mode: QuizMode) => void;
  onDirectionChange: (direction: QuizDirection) => void;
  onCountChange: (count: number) => void;
  onSelectedDaysChange: (days: number[]) => void;
  onSelectedRangesChange: (ranges: string[]) => void;
  onOrderModeChange: (orderMode: 'random' | 'sequential') => void;
  onShuffleChoicesChange: (value: boolean) => void;
  onStart: () => void;
}

const DAY_OPTIONS = Array.from({ length: 30 }, (_, idx) => idx + 1);

export function LearnControlPanel({
  canStart,
  availableCount,
  mode,
  direction,
  count,
  selectedDays,
  selectedRanges,
  orderMode,
  shuffleChoices,
  onModeChange,
  onDirectionChange,
  onCountChange,
  onSelectedDaysChange,
  onSelectedRangesChange,
  onOrderModeChange,
  onShuffleChoicesChange,
  onStart,
}: LearnControlPanelProps) {
  const toggleDay = (day: number) => {
    const next = selectedDays.includes(day)
      ? selectedDays.filter((item) => item !== day)
      : [...selectedDays, day].sort((a, b) => a - b);
    onSelectedDaysChange(next);
  };

  const toggleRange = (range: string) => {
    const next = selectedRanges.includes(range)
      ? selectedRanges.filter((item) => item !== range)
      : [...selectedRanges, range];
    onSelectedRangesChange(next);
  };

  return (
    <div className="rounded-3xl p-6 bg-white border border-gray-200 shadow-sm space-y-4">
      <div>
        <div className="text-sm text-gray-500">학습 가능 단어</div>
        <div className="text-3xl font-bold">{availableCount}개</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-700">학습 모드</div>
          <div className="grid grid-cols-3 gap-2">
            {(['flash', 'mc', 'sa'] as QuizMode[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onModeChange(item)}
                className={`py-2 rounded-xl border text-sm ${
                  mode === item ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200'
                }`}
              >
                {item === 'flash' ? '플래시' : item === 'mc' ? '객관식' : '주관식'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-700">학습 방향</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onDirectionChange('en2ko')}
              className={`py-2 rounded-xl border text-sm ${
                direction === 'en2ko' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200'
              }`}
            >
              영어 → 한국어
            </button>
            <button
              type="button"
              onClick={() => onDirectionChange('ko2en')}
              className={`py-2 rounded-xl border text-sm ${
                direction === 'ko2en' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200'
              }`}
            >
              한국어 → 영어
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold text-gray-700">문제 수</div>
        <input
          type="number"
          min={1}
          max={300}
          value={count}
          onChange={(e) => onCountChange(Math.max(1, parseInt(e.target.value || '1', 10)))}
          className="w-full rounded-xl border border-gray-200 px-3 py-2"
        />
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold text-gray-700">범위 선택</div>
        <div className="grid grid-cols-2 gap-2">
          {RANGE_OPTIONS.map((range) => (
            <button
              key={range.key}
              type="button"
              onClick={() => toggleRange(range.key)}
              className={`py-2 rounded-xl border text-sm ${
                selectedRanges.includes(range.key) ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-700">DAY 선택</div>
          <div className="text-xs text-gray-500">{selectedDays.length}개 선택</div>
        </div>
        <div className="max-h-32 overflow-auto rounded-xl border border-gray-200 p-2 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {DAY_OPTIONS.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`py-1 rounded-lg text-xs border ${
                selectedDays.includes(day) ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-gray-200'
              }`}
            >
              D{day}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-700">문제 순서</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onOrderModeChange('random')}
              className={`py-2 rounded-xl border text-sm ${
                orderMode === 'random' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-gray-200'
              }`}
            >
              랜덤
            </button>
            <button
              type="button"
              onClick={() => onOrderModeChange('sequential')}
              className={`py-2 rounded-xl border text-sm ${
                orderMode === 'sequential' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-gray-200'
              }`}
            >
              순차
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-700">객관식 보기 섞기</div>
          <button
            type="button"
            onClick={() => onShuffleChoicesChange(!shuffleChoices)}
            className={`w-full py-2 rounded-xl border text-sm ${
              shuffleChoices ? 'bg-amber-50 border-amber-500 text-amber-700' : 'border-gray-200'
            }`}
          >
            {shuffleChoices ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <Button onClick={onStart} disabled={!canStart} className="w-full py-6 text-lg rounded-2xl">
        <Play className="size-5 mr-2" />
        학습 시작
      </Button>
    </div>
  );
}
