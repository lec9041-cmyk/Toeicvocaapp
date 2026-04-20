import { useEffect, useMemo, useState } from 'react';
import { LearnControlPanel } from '../components/learn/LearnControlPanel';
import { QuizModal } from '../components/quiz/QuizModal';
import { useAppStore } from '../store/useAppStore';
import { useQuizSession } from '../store/useQuizSession';
import { QuizDirection, QuizMode, Word } from '../types/stats';

const getWordNumberRange = (range: string): [number, number] => {
  switch (range) {
    case 'core': return [1, 40];
    case 'basic': return [41, 68];
    case '800': return [69, 136];
    case '900': return [137, 999999];
    default: return [1, 999999];
  }
};

interface LearnPageProps {
  autoStart?: boolean;
  onAutoStarted?: () => void;
}

export function LearnPage({ autoStart, onAutoStarted }: LearnPageProps) {
  const { state, recordAnswer, saveResumeSession, finalizeQuizSession, clearResumeSession } = useAppStore();
  const [showQuiz, setShowQuiz] = useState(false);
  const [mode] = useState<QuizMode>('flash');
  const [direction] = useState<QuizDirection>('en2ko');
  const [count] = useState(30);

  const filteredWords = useMemo(() => {
    const byDay = state.words.filter((word) => state.selectedDays.includes(word.day));
    return byDay.filter((word) =>
      state.selectedRanges.some((range) => {
        const [min, max] = getWordNumberRange(range);
        return word.no >= min && word.no <= max;
      })
    );
  }, [state.words, state.selectedDays, state.selectedRanges]);

  const quizWords: Word[] = useMemo(() => {
    if (state.resumeSession?.remainingWords?.length) return state.resumeSession.remainingWords;
    return filteredWords.slice(0, Math.min(count, filteredWords.length));
  }, [state.resumeSession, filteredWords, count]);

  const meta = {
    mode,
    direction,
    count,
    days: state.selectedDays,
    ranges: state.selectedRanges,
  };

  const session = useQuizSession({
    words: quizWords,
    mode,
    direction,
    meta,
    onRecordAnswer: recordAnswer,
    onSaveResume: saveResumeSession,
    onComplete: (summary, quizMeta) => {
      finalizeQuizSession(summary, quizMeta);
      setShowQuiz(false);
    },
  });

  const start = () => {
    if (!quizWords.length) return;
    setShowQuiz(true);
    onAutoStarted?.();
  };

  useEffect(() => {
    if (autoStart && !showQuiz && quizWords.length) start();
  }, [autoStart, showQuiz, quizWords.length]);

  return (
    <div className="space-y-4">
      <LearnControlPanel canStart={quizWords.length > 0} availableCount={filteredWords.length} onStart={start} />

      {showQuiz && session.current && (
        <QuizModal
          mode={mode}
          direction={direction}
          word={session.current}
          index={session.index}
          total={quizWords.length}
          answer={session.answer || ''}
          choices={session.choices}
          revealed={session.revealed}
          selectedAnswer={session.selectedAnswer}
          onReveal={() => session.setRevealed(true)}
          onAnswerFlash={session.answerFlash}
          onAnswerMc={session.answerMc}
          onClose={() => {
            session.saveCloseSnapshot();
            setShowQuiz(false);
          }}
        />
      )}

      {state.resumeSession && !showQuiz && (
        <button
          className="w-full py-3 rounded-xl bg-amber-100 text-amber-900 font-semibold"
          onClick={() => setShowQuiz(true)}
        >
          이어하기 ({state.resumeSession.remainingWords.length}문제 남음)
        </button>
      )}

      {state.resumeSession && (
        <button
          className="w-full py-3 rounded-xl bg-gray-100 text-gray-700"
          onClick={clearResumeSession}
        >
          이어하기 데이터 지우기
        </button>
      )}
    </div>
  );
}
