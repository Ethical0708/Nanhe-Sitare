import React from 'react';
import { Sparkles, Star, Flame, Volume2, VolumeX, Shield, WifiOff } from 'lucide-react';
import { ParentSettings } from '../types';
import { soundEffects } from '../services/audioService';

interface NavbarProps {
  totalStars: number;
  dailyStreak: number;
  settings: ParentSettings;
  onToggleSound: () => void;
  onOpenParentControls: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalStars,
  dailyStreak,
  settings,
  onToggleSound,
  onOpenParentControls,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-4 border-amber-200 px-3 sm:px-6 py-2.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-pink-500 flex items-center justify-center shadow-md transform hover:rotate-6 transition-transform cursor-pointer">
            <span className="text-2xl sm:text-3xl select-none" role="img" aria-label="star">🌟</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
                Nanhe Sitare
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-300">
                <WifiOff className="w-3 h-3" />
                Offline Ready
              </span>
            </div>
            <p className="text-xs font-medium text-amber-800/80 hidden sm:block">
              Khel Khel Mein Seekho! • 100% Ad-Free & Safe
            </p>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Star Counter */}
          <div
            id="stars-badge"
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-100 to-yellow-200 border-2 border-amber-400 px-3 py-1.5 rounded-2xl shadow-sm cursor-default hover:scale-105 transition-transform"
            title="Earned Stars"
          >
            <Star className="w-5 h-5 fill-amber-400 text-amber-500 animate-pulse" />
            <span className="text-base sm:text-lg font-bold text-amber-900 leading-none">
              {totalStars}
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-600 hidden sm:block" />
          </div>

          {/* Daily Streak */}
          <div
            id="streak-badge"
            className="hidden sm:flex items-center gap-1 bg-orange-100 border-2 border-orange-300 px-2.5 py-1.5 rounded-2xl text-orange-800 text-sm font-bold"
            title="Daily Learning Streak"
          >
            <Flame className="w-4 h-4 fill-orange-500 text-orange-600" />
            <span>{dailyStreak}d</span>
          </div>

          {/* Sound Toggle */}
          <button
            id="audio-toggle-btn"
            onClick={() => {
              soundEffects.playClick();
              onToggleSound();
            }}
            className={`p-2 sm:p-2.5 rounded-2xl border-2 transition-transform active:scale-90 ${
              settings.soundEffects
                ? 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200'
            }`}
            title={settings.soundEffects ? 'Sound Effects ON' : 'Sound Effects OFF'}
            aria-label="Toggle Sound"
          >
            {settings.soundEffects ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>

          {/* Parent Zone Button */}
          <button
            id="parent-zone-btn"
            onClick={() => {
              soundEffects.playClick();
              onOpenParentControls();
            }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm px-3 py-2 rounded-2xl shadow-md border-b-2 border-indigo-800 transition-all active:translate-y-0.5"
            title="Parent Zone & Progress"
          >
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Parents</span>
          </button>
        </div>
      </div>
    </header>
  );
};
