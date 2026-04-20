export interface SettingsState {
  todayGoal: number;
  orderMode: 'random' | 'sequential';
  shuffleChoices: boolean;
}

export const DEFAULT_SETTINGS: SettingsState = {
  todayGoal: 30,
  orderMode: 'random',
  shuffleChoices: true,
};
