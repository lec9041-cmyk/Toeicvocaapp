import { SessionHistoryItem } from '../types/stats';

export const finalizeSession = (input: {
  mode: SessionHistoryItem['mode'];
  direction: SessionHistoryItem['direction'];
  total: number;
  score: number;
  days: number[];
  ranges: string[];
}): SessionHistoryItem => {
  return {
    ts: Date.now(),
    mode: input.mode,
    direction: input.direction,
    total: input.total,
    score: input.score,
    wrongCount: Math.max(0, input.total - input.score),
    days: input.days,
    ranges: input.ranges,
  };
};
