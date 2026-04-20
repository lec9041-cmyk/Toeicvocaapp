import { useEffect, useMemo, useState } from 'react';
import { buildMcChoices, gradeAnswer } from '../engines/quizEngine';
import { QuizSessionMeta } from '../types/quiz';
import { QuizDirection, QuizMode, Word } from '../types/stats';

interface UseQuizSessionProps {
  words: Word[];
  mode: QuizMode;
  direction: QuizDirection;
  meta: QuizSessionMeta;
  onRecordAnswer: () => void;
  onSaveResume: (meta: QuizSessionMeta, remainingWords: Word[]) => void;
  onComplete: (summary: { correct: number; total: number; xp: number; wrongWords: Word[] }, meta: QuizSessionMeta) => void;
}

export const useQuizSession = ({
  words,
  mode,
  direction,
  meta,
  onRecordAnswer,
  onSaveResume,
  onComplete,
}: UseQuizSessionProps) => {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [wrongWords, setWrongWords] = useState<Word[]>([]);

  const current = words[index];
  const answer = direction === 'en2ko' ? current?.korean : current?.english;
  const choices = useMemo(() => {
    if (mode !== 'mc') return [];
    return buildMcChoices(words, index, direction);
  }, [mode, words, index, direction]);

  useEffect(() => {
    if (!words.length) return;
    onSaveResume(meta, words.slice(index));
  }, []);

  const advance = (isCorrect: boolean) => {
    onRecordAnswer();
    const graded = gradeAnswer({ isCorrect });
    const nextScore = graded ? score + 1 : score;
    const nextWrongWords = graded || !current ? wrongWords : [...wrongWords, current];

    setScore(nextScore);
    if (!graded && current) setWrongWords(nextWrongWords);

    const nextIndex = index + 1;
    const remaining = words.slice(nextIndex);
    onSaveResume(meta, remaining);

    if (nextIndex >= words.length) {
      onComplete(
        {
          correct: nextScore,
          total: words.length,
          xp: nextScore * 10,
          wrongWords: nextWrongWords,
        },
        meta
      );
      return;
    }

    setIndex(nextIndex);
    setRevealed(false);
    setSelectedAnswer(null);
  };

  return {
    index,
    current,
    answer,
    choices,
    revealed,
    selectedAnswer,
    setRevealed,
    setSelectedAnswer,
    answerFlash: (knowIt: boolean) => advance(knowIt),
    answerMc: (choice: string) => {
      if (selectedAnswer) return;
      setSelectedAnswer(choice);
      setTimeout(() => advance(choice === answer), 300);
    },
    saveCloseSnapshot: () => onSaveResume(meta, words.slice(index)),
  };
};
