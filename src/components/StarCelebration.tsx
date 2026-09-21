import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Sparkles } from 'lucide-react';
import { soundEffects } from '../services/audioService';

interface StarCelebrationProps {
  count: number;
  message?: string;
  onClose: () => void;
}

export const StarCelebration: React.FC<StarCelebrationProps> = ({
  count,
  message = 'Shabaash! Bahut Accha!',
  onClose,
}) => {
  useEffect(() => {
    soundEffects.playStarEarn();
    confetti({
      particleCount: 40,
      spread: 70,
      origin: { y: 0.6 },
    });

    const timer = setTimeout(() => {
      onClose();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl border-4 border-amber-300 flex flex-col items-center text-center transform scale-110 animate-bounce pointer-events-auto">
        <div className="relative mb-2">
          <Star className="w-20 h-20 fill-amber-400 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
          <Sparkles className="w-8 h-8 text-amber-600 absolute -top-2 -right-2 animate-ping" />
        </div>
        <h3 className="text-2xl font-black text-amber-600 mb-0.5">
          +{count} {count === 1 ? 'Star' : 'Stars'}! ⭐
        </h3>
        <p className="text-base font-bold text-slate-800">{message}</p>
      </div>
    </div>
  );
};
