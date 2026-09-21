import React, { useState, useEffect, useRef } from 'react';
import { ColorItem, ColorSubMode, ParentSettings } from '../types';
import { COLORS_DATA } from '../data/learningData';
import { soundEffects, SpeechService } from '../services/audioService';
import { Volume2, ChevronLeft, ChevronRight, RefreshCw, Eraser, Sparkles, Check } from 'lucide-react';

interface ColorZoneProps {
  settings: ParentSettings;
  onEarnStar: (count?: number) => void;
  onRecordActivity: (category: 'colors', itemId: string, correct: boolean) => void;
}

export const ColorZone: React.FC<ColorZoneProps> = ({
  settings,
  onEarnStar,
  onRecordActivity,
}) => {
  const [subMode, setSubMode] = useState<ColorSubMode>('cards');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Bucket sort game state
  const [bucketTargetItem, setBucketTargetItem] = useState<{ name: string; emoji: string; colorId: string } | null>(null);
  const [activeBucketIds, setActiveBucketIds] = useState<string[]>(['red', 'blue', 'yellow']);
  const [sortScore, setSortScore] = useState(0);

  // Paint pad state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [brushColor, setBrushColor] = useState('#EF4444');
  const [isDrawing, setIsDrawing] = useState(false);

  const currentColor = COLORS_DATA[currentIndex];

  const speakColor = (item: ColorItem = currentColor) => {
    if (!settings.voiceNarration) return;
    let text = `${item.name} color!`;
    if (settings.language === 'bilingual') {
      text = `${item.name} color! Hindi mein ise ${item.hindiName} kehte hain!`;
    } else if (settings.language === 'hindi') {
      text = `${item.hindiName} rang!`;
    }
    SpeechService.speak(text, {
      pitch: settings.speechPitch,
      rate: settings.speechRate,
    });
  };

  useEffect(() => {
    if (subMode === 'cards') {
      speakColor(currentColor);
    }
  }, [currentIndex, subMode]);

  // Init Bucket Sort Game
  const initBucketSort = () => {
    // Pick 3 random distinct colors
    const shuffled = [...COLORS_DATA].sort(() => 0.5 - Math.random());
    const chosenColors = shuffled.slice(0, 3);
    const chosenIds = chosenColors.map(c => c.id);
    setActiveBucketIds(chosenIds);

    // Pick a random item from one of these 3 colors
    const targetColor = chosenColors[Math.floor(Math.random() * chosenColors.length)];
    const randomItem = targetColor.items[Math.floor(Math.random() * targetColor.items.length)];

    setBucketTargetItem({
      name: randomItem.name,
      emoji: randomItem.emoji,
      colorId: targetColor.id,
    });

    if (settings.voiceNarration) {
      SpeechService.speak(`Which bucket does the ${randomItem.name} belong to?`, {
        pitch: settings.speechPitch,
        rate: settings.speechRate,
      });
    }
  };

  useEffect(() => {
    if (subMode === 'bucket-sort') {
      initBucketSort();
    }
  }, [subMode]);

  // Paint Pad Canvas
  useEffect(() => {
    if (subMode === 'coloring' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw a cute friendly flower outline template
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 6;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        // Center circle
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2 - 20, 45, 0, Math.PI * 2);
        ctx.stroke();

        // 5 Petals
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5;
          const px = canvas.width / 2 + Math.cos(angle) * 75;
          const py = canvas.height / 2 - 20 + Math.sin(angle) * 75;
          ctx.beginPath();
          ctx.arc(px, py, 35, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Stem
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2 + 55);
        ctx.lineTo(canvas.width / 2, canvas.height / 2 + 130);
        ctx.stroke();
      }
    }
  }, [subMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown' && e.type !== 'touchstart') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = brushColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearPaintCanvas = () => {
    soundEffects.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 py-2 space-y-4">
      {/* Sub-mode selector pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {[
          { id: 'cards', label: '🎨 Color World', desc: 'Rang Pehchano' },
          { id: 'bucket-sort', label: '🪣 Bucket Match', desc: 'Khel' },
          { id: 'coloring', label: '🖌️ Magic Color Pad', desc: 'Rang Bharo' },
        ].map(mode => (
          <button
            key={mode.id}
            onClick={() => {
              soundEffects.playClick();
              setSubMode(mode.id as ColorSubMode);
            }}
            className={`px-3.5 py-2 rounded-2xl text-sm font-bold transition-all shadow-sm ${
              subMode === mode.id
                ? 'bg-teal-500 text-white shadow-md scale-105'
                : 'bg-white text-slate-700 hover:bg-teal-50 border border-teal-200'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Mode 1: Color Cards */}
      {subMode === 'cards' && (
        <div className="flex flex-col items-center">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-teal-200 flex flex-col items-center text-center">
            <div className="flex items-center justify-between w-full mb-3">
              <span className="text-xs sm:text-sm font-bold px-3 py-1 bg-teal-100 text-teal-800 rounded-full">
                Color {currentIndex + 1} of 10
              </span>
              <button
                onClick={() => speakColor(currentColor)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-teal-100 hover:bg-teal-200 text-teal-900 text-xs sm:text-sm font-bold"
              >
                <Volume2 className="w-4 h-4 text-teal-700" />
                Listen
              </button>
            </div>

            {/* Color Swatch Circle */}
            <div
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full shadow-lg mb-4 flex items-center justify-center border-4 border-white transform hover:scale-105 transition-transform cursor-pointer"
              style={{
                backgroundColor: currentColor.hex,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15), inset 0 2px 6px rgba(255,255,255,0.4)',
              }}
              onClick={() => {
                soundEffects.playClick();
                speakColor(currentColor);
              }}
            >
              <Sparkles className="w-10 h-10 text-white/90 drop-shadow" />
            </div>

            <h2 className="text-3xl font-extrabold text-slate-800 mb-0.5">
              {currentColor.name}
            </h2>
            <p className="text-lg font-bold text-teal-600 mb-4">
              Hindi: {currentColor.hindiName} Rang
            </p>

            {/* Things that are this color */}
            <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <p className="text-xs font-bold text-slate-500 mb-2 uppercase">Things that are {currentColor.name}:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {currentColor.items.map(item => (
                  <button
                    key={item.name}
                    onClick={() => {
                      soundEffects.playClick();
                      if (settings.voiceNarration) {
                        SpeechService.speak(`${item.name}! ${item.hindiName}!`);
                      }
                    }}
                    className="p-2.5 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 flex flex-col items-center gap-1 transition-transform active:scale-95 shadow-sm"
                  >
                    <span className="text-3xl">{item.emoji}</span>
                    <span className="text-xs font-bold text-slate-700">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between w-full mt-6 gap-3">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setCurrentIndex(prev => (prev > 0 ? prev - 1 : COLORS_DATA.length - 1));
                }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-1 text-sm shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" /> Previous
              </button>
              <button
                onClick={() => {
                  soundEffects.playStarEarn();
                  onEarnStar(1);
                  onRecordActivity('colors', currentColor.id, true);
                  setCurrentIndex(prev => (prev < COLORS_DATA.length - 1 ? prev + 1 : 0));
                }}
                className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-2xl flex items-center justify-center gap-1 text-sm shadow-md"
              >
                Next & Earn ⭐ <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Color Bucket Match Game */}
      {subMode === 'bucket-sort' && bucketTargetItem && (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl p-6 shadow-xl border-4 border-teal-300 text-center">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500">Color Sort Challenge</span>
            <span className="text-xs font-bold text-amber-600">Streak Score: {sortScore}</span>
            <button
              onClick={initBucketSort}
              className="p-1.5 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200"
              title="New Item"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Item to Sort */}
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 inline-flex flex-col items-center mb-6">
            <span className="text-6xl sm:text-7xl animate-bounce mb-1">
              {bucketTargetItem.emoji}
            </span>
            <span className="text-lg font-extrabold text-slate-800">
              {bucketTargetItem.name}
            </span>
            <p className="text-xs text-slate-500 mt-0.5">Which bucket does this go into?</p>
          </div>

          {/* Buckets */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-2">
            {activeBucketIds.map(colorId => {
              const colorObj = COLORS_DATA.find(c => c.id === colorId)!;
              return (
                <button
                  key={colorId}
                  onClick={() => {
                    if (colorId === bucketTargetItem.colorId) {
                      soundEffects.playSuccess();
                      soundEffects.playStarEarn();
                      setSortScore(prev => prev + 1);
                      onEarnStar(1);
                      onRecordActivity('colors', colorId, true);

                      if (settings.voiceNarration) {
                        SpeechService.speak(`Correct! ${bucketTargetItem.name} goes in the ${colorObj.name} bucket!`);
                      }
                      setTimeout(initBucketSort, 900);
                    } else {
                      soundEffects.playGentleTryAgain();
                      onRecordActivity('colors', colorId, false);
                      if (settings.voiceNarration) {
                        SpeechService.speak(`Not quite. Try another colored bucket!`);
                      }
                    }
                  }}
                  className="flex flex-col items-center p-4 rounded-3xl transition-transform active:scale-95 hover:-translate-y-1 shadow-md"
                  style={{
                    backgroundColor: colorObj.hex,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
                  }}
                >
                  <span className="text-4xl mb-1">🪣</span>
                  <span className="text-sm sm:text-base font-extrabold text-white drop-shadow">
                    {colorObj.name}
                  </span>
                  <span className="text-[11px] font-bold text-white/90">
                    {colorObj.hindiName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 3: Magic Paint Pad */}
      {subMode === 'coloring' && (
        <div className="w-full max-w-lg mx-auto bg-white rounded-3xl p-5 shadow-xl border-4 border-teal-200 flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-xs sm:text-sm font-bold text-slate-700">Paint Palette:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {['#EF4444', '#3B82F6', '#10B981', '#FBBF24', '#F97316', '#A855F7', '#EC4899', '#854D0E'].map(hex => (
                <button
                  key={hex}
                  onClick={() => {
                    soundEffects.playClick();
                    setBrushColor(hex);
                  }}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    brushColor === hex ? 'scale-125 border-slate-800 ring-2 ring-teal-200' : 'border-white'
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>

          <div className="relative border-4 border-teal-300 rounded-3xl overflow-hidden shadow-inner bg-white">
            <canvas
              ref={canvasRef}
              width={360}
              height={360}
              className="touch-none cursor-crosshair block"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>

          <div className="flex items-center justify-between w-full mt-4 gap-2">
            <button
              onClick={clearPaintCanvas}
              className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-1 text-xs sm:text-sm"
            >
              <Eraser className="w-4 h-4" /> Clear
            </button>
            <button
              onClick={() => {
                soundEffects.playSuccess();
                soundEffects.playFanfare();
                onEarnStar(1);
                onRecordActivity('colors', 'coloring_mastery', true);
                if (settings.voiceNarration) {
                  SpeechService.speak(`What a beautiful painting! Shabaash!`);
                }
              }}
              className="flex-1 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl flex items-center justify-center gap-1 text-xs sm:text-sm shadow-md"
            >
              <Check className="w-4 h-4" /> Save Art! ⭐
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
