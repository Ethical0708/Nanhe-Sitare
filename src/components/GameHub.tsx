import React, { useState, useEffect } from 'react';
import { ParentSettings } from '../types';
import { soundEffects, SpeechService } from '../services/audioService';
import { Sparkles, RefreshCw, Trophy, Clock } from 'lucide-react';

interface GameHubProps {
  settings: ParentSettings;
  onEarnStar: (count?: number) => void;
  onRecordActivity: (category: 'games', itemId: string, correct: boolean) => void;
}

interface MemoryCard {
  id: number;
  emoji: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const GameHub: React.FC<GameHubProps> = ({
  settings,
  onEarnStar,
  onRecordActivity,
}) => {
  const [activeTab, setActiveTab] = useState<'memory' | 'frenzy'>('memory');

  // Memory Game State
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [flippedCardIds, setFlippedCardIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isMemoryWon, setIsMemoryWon] = useState(false);

  // Frenzy Game State
  const [frenzyPlaying, setFrenzyPlaying] = useState(false);
  const [frenzyTimeLeft, setFrenzyTimeLeft] = useState(25);
  const [frenzyScore, setFrenzyScore] = useState(0);
  const [frenzyBalloons, setFrenzyBalloons] = useState<{ id: number; emoji: string; x: number; y: number; isGold?: boolean }[]>([]);

  // Init Memory Game
  const initMemoryGame = () => {
    const symbols = [
      { emoji: '🦁', name: 'Lion' },
      { emoji: '🍎', name: 'Apple' },
      { emoji: '🐶', name: 'Puppy' },
      { emoji: '⭐', name: 'Star' },
      { emoji: '🐘', name: 'Elephant' },
      { emoji: '🍓', name: 'Strawberry' },
    ];
    // Duplicate for pairs
    const deck = [...symbols, ...symbols]
      .sort(() => 0.5 - Math.random())
      .map((item, idx) => ({
        id: idx,
        emoji: item.emoji,
        name: item.name,
        isFlipped: false,
        isMatched: false,
      }));

    setMemoryCards(deck);
    setFlippedCardIds([]);
    setMoves(0);
    setIsMemoryWon(false);

    if (settings.voiceNarration) {
      SpeechService.speak('Find matching pairs! Match the cards!');
    }
  };

  useEffect(() => {
    if (activeTab === 'memory') {
      initMemoryGame();
    }
  }, [activeTab]);

  // Memory card click handler
  const handleCardClick = (cardId: number) => {
    if (flippedCardIds.length >= 2) return;
    const card = memoryCards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    soundEffects.playClick();
    const newCards = memoryCards.map(c => (c.id === cardId ? { ...c, isFlipped: true } : c));
    setMemoryCards(newCards);

    const newFlipped = [...flippedCardIds, cardId];
    setFlippedCardIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = newCards.find(c => c.id === firstId)!;
      const secondCard = newCards.find(c => c.id === secondId)!;

      if (firstCard.emoji === secondCard.emoji) {
        // Matched!
        soundEffects.playSuccess();
        soundEffects.playPop();
        setTimeout(() => {
          setMemoryCards(prev =>
            prev.map(c => (c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c))
          );
          setFlippedCardIds([]);

          // Check if game won
          const remainingUnmatched = newCards.filter(c => !c.isMatched && c.id !== firstId && c.id !== secondId);
          if (remainingUnmatched.length === 0) {
            setIsMemoryWon(true);
            soundEffects.playFanfare();
            onEarnStar(3);
            onRecordActivity('games', 'memory_match', true);
            if (settings.voiceNarration) {
              SpeechService.speak('Hooray! You matched all the cards! Super memory!');
            }
          }
        }, 400);
      } else {
        // Not matched
        soundEffects.playGentleTryAgain();
        setTimeout(() => {
          setMemoryCards(prev =>
            prev.map(c => (c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c))
          );
          setFlippedCardIds([]);
        }, 900);
      }
    }
  };

