import React, { useState, useEffect } from 'react';
import { NumberItem, NumberSubMode, ParentSettings } from '../types';
import { NUMBERS_DATA } from '../data/learningData';
import { soundEffects, SpeechService } from '../services/audioService';
import { Volume2, ChevronLeft, ChevronRight, Sparkles, RefreshCw } from 'lucide-react';

interface NumberZoneProps {
  settings: ParentSettings;
  onEarnStar: (count?: number) => void;
  onRecordActivity: (category: 'numbers', itemId: string, correct: boolean) => void;
}

export const NumberZone: React.FC<NumberZoneProps> = ({
  settings,
  onEarnStar,
  onRecordActivity,
}) => {
  const [subMode, setSubMode] = useState<NumberSubMode>('cards');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Interactive counting state
  const [countedIndices, setCountedIndices] = useState<number[]>([]);

  // Feed animal game state
  const [feedTarget, setFeedTarget] = useState<number>(3);
  const [fedCount, setFedCount] = useState<number>(0);
  const [bunnyMunching, setBunnyMunching] = useState(false);

  // Balloon pop game state
  const [targetBalloonNumber, setTargetBalloonNumber] = useState<number>(5);
  const [balloonOptions, setBalloonOptions] = useState<{ id: number; number: number; color: string }[]>([]);

  const currentItem: NumberItem = NUMBERS_DATA[currentIndex];

  // Reset count array when card changes
  useEffect(() => {
    setCountedIndices([]);
    if (subMode === 'cards') {
      speakNumber(currentItem);
    }
  }, [currentIndex, subMode]);

  const speakNumber = (item: NumberItem = currentItem) => {
    if (!settings.voiceNarration) return;
    let text = `${item.number}! ${item.word}! ${item.number} ${item.itemPlural}!`;
    if (settings.language === 'bilingual') {
      text = `Number ${item.number}! ${item.word}! Hindi mein ${item.hindiWord}!`;
    } else if (settings.language === 'hindi') {
      text = `${item.number}! ${item.hindiWord}!`;
    }
    SpeechService.speak(text, {
      pitch: settings.speechPitch,
      rate: settings.speechRate,
    });
  };

  // Tap individual object to count
  const handleTapObject = (idx: number) => {
    soundEffects.playPop();
    const nextCount = countedIndices.includes(idx) ? countedIndices.length : countedIndices.length + 1;
    if (!countedIndices.includes(idx)) {
      const updated = [...countedIndices, idx];
      setCountedIndices(updated);

      if (settings.voiceNarration) {
        SpeechService.speak(`${updated.length}!`, { pitch: settings.speechPitch, rate: 1.0 });
      }

      // Check if all counted
      if (updated.length === currentItem.number) {
        soundEffects.playSuccess();
        soundEffects.playStarEarn();
        onEarnStar(1);
        onRecordActivity('numbers', String(currentItem.number), true);

        if (settings.voiceNarration) {
          setTimeout(() => {
            SpeechService.speak(`Super! All ${currentItem.number} counted! Great job!`);
          }, 400);
        }
      }
    }
  };

  // Initialize Feed Animal Game
  const initFeedGame = () => {
    const target = Math.floor(Math.random() * 8) + 2; // 2 to 9
    setFeedTarget(target);
    setFedCount(0);
    setBunnyMunching(false);

    if (settings.voiceNarration) {
      SpeechService.speak(`Feed the hungry bunny ${target} delicious carrots!`, {
        pitch: settings.speechPitch,
        rate: settings.speechRate,
      });
    }
  };

  useEffect(() => {
    if (subMode === 'feed-animal') {
      initFeedGame();
    }
  }, [subMode]);

  const handleFeedCarrot = () => {
    if (fedCount >= feedTarget) return;

    soundEffects.playClick();
    setBunnyMunching(true);
    const newFed = fedCount + 1;
    setFedCount(newFed);

    if (settings.voiceNarration) {
      SpeechService.speak(`${newFed}! Yum!`, { pitch: settings.speechPitch, rate: 1.05 });
    }

    setTimeout(() => {
      setBunnyMunching(false);
    }, 450);

    if (newFed === feedTarget) {
      soundEffects.playSuccess();
      soundEffects.playFanfare();
      onEarnStar(2);
      onRecordActivity('numbers', String(feedTarget), true);

      if (settings.voiceNarration) {
        setTimeout(() => {
          SpeechService.speak(`Burp! Thank you! Bunny is so happy!`);
        }, 500);
      }
      setTimeout(initFeedGame, 2200);
    }
  };

  // Initialize Balloon Pop Game
  const initBalloonPop = () => {
    const target = Math.floor(Math.random() * 10) + 1; // 1 to 10
    setTargetBalloonNumber(target);

    // 4 options including target
    const pool = Array.from({ length: 12 }, (_, i) => i + 1).filter(n => n !== target);
    pool.sort(() => 0.5 - Math.random());
    const distractors = pool.slice(0, 3);
    const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

    const items = [target, ...distractors]
      .sort(() => 0.5 - Math.random())
      .map((num, i) => ({
        id: Date.now() + i,
        number: num,
        color: colors[i % colors.length],
      }));

    setBalloonOptions(items);

    if (settings.voiceNarration) {
      SpeechService.speak(`Pop the balloon with number ${target}!`, {
        pitch: settings.speechPitch,
        rate: settings.speechRate,
      });
    }
  };

  useEffect(() => {
    if (subMode === 'balloon-pop') {
      initBalloonPop();
    }
  }, [subMode]);

  return (
    <div className="w-full max-w-5xl mx-auto px-3 py-2 space-y-4">
      {/* Sub-mode selector pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {[
          { id: 'cards', label: '🔢 Counting Cards', desc: 'Ginti Seekho' },
          { id: 'feed-animal', label: '🥕 Feed Bunny', desc: 'Khana Khilao' },
          { id: 'balloon-pop', label: '🎈 Number Balloon Pop', desc: 'Fodo Aur Jeeto' },
        ].map(mode => (
          <button
            key={mode.id}
            onClick={() => {
              soundEffects.playClick();
              setSubMode(mode.id as NumberSubMode);
            }}
            className={`px-3.5 py-2 rounded-2xl text-sm font-bold transition-all shadow-sm ${
              subMode === mode.id
                ? 'bg-amber-500 text-white shadow-md scale-105'
                : 'bg-white text-slate-700 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Mode 1: Counting Cards */}
      {subMode === 'cards' && (
        <div className="flex flex-col items-center">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-amber-200 flex flex-col items-center text-center">
            {/* Top header */}
            <div className="flex items-center justify-between w-full mb-3">
              <span className="text-xs sm:text-sm font-bold px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
                Number {currentItem.number} of 20
              </span>
              <button
                onClick={() => speakNumber(currentItem)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs sm:text-sm font-bold"
              >
                <Volume2 className="w-4 h-4 text-amber-700" />
                Listen
              </button>
            </div>

            {/* Giant Number badge */}
            <div
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl flex items-center justify-center text-7xl sm:text-8xl font-black text-white shadow-md mb-3 cursor-pointer hover:scale-105 transition-transform"
              style={{ backgroundColor: currentItem.color }}
              onClick={() => {
                soundEffects.playClick();
                speakNumber(currentItem);
              }}
            >
              {currentItem.number}
            </div>

            <div className="space-y-0.5 mb-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                {currentItem.word}
              </h2>
              <p className="text-base sm:text-lg font-bold text-amber-600">
                Hindi: {currentItem.hindiWord} ({currentItem.number} {currentItem.itemPlural})
              </p>
              <p className="text-xs text-slate-500">
                Tap each item below to count! ({countedIndices.length} / {currentItem.number})
              </p>
            </div>

            {/* Tap to Count Interactive Grid */}
            <div className="w-full bg-amber-50/70 rounded-2xl p-4 border border-amber-200 min-h-[120px] flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {Array.from({ length: currentItem.number }).map((_, idx) => {
                const isCounted = countedIndices.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => handleTapObject(idx)}
                    className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl transition-all shadow-sm active:scale-125 ${
                      isCounted
                        ? 'bg-amber-200 border-2 border-amber-400 scale-105 ring-2 ring-amber-300'
                        : 'bg-white hover:bg-amber-100 border-2 border-dashed border-amber-300'
                    }`}
                  >
                    <span>{currentItem.emoji}</span>
                    {isCounted && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shadow">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Navigation controls */}
            <div className="flex items-center justify-between w-full mt-6 gap-3">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setCurrentIndex(prev => (prev > 0 ? prev - 1 : NUMBERS_DATA.length - 1));
                }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-1 text-sm shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" /> Previous
              </button>
              <button
                onClick={() => {
                  soundEffects.playStarEarn();
                  onEarnStar(1);
                  onRecordActivity('numbers', String(currentItem.number), true);
                  setCurrentIndex(prev => (prev < NUMBERS_DATA.length - 1 ? prev + 1 : 0));
                }}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl flex items-center justify-center gap-1 text-sm shadow-md"
              >
                Next & Earn ⭐ <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Number Slider Bar 1-20 */}
          <div className="w-full max-w-3xl mt-4 bg-white/80 rounded-3xl p-3 border-2 border-amber-200 shadow-sm">
            <p className="text-xs font-bold text-center text-slate-500 mb-2">Select any number to explore:</p>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {NUMBERS_DATA.map((item, idx) => (
                <button
                  key={item.number}
                  onClick={() => {
                    soundEffects.playClick();
                    setCurrentIndex(idx);
                  }}
                  className={`h-9 rounded-xl font-bold text-sm transition-all ${
                    idx === currentIndex
                      ? 'bg-amber-500 text-white shadow-md scale-110'
                      : 'bg-amber-50 text-slate-700 hover:bg-amber-100'
                  }`}
                >
                  {item.number}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Feed the Hungry Bunny */}
      {subMode === 'feed-animal' && (
        <div className="w-full max-w-2xl mx-auto bg-gradient-to-b from-orange-100 via-amber-50 to-emerald-100 rounded-3xl p-6 shadow-xl border-4 border-amber-300 text-center flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-3 px-2">
            <div className="text-left">
              <span className="text-xs font-bold text-amber-700 uppercase">Mission:</span>
              <p className="text-lg font-black text-slate-800">
                Feed the Bunny <span className="text-rose-600 text-2xl">{feedTarget}</span> Carrots!
              </p>
            </div>
            <button
              onClick={initFeedGame}
              className="p-2 bg-white rounded-xl shadow-sm text-slate-600 hover:bg-slate-100"
              title="Reset Round"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Big Bunny Character */}
          <div className="relative my-4">
            <div
              className={`text-8xl sm:text-9xl transition-transform duration-200 ${
                bunnyMunching ? 'scale-120 rotate-6' : 'scale-100'
              }`}
            >
              {bunnyMunching ? '😋' : '🐰'}
            </div>
            {bunnyMunching && (
              <span className="absolute -top-3 -right-6 bg-amber-300 text-amber-900 font-extrabold text-xs px-2 py-1 rounded-full animate-bounce shadow">
                Nom Nom!
              </span>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="w-full max-w-md bg-white rounded-2xl p-3 shadow-sm border border-amber-200 mb-5">
            <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
              <span>Carrots Fed: {fedCount}</span>
              <span>Target: {feedTarget}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
              <div
                className="bg-orange-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${(fedCount / feedTarget) * 100}%` }}
              />
            </div>
          </div>

          {/* Feeding Action Plate */}
          <div className="flex flex-col items-center">
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mb-3">
              👇 Tap the carrot to feed the bunny!
            </p>
            <button
              disabled={fedCount >= feedTarget}
              onClick={handleFeedCarrot}
              className="group relative px-8 py-5 bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white rounded-3xl font-black text-xl shadow-lg border-b-4 border-orange-700 active:translate-y-1 active:border-b-0 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              <span className="text-4xl group-hover:scale-125 transition-transform">🥕</span>
              <span>Feed 1 Carrot</span>
            </button>
          </div>
        </div>
      )}

      {/* Mode 3: Balloon Pop Numbers */}
      {subMode === 'balloon-pop' && (
        <div className="w-full max-w-2xl mx-auto bg-gradient-to-b from-sky-100 to-blue-200 rounded-3xl p-6 shadow-xl border-4 border-blue-300 text-center min-h-[440px] flex flex-col justify-between">
          <div className="flex items-center justify-between bg-white/90 px-4 py-2 rounded-2xl shadow-sm">
            <div className="text-left">
              <span className="text-xs font-bold text-slate-500">Find & Pop:</span>
              <p className="text-2xl font-black text-blue-600">Number {targetBalloonNumber}</p>
            </div>
            <button
              onClick={initBalloonPop}
              className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 text-slate-600"
              title="New Round"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Balloon Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
            {balloonOptions.map(b => (
              <button
                key={b.id}
                onClick={() => {
                  if (b.number === targetBalloonNumber) {
                    soundEffects.playPop();
                    soundEffects.playSuccess();
                    onEarnStar(1);
                    onRecordActivity('numbers', String(b.number), true);
                    if (settings.voiceNarration) {
                      SpeechService.speak(`Yes! That is number ${b.number}! Excellent!`);
                    }
                    setTimeout(initBalloonPop, 900);
                  } else {
                    soundEffects.playGentleTryAgain();
                    onRecordActivity('numbers', String(b.number), false);
                    if (settings.voiceNarration) {
                      SpeechService.speak(`That is ${b.number}. Try to find ${targetBalloonNumber}!`);
                    }
                  }
                }}
                className="relative flex flex-col items-center justify-center p-4 rounded-3xl transition-transform active:scale-110 hover:-translate-y-2"
                style={{
                  backgroundColor: b.color,
                  boxShadow: 'inset 0 4px 6px rgba(255,255,255,0.4), 0 10px 20px rgba(0,0,0,0.15)',
                  minHeight: '140px',
                }}
              >
                <span className="text-5xl font-black text-white drop-shadow">
                  {b.number}
                </span>
                <span className="text-2xl mt-1 select-none">🎈</span>
              </button>
            ))}
          </div>

          <div className="bg-white/80 py-2 px-4 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700">
            Tap the balloon with number <strong className="text-blue-600 font-black text-base">{targetBalloonNumber}</strong>!
          </div>
        </div>
      )}
    </div>
  );
};
