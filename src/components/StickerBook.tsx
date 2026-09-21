import React, { useState } from 'react';
import { StickerItem, PlacedSticker, ParentSettings } from '../types';
import { STICKERS_DATA } from '../data/learningData';
import { soundEffects, SpeechService } from '../services/audioService';
import { Lock, Sparkles, Trash2, PlusCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StickerBookProps {
  totalStars: number;
  unlockedStickerIds: string[];
  placedStickers: PlacedSticker[];
  settings: ParentSettings;
  onUnlockSticker: (stickerId: string, cost: number) => void;
  onUpdatePlacedStickers: (stickers: PlacedSticker[]) => void;
}

export const StickerBook: React.FC<StickerBookProps> = ({
  totalStars,
  unlockedStickerIds,
  placedStickers,
  settings,
  onUnlockSticker,
  onUpdatePlacedStickers,
}) => {
  const [selectedSticker, setSelectedSticker] = useState<StickerItem | null>(null);

  const handleUnlock = (sticker: StickerItem) => {
    if (totalStars < sticker.cost) {
      soundEffects.playGentleTryAgain();
      if (settings.voiceNarration) {
        SpeechService.speak(`You need ${sticker.cost - totalStars} more stars to unlock ${sticker.name}! Play more games to earn stars!`);
      }
      return;
    }

    soundEffects.playFanfare();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
    onUnlockSticker(sticker.id, sticker.cost);
    if (settings.voiceNarration) {
      SpeechService.speak(`Hooray! You unlocked the ${sticker.name}! Now you can place it on your playground!`);
    }
  };

  const handleAddStickerToScene = (sticker: StickerItem) => {
    soundEffects.playPop();
    const newPlaced: PlacedSticker = {
      id: `placed_${Date.now()}_${Math.random()}`,
      stickerId: sticker.id,
      emoji: sticker.emoji,
      x: 30 + Math.random() * 40,
      y: 40 + Math.random() * 30,
      scale: 1.2,
    };
    onUpdatePlacedStickers([...placedStickers, newPlaced]);
  };

  const handleRemoveSticker = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playClick();
    onUpdatePlacedStickers(placedStickers.filter(s => s.id !== id));
  };

  const handleClearPlayground = () => {
    soundEffects.playClick();
    onUpdatePlacedStickers([]);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 py-2 space-y-4">
      {/* Playground Meadow Display */}
      <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden shadow-xl border-4 border-amber-300 bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-300 select-none">
        {/* Clouds & Sun Backdrop */}
        <div className="absolute top-4 left-6 text-4xl animate-pulse">☁️</div>
        <div className="absolute top-8 right-16 text-5xl">☀️</div>
        <div className="absolute top-12 left-1/3 text-3xl">☁️</div>
        <div className="absolute bottom-2 left-4 text-4xl">🌻</div>
        <div className="absolute bottom-3 right-8 text-4xl">🌷</div>
        <div className="absolute bottom-4 left-1/2 text-3xl">🍄</div>

        {/* Clear button */}
        <button
          onClick={handleClearPlayground}
          className="absolute top-3 left-3 bg-white/80 hover:bg-white text-slate-700 font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1 z-20"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Scene
        </button>

        <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-xl text-xs font-bold text-slate-700 shadow z-20">
          ⭐ Stars Available: <span className="text-amber-600 font-black">{totalStars}</span>
        </div>

        {/* Placed Stickers on Playground */}
        {placedStickers.map(item => (
          <div
            key={item.id}
            className="absolute group cursor-pointer"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: `scale(${item.scale}) translate(-50%, -50%)`,
            }}
            onClick={() => {
              soundEffects.playPop();
            }}
          >
            <span className="text-5xl sm:text-6xl drop-shadow-md select-none transition-transform group-hover:scale-125">
              {item.emoji}
            </span>
            <button
              onClick={(e) => handleRemoveSticker(item.id, e)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white text-xs font-black rounded-full items-center justify-center hidden group-hover:flex shadow"
              title="Remove"
            >
              ✕
            </button>
          </div>
        ))}

        {placedStickers.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-600/70 font-bold text-sm sm:text-base">
            <span>Tap an unlocked sticker below to decorate your playground!</span>
          </div>
        )}
      </div>

      {/* Sticker Drawer Collection */}
      <div className="bg-white rounded-3xl p-5 shadow-xl border-4 border-amber-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Sticker Collection & Rewards
            </h3>
            <p className="text-xs text-slate-500">
              Unlock cool stickers with your stars and decorate your scene!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 sm:gap-3">
          {STICKERS_DATA.map(sticker => {
            const isUnlocked = unlockedStickerIds.includes(sticker.id);
            const canAfford = totalStars >= sticker.cost;

            return (
              <div
                key={sticker.id}
                onClick={() => {
                  if (isUnlocked) {
                    handleAddStickerToScene(sticker);
                  } else {
                    handleUnlock(sticker);
                  }
                }}
                className={`relative flex flex-col items-center p-2.5 rounded-2xl border-2 transition-all cursor-pointer shadow-sm active:scale-95 ${
                  isUnlocked
                    ? 'bg-amber-50 border-amber-300 hover:bg-amber-100 hover:-translate-y-1'
                    : canAfford
                    ? 'bg-emerald-50 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-slate-100 border-slate-200 opacity-70'
                }`}
              >
                <span className="text-3xl sm:text-4xl mb-1 select-none">{sticker.emoji}</span>
                <span className="text-[11px] font-bold text-slate-700 text-center leading-tight truncate w-full">
                  {sticker.name}
                </span>

                {isUnlocked ? (
                  <span className="mt-1 inline-flex items-center gap-0.5 text-[10px] font-extrabold text-amber-700 bg-amber-200/80 px-1.5 py-0.5 rounded-full">
                    <PlusCircle className="w-2.5 h-2.5" /> Place
                  </span>
                ) : (
                  <span
                    className={`mt-1 inline-flex items-center gap-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      canAfford ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <Lock className="w-2.5 h-2.5" /> ⭐ {sticker.cost}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
