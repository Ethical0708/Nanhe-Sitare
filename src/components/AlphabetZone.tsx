import React, { useState, useEffect, useRef } from 'react';
import { AlphabetItem, AlphabetSubMode, ParentSettings } from '../types';
import { ALPHABETS_DATA } from '../data/learningData';
import { soundEffects, SpeechService } from '../services/audioService';
import { Volume2, ChevronLeft, ChevronRight, Sparkles, RefreshCw, Eraser, Check } from 'lucide-react';

interface AlphabetZoneProps {
  settings: ParentSettings;
  onEarnStar: (count?: number) => void;
  onRecordActivity: (category: 'alphabets', itemId: string, correct: boolean) => void;
}

export const AlphabetZone: React.FC<AlphabetZoneProps> = ({
  settings,
  onEarnStar,
  onRecordActivity,
}) => {
  const [subMode, setSubMode] = useState<AlphabetSubMode>('cards');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Bubble pop game state
  const [bubbleTarget, setBubbleTarget] = useState<AlphabetItem>(ALPHABETS_DATA[0]);
  const [bubbles, setBubbles] = useState<{ id: number; letter: string; x: number; y: number; speed: number; color: string }[]>([]);
  const [bubbleScore, setBubbleScore] = useState(0);

  // Letter match game state
  const [matchSelectedLetter, setMatchSelectedLetter] = useState<string | null>(null);
  const [matchSolved, setMatchSolved] = useState<string[]>([]);
  const [matchPairs, setMatchPairs] = useState<AlphabetItem[]>([]);

  // Canvas trace state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#EF4444');

  const currentItem = ALPHABETS_DATA[currentIndex];

  // Speech Helper
  const speakCurrent = (item: AlphabetItem = currentItem) => {
    if (!settings.voiceNarration) return;
    let text = `${item.letter} for ${item.word}!`;
    if (settings.language === 'bilingual') {
      text = `${item.letter} for ${item.word}! ${item.hindiWord}!`;
    } else if (settings.language === 'hindi') {
      text = `${item.letter} se ${item.hindiWord}!`;
    }
    SpeechService.speak(text, {
      pitch: settings.speechPitch,
      rate: settings.speechRate,
    });
  };

  // Auto speak on card change
  useEffect(() => {
    if (subMode === 'cards') {
      speakCurrent(currentItem);
    }
  }, [currentIndex, subMode]);

  // Setup Bubble Pop Game
  const initBubblePop = () => {
    const randomTarget = ALPHABETS_DATA[Math.floor(Math.random() * ALPHABETS_DATA.length)];
    setBubbleTarget(randomTarget);
    
    // Pick target + 4 random distractor letters
    const otherLetters = ALPHABETS_DATA.filter(a => a.letter !== randomTarget.letter)
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
    
    const combined = [randomTarget, ...otherLetters].sort(() => 0.5 - Math.random());
    const newBubbles = combined.map((item, idx) => ({
      id: Date.now() + idx,
      letter: item.letter,
      x: 15 + (idx % 3) * 30 + Math.random() * 8,
      y: 20 + Math.floor(idx / 3) * 35 + Math.random() * 8,
      speed: 1 + Math.random() * 1.5,
      color: item.color,
    }));
    setBubbles(newBubbles);

    if (settings.voiceNarration) {
      SpeechService.speak(`Find and pop letter ${randomTarget.letter}!`, {
        pitch: settings.speechPitch,
        rate: settings.speechRate,
      });
    }
  };

  useEffect(() => {
    if (subMode === 'bubble-pop') {
      initBubblePop();
    }
  }, [subMode]);

  // Setup Match Game
  const initMatchGame = () => {
    const selected = [...ALPHABETS_DATA].sort(() => 0.5 - Math.random()).slice(0, 4);
    setMatchPairs(selected);
    setMatchSolved([]);
    setMatchSelectedLetter(null);
    if (settings.voiceNarration) {
      SpeechService.speak('Match the letter with the correct picture!', {
        pitch: settings.speechPitch,
        rate: settings.speechRate,
      });
    }
  };

  useEffect(() => {
    if (subMode === 'match') {
      initMatchGame();
    }
  }, [subMode]);

  // Setup Tracing Canvas
  useEffect(() => {
    if (subMode === 'trace' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw dotted guide letter
        ctx.font = 'bold 220px Fredoka, sans-serif';
        ctx.fillStyle = '#E2E8F0';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(currentItem.letter, canvas.width / 2, canvas.height / 2);
      }
    }
  }, [subMode, currentIndex]);

  // Drawing handlers
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

    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = brushColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    soundEffects.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 220px Fredoka, sans-serif';
      ctx.fillStyle = '#E2E8F0';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(currentItem.letter, canvas.width / 2, canvas.height / 2);
      ctx.beginPath();
    }
  };

  const handleFinishTrace = () => {
    soundEffects.playSuccess();
    onEarnStar(1);
    onRecordActivity('alphabets', currentItem.letter, true);
    if (settings.voiceNarration) {
      SpeechService.speak(`Awesome tracing! Great job on letter ${currentItem.letter}!`);
    }
    // Next letter
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % ALPHABETS_DATA.length);
    }, 1200);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 py-2 space-y-4">
      {/* Sub Mode Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {[
          { id: 'cards', label: '📇 Flashcards', desc: 'Seekho' },
          { id: 'bubble-pop', label: '🫧 Bubble Pop', desc: 'Khel' },
          { id: 'match', label: '🧩 Match Pairs', desc: 'Jodi Milao' },
          { id: 'trace', label: '✏️ Trace & Draw', desc: 'Likhna Seekho' },
        ].map(mode => (
          <button
            key={mode.id}
            onClick={() => {
              soundEffects.playClick();
              setSubMode(mode.id as AlphabetSubMode);
            }}
            className={`px-3.5 py-2 rounded-2xl text-sm font-bold transition-all shadow-sm ${
              subMode === mode.id
                ? 'bg-rose-500 text-white shadow-md scale-105'
                : 'bg-white text-slate-700 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Mode 1: Interactive Flashcards */}
      {subMode === 'cards' && (
        <div className="flex flex-col items-center">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-rose-200 flex flex-col items-center text-center relative overflow-hidden">
            {/* Top Badge */}
            <div className="flex items-center justify-between w-full mb-3">
              <span className="text-xs sm:text-sm font-bold px-3 py-1 bg-rose-100 text-rose-700 rounded-full">
                Letter {currentIndex + 1} of 26
              </span>
              <button
                onClick={() => speakCurrent(currentItem)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs sm:text-sm font-bold transition-transform active:scale-95"
                title="Speak Letter"
              >
                <Volume2 className="w-4 h-4 text-amber-600" />
                Listen
              </button>
            </div>

            {/* Huge Letter Display */}
            <div
              className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl flex items-center justify-center text-8xl sm:text-9xl font-black text-white shadow-inner mb-4 transform hover:scale-105 transition-transform cursor-pointer"
              style={{ backgroundColor: currentItem.color }}
              onClick={() => {
                soundEffects.playClick();
                speakCurrent(currentItem);
              }}
            >
              {currentItem.letter}
            </div>

            {/* Phonics & Words */}
            <div className="space-y-1 mb-4">
              <div className="text-4xl sm:text-5xl">{currentItem.emoji}</div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                {currentItem.word}
              </h2>
              <p className="text-base sm:text-lg font-bold text-rose-600">
                {currentItem.hindiWord} ({currentItem.letter} se {currentItem.hindiWord})
              </p>
              <p className="text-xs sm:text-sm text-slate-500 italic">
                Phonics sound: &ldquo;{currentItem.phonics}&rdquo;
              </p>
            </div>

            {/* Fun Fact */}
            <div className="w-full bg-amber-50 rounded-2xl p-3 border border-amber-200 text-xs sm:text-sm text-amber-900 font-medium">
              💡 {currentItem.funFact}
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center justify-between w-full mt-6 gap-3">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setCurrentIndex((prev) => (prev > 0 ? prev - 1 : ALPHABETS_DATA.length - 1));
                }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-1 text-sm shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" /> Previous
              </button>
              <button
                onClick={() => {
                  soundEffects.playStarEarn();
                  onEarnStar(1);
                  onRecordActivity('alphabets', currentItem.letter, true);
                  setCurrentIndex((prev) => (prev < ALPHABETS_DATA.length - 1 ? prev + 1 : 0));
                }}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold rounded-2xl flex items-center justify-center gap-1 text-sm shadow-md"
              >
                Next & Earn ⭐ <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Letter Drawer */}
          <div className="w-full max-w-3xl mt-4 bg-white/80 rounded-3xl p-3 border-2 border-rose-200 shadow-sm">
            <p className="text-xs font-bold text-center text-slate-500 mb-2">Tap any letter to explore:</p>
            <div className="grid grid-cols-7 sm:grid-cols-13 gap-1.5">
              {ALPHABETS_DATA.map((item, idx) => (
                <button
                  key={item.letter}
                  onClick={() => {
                    soundEffects.playClick();
                    setCurrentIndex(idx);
                  }}
                  className={`h-9 rounded-xl font-bold text-sm transition-all ${
                    idx === currentIndex
                      ? 'bg-rose-500 text-white shadow-md scale-110'
                      : 'bg-rose-50 text-slate-700 hover:bg-rose-100'
                  }`}
                >
                  {item.letter}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Bubble Pop Game */}
      {subMode === 'bubble-pop' && (
        <div className="w-full max-w-2xl mx-auto bg-gradient-to-b from-sky-200 via-indigo-100 to-sky-300 rounded-3xl p-6 shadow-xl border-4 border-sky-300 relative min-h-[460px] flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-sm z-10">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-700">Find Letter:</span>
              <span className="w-9 h-9 rounded-xl bg-rose-500 text-white font-black text-xl flex items-center justify-center shadow">
                {bubbleTarget.letter}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-600 font-bold text-sm">
              <span>Score: {bubbleScore}</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <button
              onClick={initBubblePop}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
              title="Next Round"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Floating Bubbles Canvas Area */}
          <div className="relative w-full h-80 my-2">
            {bubbles.map(b => (
              <button
                key={b.id}
                onClick={() => {
                  if (b.letter === bubbleTarget.letter) {
                    soundEffects.playPop();
                    soundEffects.playSuccess();
                    setBubbleScore(prev => prev + 1);
                    onEarnStar(1);
                    onRecordActivity('alphabets', b.letter, true);
                    // Remove popped bubble
                    setBubbles(prev => prev.filter(item => item.id !== b.id));
                    if (settings.voiceNarration) {
                      SpeechService.speak(`Super! You found letter ${b.letter}!`);
                    }
                    setTimeout(initBubblePop, 900);
                  } else {
                    soundEffects.playGentleTryAgain();
                    onRecordActivity('alphabets', b.letter, false);
                    if (settings.voiceNarration) {
                      SpeechService.speak(`That's ${b.letter}. Try to find ${bubbleTarget.letter}!`);
                    }
                  }
                }}
                className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-black text-white shadow-lg transition-transform active:scale-125 animate-bounce"
                style={{
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  backgroundColor: b.color,
                  animationDuration: `${2.5 + (b.id % 3)}s`,
                  boxShadow: 'inset 0 4px 6px rgba(255,255,255,0.6), 0 8px 15px rgba(0,0,0,0.15)',
                }}
              >
                {b.letter}
              </button>
            ))}
          </div>

          <div className="text-center z-10 bg-white/80 py-2 px-4 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700">
            👆 Tap the bubble with letter <strong className="text-rose-600 font-extrabold text-base">{bubbleTarget.letter}</strong>!
          </div>
        </div>
      )}

      {/* Mode 3: Match Game */}
      {subMode === 'match' && (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl p-6 shadow-xl border-4 border-amber-200">
          <div className="text-center mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-slate-800">
              Match the Letters with Pictures!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Tap a letter on the left, then tap its matching object on the right!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Letters Column */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-center">Letters</span>
              {matchPairs.map(item => {
                const isMatched = matchSolved.includes(item.letter);
                const isSelected = matchSelectedLetter === item.letter;
                return (
                  <button
                    key={item.letter}
                    disabled={isMatched}
                    onClick={() => {
                      soundEffects.playClick();
                      setMatchSelectedLetter(item.letter);
                      if (settings.voiceNarration) {
                        SpeechService.speak(`Letter ${item.letter}`);
                      }
                    }}
                    className={`w-full py-4 rounded-2xl text-2xl sm:text-3xl font-black transition-all flex items-center justify-center shadow-sm ${
                      isMatched
                        ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-300 opacity-60'
                        : isSelected
                        ? 'bg-rose-500 text-white ring-4 ring-rose-200 scale-102'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-2 border-rose-200'
                    }`}
                  >
                    {item.letter}
                    {isMatched && <Check className="w-5 h-5 ml-2" />}
                  </button>
                );
              })}
            </div>

            {/* Objects Column (Shuffled) */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-center">Objects</span>
              {[...matchPairs]
                .reverse()
                .map(item => {
                  const isMatched = matchSolved.includes(item.letter);
                  return (
                    <button
                      key={item.word}
                      disabled={isMatched}
                      onClick={() => {
                        if (!matchSelectedLetter) {
                          if (settings.voiceNarration) {
                            SpeechService.speak('First select a letter on the left!');
                          }
                          return;
                        }

                        if (matchSelectedLetter === item.letter) {
                          soundEffects.playSuccess();
                          soundEffects.playStarEarn();
                          const newSolved = [...matchSolved, item.letter];
                          setMatchSolved(newSolved);
                          setMatchSelectedLetter(null);
                          onEarnStar(1);
                          onRecordActivity('alphabets', item.letter, true);

                          if (settings.voiceNarration) {
                            SpeechService.speak(`Match! ${item.letter} for ${item.word}! Great job!`);
                          }

                          if (newSolved.length === matchPairs.length) {
                            soundEffects.playFanfare();
                            onEarnStar(2); // bonus
                            setTimeout(initMatchGame, 1800);
                          }
                        } else {
                          soundEffects.playGentleTryAgain();
                          onRecordActivity('alphabets', matchSelectedLetter, false);
                          if (settings.voiceNarration) {
                            SpeechService.speak('Oops! Try matching again.');
                          }
                        }
                      }}
                      className={`w-full py-3 sm:py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                        isMatched
                          ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300 opacity-60'
                          : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border-2 border-amber-200'
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl">{item.emoji}</span>
                      <span className="text-sm sm:text-base">{item.word}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={initMatchGame}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" /> New Puzzle
            </button>
          </div>
        </div>
      )}

      {/* Mode 4: Letter Tracing / Magic Draw */}
      {subMode === 'trace' && (
        <div className="w-full max-w-lg mx-auto bg-white rounded-3xl p-5 shadow-xl border-4 border-indigo-200 flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-700">Trace:</span>
              <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center">
                {currentItem.letter}
              </span>
            </div>
            {/* Color Palette */}
            <div className="flex items-center gap-1.5">
              {['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'].map(col => (
                <button
                  key={col}
                  onClick={() => {
                    soundEffects.playClick();
                    setBrushColor(col);
                  }}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    brushColor === col ? 'scale-125 border-slate-800 ring-2 ring-indigo-200' : 'border-white'
                  }`}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>
          </div>

          {/* Interactive Canvas */}
          <div className="relative border-4 border-dashed border-indigo-300 rounded-3xl overflow-hidden shadow-inner bg-white">
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

          {/* Action buttons */}
          <div className="flex items-center justify-between w-full mt-4 gap-2">
            <button
              onClick={clearCanvas}
              className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-1.5 text-xs sm:text-sm"
            >
              <Eraser className="w-4 h-4" /> Clear
            </button>
            <button
              onClick={() => speakCurrent(currentItem)}
              className="p-2.5 bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-800 rounded-2xl"
              title="Pronounce Letter"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleFinishTrace}
              className="flex-1 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold rounded-2xl flex items-center justify-center gap-1.5 text-xs sm:text-sm shadow-md"
            >
              <Check className="w-4 h-4" /> Done! ⭐
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
