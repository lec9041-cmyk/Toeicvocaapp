import { AnswerRecordInput, QuizSessionMeta } from '../types/quiz';
import { QuizDirection, Word } from '../types/stats';

export const gradeAnswer = (input: AnswerRecordInput) => input.isCorrect;

export const buildMcChoices = (
  words: Word[],
  currentIndex: number,
  direction: QuizDirection
) => {
  const current = words[currentIndex];
  if (!current) return [];

  const answer = direction === 'en2ko' ? current.korean : current.english;
  const wrongChoices = words
    .filter((_, index) => index !== currentIndex)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((word) => (direction === 'en2ko' ? word.korean : word.english));

  return [answer, ...wrongChoices].sort(() => Math.random() - 0.5);
};

export const buildResumeSnapshot = (meta: QuizSessionMeta, remainingWords: Word[]) => ({
  ...meta,
  remainingWords,
  updatedAt: Date.now(),
});
