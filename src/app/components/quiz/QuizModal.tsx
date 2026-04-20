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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-300">
        <div className="p-5 md:p-6 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div className="px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-sm font-bold text-blue-700">
              {index + 1} / {total}
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <X className="size-4" />
            </button>
          </div>
          <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 md:p-8">
          {mode === 'flash' ? (
            <div className="space-y-6 md:space-y-8">
              <div
                className={`
                  relative rounded-3xl overflow-hidden
                  bg-gradient-to-br from-white via-slate-50 to-blue-50/30
                  border border-gray-200/50 shadow-2xl
                  transition-all duration-300
                  ${!revealed
                    ? 'cursor-pointer hover:shadow-3xl hover:scale-[1.01] active:scale-[0.99]'
                    : 'shadow-xl'
                  }
                `}
                onClick={!revealed ? onReveal : undefined}
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-pink-400/20 to-orange-400/20 rounded-full blur-3xl -ml-20 -mb-20" />

                <div className="relative z-10 flex flex-col items-center justify-center px-6 py-16 md:px-12 md:py-24">
                  <div className="text-center space-y-6 md:space-y-8 w-full max-w-2xl">
                    <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-br from-gray-900 via-gray-700 to-gray-600 bg-clip-text text-transparent leading-tight">
                      {question}
                    </div>

                    {revealed && (
                      <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                          {answer}
                        </div>
                      </div>
                    )}

                    {!revealed && (
                      <div className="pt-8 md:pt-12 flex flex-col items-center gap-3 opacity-60">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg animate-pulse">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <p className="text-xs md:text-sm font-semibold text-gray-500">카드를 탭하여 뜻 확인</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {revealed && (
                <div className="grid grid-cols-2 gap-3 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <button
                    onClick={() => onAnswerFlash(false)}
                    className="group relative h-20 sm:h-24 md:h-28 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-rose-100 opacity-100 group-hover:opacity-90 transition-opacity" />
                    <div className="relative h-full flex flex-col items-center justify-center gap-1.5 md:gap-2">
                      <div className="text-2xl md:text-3xl">😵</div>
                      <span className="text-base md:text-lg font-bold text-red-700">몰라요</span>
                    </div>
                  </button>

                  <button
                    onClick={() => onAnswerFlash(true)}
                    className="group relative h-20 sm:h-24 md:h-28 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-100 opacity-100 group-hover:opacity-90 transition-opacity" />
                    <div className="relative h-full flex flex-col items-center justify-center gap-1.5 md:gap-2">
                      <div className="text-2xl md:text-3xl">🎉</div>
                      <span className="text-base md:text-lg font-bold text-green-700">알아요</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-3xl font-bold text-center mb-6">{question}</div>
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
