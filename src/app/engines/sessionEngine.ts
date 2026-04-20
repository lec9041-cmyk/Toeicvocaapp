export interface SessionRecord {
  ts: number;
  mode: string;
  dir: string;
  total: number;
  score: number;
  wrongCount: number;
  days: number[];
  ranges: string[];
}

export const appendSessionRecord = (record: SessionRecord) => {
  const sessionsRaw = localStorage.getItem('toeic_sessions_v1');
  let sessions: SessionRecord[] = [];
  if (sessionsRaw) {
    try {
      sessions = JSON.parse(sessionsRaw);
    } catch {
      sessions = [];
    }
  }

  sessions.unshift(record);
  localStorage.setItem('toeic_sessions_v1', JSON.stringify(sessions.slice(0, 200)));
};
