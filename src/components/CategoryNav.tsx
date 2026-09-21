import React from 'react';
import { ActiveCategory } from '../types';
import { soundEffects, SpeechService } from '../services/audioService';

interface CategoryNavProps {
  activeCategory: ActiveCategory;
  onSelectCategory: (cat: ActiveCategory) => void;
  voiceEnabled: boolean;
  enabledCategories: {
    alphabets: boolean;
    numbers: boolean;
    colors: boolean;
    games: boolean;
    stickers: boolean;
  };
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
  voiceEnabled,
  enabledCategories,
}) => {
  const categories: {
    id: ActiveCategory;
    title: string;
    sub: string;
    emoji: string;
    color: string;
    activeBorder: string;
    narration: string;
  }[] = [
    {
      id: 'alphabets',
      title: 'Alphabets',
      sub: 'A B C Seekho',
      emoji: '🔤',
      color: 'from-rose-400 to-red-500',
      activeBorder: 'border-red-500 ring-4 ring-red-200',
      narration: 'Alphabets! A B C seekho!',
    },
    {
      id: 'numbers',
      title: 'Numbers',
      sub: '1 2 3 Ginti',
      emoji: '🔢',
      color: 'from-amber-400 to-orange-500',
      activeBorder: 'border-orange-500 ring-4 ring-orange-200',
      narration: 'Numbers! Ginti seekho!',
    },
    {
      id: 'colors',
      title: 'Colors',
      sub: 'Rang Pehchano',
      emoji: '🎨',
      color: 'from-emerald-400 to-teal-500',
      activeBorder: 'border-teal-500 ring-4 ring-teal-200',
      narration: 'Colors! Rang seekho!',
    },
    {
      id: 'games',
      title: 'Fun Games',
      sub: 'Masti Aur Khel',
      emoji: '🎮',
      color: 'from-blue-400 to-indigo-500',
      activeBorder: 'border-indigo-500 ring-4 ring-indigo-200',
      narration: 'Fun Games! Masti aur khel!',
    },
    {
      id: 'stickers',
      title: 'Stickers',
      sub: 'Stars & Rewards',
      emoji: '⭐',
      color: 'from-purple-400 to-pink-500',
      activeBorder: 'border-pink-500 ring-4 ring-pink-200',
      narration: 'Stickers! Apne stars se rewards unlock karo!',
    },
  ];

  const handleSelect = (cat: (typeof categories)[0]) => {
    soundEffects.playClick();
    if (voiceEnabled) {
      SpeechService.speak(cat.narration);
    }
    onSelectCategory(cat.id);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 py-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-4">
        {categories
          .filter(cat => enabledCategories[cat.id])
          .map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-btn-${cat.id}`}
                onClick={() => handleSelect(cat)}
                className={`relative group flex flex-col items-center justify-center p-3 sm:p-4 rounded-3xl transition-all duration-200 shadow-md ${
                  isActive
                    ? `bg-white ${cat.activeBorder} scale-102 -translate-y-1 shadow-lg`
                    : 'bg-white/80 hover:bg-white hover:-translate-y-0.5 border-2 border-amber-200'
                }`}
              >
                {/* Glow pill behind emoji */}
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-inner mb-1.5 transform group-hover:scale-110 transition-transform`}
                >
                  <span className="text-2xl sm:text-3xl select-none">{cat.emoji}</span>
                </div>
                <span className="text-sm sm:text-base font-bold text-slate-800 leading-tight">
                  {cat.title}
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">
                  {cat.sub}
                </span>

                {isActive && (
                  <div className="absolute -bottom-1 w-8 h-1.5 rounded-full bg-slate-800 animate-pulse" />
                )}
              </button>
            );
          })}
      </div>
    </div>
  );
};
