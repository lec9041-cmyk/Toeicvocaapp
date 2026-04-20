export interface ResumeWord {
  day: number;
  no: number;
  english: string;
  korean: string;
  index: number;
}

export interface ResumePayload {
  mode: string;
  direction: string;
  count: number;
  days: number[];
  ranges: string[];
  remainingWords: ResumeWord[];
  updatedAt: number;
}

export const saveResumePayload = (payload: ResumePayload) => {
  localStorage.setItem('toeic_resume_v1', JSON.stringify(payload));
};

export const clearResumePayload = () => {
  localStorage.removeItem('toeic_resume_v1');
};