  // Frenzy Balloon Timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (frenzyPlaying && frenzyTimeLeft > 0) {
      timer = setInterval(() => {
        setFrenzyTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (frenzyTimeLeft === 0 && frenzyPlaying) {
      setFrenzyPlaying(false);
      soundEffects.playFanfare();
      const stars = Math.min(5, Math.floor(frenzyScore / 5) + 1);
      onEarnStar(stars);
      onRecordActivity('games', 'frenzy_pop', true);
      if (settings.voiceNarration) {
        SpeechService.speak(`Time up! You popped ${frenzyScore} balloons and won ${stars} stars!`);
      }
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [frenzyPlaying, frenzyTimeLeft]);

  // Frenzy Balloon Generator
  useEffect(() => {
    let spawnTimer: NodeJS.Timeout | null = null;
    if (frenzyPlaying) {
      spawnTimer = setInterval(() => {
        setFrenzyBalloons(prev => {
          const isGold = Math.random() < 0.2;
          const newBalloon = {
            id: Date.now() + Math.random(),
            emoji: isGold ? '⭐' : ['🎈', '🫧', '🍒', '🍭'][Math.floor(Math.random() * 4)],
            x: 10 + Math.random() * 75,
            y: 10 + Math.random() * 70,
            isGold,
          };
          // Keep max 7 balloons on screen
          const trimmed = prev.slice(-5);
          return [...trimmed, newBalloon];
        });
      }, 750);
    }
    return () => {
      if (spawnTimer) clearInterval(spawnTimer);
    };
  }, [frenzyPlaying]);

  const startFrenzy = () => {
    soundEffects.playSuccess();
    setFrenzyScore(0);
    setFrenzyTimeLeft(25);
    setFrenzyBalloons([]);
    setFrenzyPlaying(true);
    if (settings.voiceNarration) {
      SpeechService.speak('Ready, steady, go! Pop as many as you can!');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 py-2 space-y-4">
      {/* Game Mode Select */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => {
            soundEffects.playClick();
            setActiveTab('memory');
          }}
          className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all shadow-sm ${
            activeTab === 'memory'
              ? 'bg-indigo-600 text-white shadow-md scale-105'
              : 'bg-white text-slate-700 hover:bg-indigo-50 border border-indigo-200'
          }`}
        >
          🃏 Memory Match Cards
        </button>
        <button
          onClick={() => {
            soundEffects.playClick();
            setActiveTab('frenzy');
          }}
          className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all shadow-sm ${
            activeTab === 'frenzy'
              ? 'bg-rose-500 text-white shadow-md scale-105'
              : 'bg-white text-slate-700 hover:bg-rose-50 border border-rose-200'
          }`}
        >
          🎈 Pop Frenzy (30s)
        </button>
      </div>

      {/* Memory Match Game */}
      {activeTab === 'memory' && (
        <div className="w-full max-w-xl mx-auto bg-white rounded-3xl p-6 shadow-xl border-4 border-indigo-200 text-center">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500">Moves: {moves}</span>
            {isMemoryWon ? (
              <span className="text-sm font-extrabold text-emerald-600 flex items-center gap-1">
                <Trophy className="w-4 h-4" /> You Won! ⭐⭐⭐
              </span>
            ) : (
              <span className="text-xs font-bold text-indigo-600">Find 6 Matching Pairs</span>
            )}
            <button
              onClick={initMemoryGame}
              className="p-1.5 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200"
              title="Restart Game"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
            {memoryCards.map(card => {
              const isVisible = card.isFlipped || card.isMatched;
              return (
                <button
                  key={card.id}
                  disabled={card.isMatched}
                  onClick={() => handleCardClick(card.id)}
                  className={`h-24 sm:h-28 rounded-2xl text-3xl sm:text-4xl font-bold flex items-center justify-center transition-all duration-300 shadow-md ${
                    card.isMatched
                      ? 'bg-emerald-100 border-2 border-emerald-400 scale-95 opacity-80'
                      : isVisible
                      ? 'bg-amber-100 border-2 border-amber-300 transform rotate-y-180'
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:scale-105 border-2 border-indigo-400'
                  }`}
                >
                  {isVisible ? card.emoji : '❓'}
                </button>
              );
            })}
          </div>

          {isMemoryWon && (
            <div className="mt-5 p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 font-bold text-sm">
              🎉 Shabaash! Outstanding Memory! You earned 3 Stars!
            </div>
          )}
        </div>
      )}

      {/* Pop Frenzy Arcade Game */}
      {activeTab === 'frenzy' && (
        <div className="w-full max-w-2xl mx-auto bg-gradient-to-b from-rose-100 via-sky-100 to-amber-100 rounded-3xl p-6 shadow-xl border-4 border-rose-300 relative min-h-[460px] flex flex-col justify-between overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between bg-white/90 px-4 py-2.5 rounded-2xl shadow-sm z-10">
            <div className="flex items-center gap-1.5 font-black text-rose-600">
              <Clock className="w-4 h-4" />
              <span>Time: {frenzyTimeLeft}s</span>
            </div>
            <div className="flex items-center gap-1.5 font-black text-amber-600">
              <Sparkles className="w-4 h-4" />
              <span>Popped: {frenzyScore}</span>
            </div>
          </div>

          {/* Playground Canvas Area */}
          <div className="relative w-full h-80 my-2">
            {!frenzyPlaying ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/85 rounded-3xl p-6 text-center z-20">
                <span className="text-6xl mb-2">🎈</span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-1">
                  Speed Pop Frenzy!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-4 max-w-xs">
                  Pop as many balloons & bonus stars as you can in 25 seconds!
                </p>
                <button
                  onClick={startFrenzy}
                  className="px-6 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-black text-lg rounded-2xl shadow-lg border-b-4 border-rose-700 active:translate-y-1 active:border-b-0 transition-all"
                >
                  🚀 Start Game!
                </button>
              </div>
            ) : (
              frenzyBalloons.map(b => (
                <button
                  key={b.id}
                  onClick={() => {
                    soundEffects.playPop();
                    setFrenzyScore(prev => prev + (b.isGold ? 3 : 1));
                    setFrenzyBalloons(prev => prev.filter(item => item.id !== b.id));
                  }}
                  className={`absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-3xl sm:text-4xl shadow-md transition-transform active:scale-150 animate-bounce ${
                    b.isGold ? 'bg-amber-300 ring-4 ring-amber-400' : 'bg-white/80'
                  }`}
                  style={{
                    left: `${b.x}%`,
                    top: `${b.y}%`,
                  }}
                >
                  {b.emoji}
                </button>
              ))
            )}
          </div>

          <div className="bg-white/80 py-2 px-4 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 text-center z-10">
            {frenzyPlaying ? '👆 Tap tap tap as fast as you can!' : 'Press Start to play!'}
          </div>
        </div>
      )}
    </div>
  );
};
