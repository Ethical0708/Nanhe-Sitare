export type ActiveCategory = 'alphabets' | 'numbers' | 'colors' | 'games' | 'stickers';

export type AlphabetSubMode = 'cards' | 'bubble-pop' | 'match' | 'trace';
export type NumberSubMode = 'cards' | 'feed-animal' | 'balloon-pop';
export type ColorSubMode = 'cards' | 'bucket-sort' | 'coloring';

export type LanguageMode = 'bilingual' | 'english' | 'hindi';

export interface AlphabetItem {
  letter: string;
  word: string;
  hindiWord: string;
  phonics: string;
  emoji: string;
  color: string;
  funFact: string;
}

export interface NumberItem {
  number: number;
  word: string;
  hindiWord: string;
  emoji: string;
  itemPlural: string;
  color: string;
}

export interface ColorItem {
  id: string;
  name: string;
  hindiName: string;
  hex: string;
  textColor: string;
  items: { name: string; emoji: string; hindiName: string }[];
}

export interface StickerItem {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  unlocked: boolean;
  category: 'animals' | 'nature' | 'fun';
}

export interface PlacedSticker {
  id: string;
  stickerId: string;
  emoji: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale: number;
}

export interface LearningProgress {
  totalStars: number;
  starsToday: number;
  lastActiveDate: string;
  dailyStreak: number;
  screenTimeMinutesToday: number;
  
  // Progress per category
  alphabetsMastered: string[];
  numbersMastered: number[];
  colorsMastered: string[];
  
  // Activity counts
  gamesPlayedCount: number;
  accuracyTotalCorrect: number;
  accuracyTotalAttempts: number;
  
  // Unlocked sticker IDs
  unlockedStickers: string[];
  placedStickers: PlacedSticker[];
}

export interface ParentSettings {
  pin: string; // default "1234"
  screenTimeLimitMinutes: number; // 0 = unlimited, 15, 30, 45, 60
  language: LanguageMode;
  soundEffects: boolean;
  voiceNarration: boolean;
  speechPitch: number; // default 1.2
  speechRate: number; // default 0.95
  enabledCategories: {
    alphabets: boolean;
    numbers: boolean;
    colors: boolean;
    games: boolean;
    stickers: boolean;
  };
}
