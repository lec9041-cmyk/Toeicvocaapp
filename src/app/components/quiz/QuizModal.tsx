import { X } from 'lucide-react';
import { QuizDirection, QuizMode, Word } from '../../types/stats';

interface QuizModalProps {
  mode: QuizMode;
  direction: QuizDirection;
  word: Word;
  index: number;
  total: number;
  answer: string;
  choices: string[];
  revealed: boolean;
  selectedAnswer: string | null;
  onReveal: () => void;
  onAnswerFlash: (knowIt: boolean) => void;
  onAnswerMc: (choice: string) => void;
  onClose: () => void;
}

export function QuizModal({
  mode,
  direction,
  word,
  index,
  total,
  answer,
  choices,
  revealed,
  selectedAnswer,
  onReveal,
  onAnswerFlash,
  onAnswerMc,
  onClose,
}: QuizModalProps) {
  const question = direction === 'en2ko' ? word.english : word.korean;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden">
        <div className="p-5 border-b flex justify-between items-center">
          <div className="font-semibold text-sm text-gray-500">{index + 1} / {total}</div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="size-4" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="text-3xl font-bold text-center">{question}</div>

          {mode === 'flash' ? (
            <>
              {!revealed ? (
                <button className="w-full py-4 rounded-xl bg-gray-100 font-semibold" onClick={onReveal}>
                  뜻 보기
                </button>
              ) : (
                <>
                  <div className="text-center text-xl font-semibold text-blue-600">{answer}</div>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="py-4 rounded-xl bg-red-100 font-semibold" onClick={() => onAnswerFlash(false)}>몰라요</button>
                    <button className="py-4 rounded-xl bg-green-100 font-semibold" onClick={() => onAnswerFlash(true)}>알아요</button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="space-y-3">
              {choices.map((choice) => (
                <button
                  key={choice}
                  disabled={!!selectedAnswer}
                  onClick={() => onAnswerMc(choice)}
                  className={`w-full py-3 rounded-xl border text-left px-4 ${
                    selectedAnswer === choice ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
