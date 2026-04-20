import { Word } from '../types/stats';

export const recommendNextWords = (words: Word[], limit: number = 20) => {
  return words.slice(0, Math.min(limit, words.length));
};
