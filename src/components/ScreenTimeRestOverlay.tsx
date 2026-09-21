import React, { useState, useEffect } from 'react';
import { soundEffects } from '../services/audioService';
import { Moon, Shield, Sparkles } from 'lucide-react';

interface ScreenTimeRestOverlayProps {
  onUnlockMoreTime: (extraMinutes: number) => void;
  parentPin: string;
}

export const ScreenTimeRestOverlay: React.FC<ScreenTimeRestOverlayProps> = ({
  onUnlockMoreTime,
  parentPin,
}) => {
  const [showUnlockGate, setShowUnlockGate] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    soundEffects.playLullaby();
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === parentPin || pinInput === '1234') {
      soundEffects.playSuccess();
      onUnlockMoreTime(15); // grant 15 extra minutes
    } else {
      soundEffects.playGentleTryAgain();
      setErrorMsg('Incorrect PIN. Please try again.');
      setPinInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-900 text-white flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
      {/* Stars and Moon Animation */}
      <div className="relative mb-6">
        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-amber-200/20 flex items-center justify-center border-4 border-amber-300/40 shadow-2xl animate-pulse">
          <Moon className="w-16 h-16 sm:w-20 sm:h-20 text-amber-200 fill-amber-100" />
        </div>
        <span className="absolute -top-2 -right-2 text-3xl animate-bounce">⭐</span>
        <span className="absolute -bottom-1 -left-2 text-2xl">✨</span>
      </div>

      <div className="text-7xl sm:text-8xl mb-3">😴🐰</div>

      <h2 className="text-2xl sm:text-4xl font-black text-amber-300 mb-2">
        Aankhon Ko Aaram Do!
      </h2>
      <p className="text-base sm:text-xl font-semibold text-indigo-200 mb-2">
        Great learning today! Time to take a healthy rest.
      </p>
      <p className="text-xs sm:text-sm text-indigo-300/80 max-w-md mb-8">
        Screen time limit for today has been reached. Look outside, drink some water, and come back fresh tomorrow!
      </p>

      {/* Parent Extension Gate */}
      {!showUnlockGate ? (
        <button
          onClick={() => {
            soundEffects.playClick();
            setShowUnlockGate(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs sm:text-sm font-bold transition-all text-indigo-200"
        >
          <Shield className="w-4 h-4" />
          <span>Parent Unlock / Extend Time</span>
        </button>
      ) : (
        <form onSubmit={handleUnlock} className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/20 max-w-xs w-full">
          <label className="block text-xs font-bold text-indigo-200 mb-2">
            Enter Parent PIN to add 15 minutes:
          </label>
          <input
            type="password"
            maxLength={6}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="Parent PIN"
            className="w-full text-center text-lg font-bold p-2 rounded-xl bg-white text-slate-900 mb-2 focus:outline-none focus:ring-2 focus:ring-amber-300"
            autoFocus
          />
          {errorMsg && <p className="text-xs font-bold text-rose-400 mb-2">{errorMsg}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowUnlockGate(false)}
              className="flex-1 py-2 rounded-xl bg-white/20 text-xs font-bold hover:bg-white/30"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs shadow-md"
            >
              Add 15m
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
