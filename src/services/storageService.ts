import { LearningProgress, ParentSettings } from '../types';

const PROGRESS_KEY = 'nanhe_sitare_progress_v1';
const SETTINGS_KEY = 'nanhe_sitare_settings_v1';

export const DEFAULT_PROGRESS: LearningProgress = {
  totalStars: 10, // starter gift stars so kids can unlock their first sticker!
  starsToday: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
  dailyStreak: 1,
  screenTimeMinutesToday: 0,
  alphabetsMastered: ['A', 'B'],
  numbersMastered: [1, 2],
  colorsMastered: ['red', 'blue'],
  gamesPlayedCount: 0,
  accuracyTotalCorrect: 0,
  accuracyTotalAttempts: 0,
  unlockedStickers: ['lion', 'puppy'],
  placedStickers: [
    { id: 'start_1', stickerId: 'lion', emoji: '🦁', x: 25, y: 55, scale: 1.2 },
    { id: 'start_2', stickerId: 'puppy', emoji: '🐶', x: 65, y: 50, scale: 1.1 },
  ],
};

export const DEFAULT_SETTINGS: ParentSettings = {
  pin: '1234',
  screenTimeLimitMinutes: 30, // 30 minutes recommended healthy limit for young kids
  language: 'bilingual',
  soundEffects: true,
  voiceNarration: true,
  speechPitch: 1.2,
  speechRate: 0.92,
  enabledCategories: {
    alphabets: true,
    numbers: true,
    colors: true,
    games: true,
    stickers: true,
  },
};

export const storageService = {
  getProgress(): LearningProgress {
    if (typeof window === 'undefined') return DEFAULT_PROGRESS;
    try {
      const data = localStorage.getItem(PROGRESS_KEY);
      if (!data) return DEFAULT_PROGRESS;
      const parsed = JSON.parse(data);
      const today = new Date().toISOString().split('T')[0];

      // Handle daily streak and daily stats reset
      if (parsed.lastActiveDate !== today) {
        const lastDate = new Date(parsed.lastActiveDate);
        const currentDate = new Date(today);
        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let streak = parsed.dailyStreak || 1;
        if (diffDays === 1) {
          streak += 1;
        } else if (diffDays > 1) {
          streak = 1;
        }

        parsed.dailyStreak = streak;
        parsed.starsToday = 0;
        parsed.screenTimeMinutesToday = 0;
        parsed.lastActiveDate = today;
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(parsed));
      }

      return { ...DEFAULT_PROGRESS, ...parsed };
    } catch {
      return DEFAULT_PROGRESS;
    }
  },

  saveProgress(progress: LearningProgress): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch {
      // safe fallback
    }
  },

  getSettings(): ParentSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (!data) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(data);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: ParentSettings): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // safe fallback
    }
  },

  resetAllProgress(): LearningProgress {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PROGRESS_KEY);
    }
    return DEFAULT_PROGRESS;
  },
};
