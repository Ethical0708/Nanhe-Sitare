import React, { useState, useEffect, useCallback } from 'react';
import { ActiveCategory, LearningProgress, ParentSettings, PlacedSticker } from './types';
import { storageService, DEFAULT_PROGRESS, DEFAULT_SETTINGS } from './services/storageService';
import { soundEffects, SpeechService } from './services/audioService';
import { Navbar } from './components/Navbar';
import { CategoryNav } from './components/CategoryNav';
import { AlphabetZone } from './components/AlphabetZone';
import { NumberZone } from './components/NumberZone';
import { ColorZone } from './components/ColorZone';
import { GameHub } from './components/GameHub';
import { StickerBook } from './components/StickerBook';
import { ParentalControlsModal } from './components/ParentalControlsModal';
import { ScreenTimeRestOverlay } from './components/ScreenTimeRestOverlay';
import { StarCelebration } from './components/StarCelebration';

export default function App() {
  const [progress, setProgress] = useState<LearningProgress>(() => storageService.getProgress());
  const [settings, setSettings] = useState<ParentSettings>(() => storageService.getSettings());
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>('alphabets');

  const [isParentModalOpen, setIsParentModalOpen] = useState(false);
  const [celebration, setCelebration] = useState<{ count: number; message?: string } | null>(null);

  // Sync state to storage
  useEffect(() => {
    storageService.saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    storageService.saveSettings(settings);
  }, [settings]);

  // Screen Time Tracking Timer (ticks every 60 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => ({
        ...prev,
        screenTimeMinutesToday: prev.screenTimeMinutesToday + 1,
      }));
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Screen Time Exceeded Check
  const isScreenTimeExceeded =
    settings.screenTimeLimitMinutes > 0 &&
    progress.screenTimeMinutesToday >= settings.screenTimeLimitMinutes;

  // Award stars with celebration
  const handleEarnStar = useCallback((count = 1) => {
    setProgress(prev => ({
      ...prev,
      totalStars: prev.totalStars + count,
      starsToday: prev.starsToday + count,
    }));
    setCelebration({
      count,
      message: count > 1 ? 'Super Duper! Shabaash!' : 'Shabaash! Bahut Accha!',
    });
  }, []);

  // Record user activities for Parent reports
  const handleRecordActivity = useCallback(
    (category: 'alphabets' | 'numbers' | 'colors' | 'games', itemId: string, correct: boolean) => {
      setProgress(prev => {
        const attempts = prev.accuracyTotalAttempts + 1;
        const correctCount = correct ? prev.accuracyTotalCorrect + 1 : prev.accuracyTotalCorrect;

        let alphabets = [...prev.alphabetsMastered];
        let numbers = [...prev.numbersMastered];
        let colors = [...prev.colorsMastered];

        if (correct) {
          if (category === 'alphabets' && !alphabets.includes(itemId)) {
            alphabets.push(itemId);
          } else if (category === 'numbers') {
            const numVal = parseInt(itemId, 10);
            if (!isNaN(numVal) && !numbers.includes(numVal)) {
              numbers.push(numVal);
            }
          } else if (category === 'colors' && !colors.includes(itemId)) {
            colors.push(itemId);
          }
        }

        return {
          ...prev,
          gamesPlayedCount: prev.gamesPlayedCount + 1,
          accuracyTotalAttempts: attempts,
          accuracyTotalCorrect: correctCount,
          alphabetsMastered: alphabets,
          numbersMastered: numbers,
          colorsMastered: colors,
        };
      });
    },
    []
  );

  // Sticker unlocking
  const handleUnlockSticker = useCallback((stickerId: string, cost: number) => {
    setProgress(prev => ({
      ...prev,
      totalStars: Math.max(0, prev.totalStars - cost),
      unlockedStickers: [...prev.unlockedStickers, stickerId],
    }));
  }, []);

  // Update placed stickers on playground scene
  const handleUpdatePlacedStickers = useCallback((stickers: PlacedSticker[]) => {
    setProgress(prev => ({
      ...prev,
      placedStickers: stickers,
    }));
  }, []);

  // Sound toggle in Navbar
  const handleToggleSound = useCallback(() => {
    setSettings(prev => {
      const nextSound = !prev.soundEffects;
      if (!nextSound) {
        SpeechService.stop();
      }
      return {
        ...prev,
        soundEffects: nextSound,
        voiceNarration: nextSound,
      };
    });
  }, []);

  // Parent unlocks more screen time
  const handleUnlockMoreTime = useCallback((extraMinutes: number) => {
    setSettings(prev => ({
      ...prev,
      screenTimeLimitMinutes: prev.screenTimeLimitMinutes + extraMinutes,
    }));
  }, []);

  // Reset all progress
  const handleResetProgress = useCallback(() => {
    const fresh = storageService.resetAllProgress();
    setProgress(fresh);
    soundEffects.playClick();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/40 to-yellow-50 text-slate-900 flex flex-col font-['Fredoka',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        totalStars={progress.totalStars}
        dailyStreak={progress.dailyStreak}
        settings={settings}
        onToggleSound={handleToggleSound}
        onOpenParentControls={() => setIsParentModalOpen(true)}
      />

      {/* Main Learning Hub */}
      <main className="flex-1 flex flex-col pb-8">
        {/* Category Navigation Bar */}
        <CategoryNav
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          voiceEnabled={settings.voiceNarration}
          enabledCategories={settings.enabledCategories}
        />

        {/* Active Zone Content */}
        <div className="flex-1 flex flex-col justify-start">
          {activeCategory === 'alphabets' && (
            <AlphabetZone
              settings={settings}
              onEarnStar={handleEarnStar}
              onRecordActivity={handleRecordActivity}
            />
          )}

          {activeCategory === 'numbers' && (
            <NumberZone
              settings={settings}
              onEarnStar={handleEarnStar}
              onRecordActivity={handleRecordActivity}
            />
          )}

          {activeCategory === 'colors' && (
            <ColorZone
              settings={settings}
              onEarnStar={handleEarnStar}
              onRecordActivity={handleRecordActivity}
            />
          )}

          {activeCategory === 'games' && (
            <GameHub
              settings={settings}
              onEarnStar={handleEarnStar}
              onRecordActivity={handleRecordActivity}
            />
          )}

          {activeCategory === 'stickers' && (
            <StickerBook
              totalStars={progress.totalStars}
              unlockedStickerIds={progress.unlockedStickers}
              placedStickers={progress.placedStickers}
              settings={settings}
              onUnlockSticker={handleUnlockSticker}
              onUpdatePlacedStickers={handleUpdatePlacedStickers}
            />
          )}
        </div>
      </main>

      {/* Star Earning Celebration Popup */}
      {celebration && (
        <StarCelebration
          count={celebration.count}
          message={celebration.message}
          onClose={() => setCelebration(null)}
        />
      )}

      {/* Screen Time Rest Notification Overlay */}
      {isScreenTimeExceeded && (
        <ScreenTimeRestOverlay
          onUnlockMoreTime={handleUnlockMoreTime}
          parentPin={settings.pin}
        />
      )}

      {/* Parental Controls & Progress Reports Modal */}
      <ParentalControlsModal
        isOpen={isParentModalOpen}
        onClose={() => setIsParentModalOpen(false)}
        progress={progress}
        settings={settings}
        onUpdateSettings={setSettings}
        onResetProgress={handleResetProgress}
      />
    </div>
  );
}
