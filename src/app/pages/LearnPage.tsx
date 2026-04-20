import { useEffect, useMemo, useState } from 'react';
import { LearnControlPanel } from '../components/learn/LearnControlPanel';
import { QuizModal } from '../components/quiz/QuizModal';
import { useAppStore } from '../store/useAppStore';
import { useQuizSession } from '../store/useQuizSession';
import { Word } from '../types/stats';

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
  const {
    state,
    setSelectedDays,
    setSelectedRanges,
    updateSettings,
    recordAnswer,
    saveResumeSession,
    finalizeQuizSession,
    clearResumeSession,
  } = useAppStore();
  const [showQuiz, setShowQuiz] = useState(false);
  const activeMode = state.resumeSession?.mode ?? state.settings.mode;
  const activeDirection = state.resumeSession?.direction ?? state.settings.direction;
  const activeCount = state.resumeSession?.count ?? state.settings.count;
  const activeDays = state.resumeSession?.days ?? state.selectedDays;
  const activeRanges = state.resumeSession?.ranges ?? state.selectedRanges;

  const filteredWords = useMemo(() => {
    const byDay = state.words.filter((word) => activeDays.includes(word.day));
    return byDay.filter((word) =>
      activeRanges.some((range) => {
        const [min, max] = getWordNumberRange(range);
        return word.no >= min && word.no <= max;
      })
    );
  }, [state.words, activeDays, activeRanges]);

  const orderedWords = useMemo(() => {
    if (state.settings.orderMode === 'sequential') return filteredWords;
    return [...filteredWords].sort(() => Math.random() - 0.5);
  }, [filteredWords, state.settings.orderMode]);

  const quizWords: Word[] = useMemo(() => {
    if (state.resumeSession?.remainingWords?.length) return state.resumeSession.remainingWords;
    return orderedWords.slice(0, Math.min(activeCount, orderedWords.length));
  }, [state.resumeSession, orderedWords, activeCount]);

  const meta = {
    mode: activeMode,
    direction: activeDirection,
    count: activeCount,
    days: activeDays,
    ranges: activeRanges,
  };

  const session = useQuizSession({
    words: quizWords,
    mode: activeMode,
    direction: activeDirection,
    shuffleChoices: state.settings.shuffleChoices,
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
      <LearnControlPanel
        canStart={quizWords.length > 0}
        availableCount={filteredWords.length}
        mode={state.settings.mode}
        direction={state.settings.direction}
        count={state.settings.count}
        selectedDays={state.selectedDays}
        selectedRanges={state.selectedRanges}
        orderMode={state.settings.orderMode}
        shuffleChoices={state.settings.shuffleChoices}
        onModeChange={(mode) => updateSettings({ mode })}
        onDirectionChange={(direction) => updateSettings({ direction })}
        onCountChange={(count) => updateSettings({ count })}
        onSelectedDaysChange={setSelectedDays}
        onSelectedRangesChange={setSelectedRanges}
        onOrderModeChange={(orderMode) => updateSettings({ orderMode })}
        onShuffleChoicesChange={(shuffleChoices) => updateSettings({ shuffleChoices })}
        onStart={start}
      />

      {showQuiz && session.current && (
        <QuizModal
          mode={activeMode}
          direction={activeDirection}
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
