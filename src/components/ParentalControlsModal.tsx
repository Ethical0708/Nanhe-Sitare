import React, { useState, useId } from 'react';
import { LearningProgress, ParentSettings, LanguageMode } from '../types';
import { soundEffects, SpeechService } from '../services/audioService';
import {
  Shield,
  X,
  Clock,
  Award,
  BookOpen,
  Volume2,
  Lock,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface ParentalControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: LearningProgress;
  settings: ParentSettings;
  onUpdateSettings: (newSettings: ParentSettings) => void;
  onResetProgress: () => void;
}

export const ParentalControlsModal: React.FC<ParentalControlsModalProps> = ({
  isOpen,
  onClose,
  progress,
  settings,
  onUpdateSettings,
  onResetProgress,
}) => {
  // Authentication Gate State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [gateQuestion, setGateQuestion] = useState(() => {
    const n1 = Math.floor(Math.random() * 5) + 4; // 4 to 8
    const n2 = Math.floor(Math.random() * 5) + 3; // 3 to 7
    return { n1, n2, ans: n1 + n2 };
  });
  const [userAnswer, setUserAnswer] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [gateError, setGateError] = useState('');

  // Active Tab inside Parent Zone
  const [activeTab, setActiveTab] = useState<'reports' | 'screentime' | 'audio' | 'content'>('reports');

  // Working settings copy
  const [localSettings, setLocalSettings] = useState<ParentSettings>(settings);

  // Generate unique IDs for form controls
  const langSelectId = useId();
  const mathInputId = useId();
  const pinInputId = useId();
  const speechPitchId = useId();
  const speechRateId = useId();

  if (!isOpen) return null;

  const handleVerifyGate = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(userAnswer, 10) === gateQuestion.ans || pinInput === localSettings.pin) {
      soundEffects.playSuccess();
      setIsAuthenticated(true);
      setGateError('');
    } else {
      soundEffects.playGentleTryAgain();
      setGateError('Incorrect answer. Please try again!');
      // Generate new question
      const n1 = Math.floor(Math.random() * 5) + 4;
      const n2 = Math.floor(Math.random() * 5) + 3;
      setGateQuestion({ n1, n2, ans: n1 + n2 });
      setUserAnswer('');
      setPinInput('');
    }
  };

  const handleSaveSettings = () => {
    soundEffects.playClick();
    onUpdateSettings(localSettings);
  };

  const handleResetConfirm = () => {
    if (window.confirm('Are you sure you want to reset all learning progress? This cannot be undone.')) {
      soundEffects.playClick();
      onResetProgress();
      setIsAuthenticated(false);
      onClose();
    }
  };

  const testVoice = () => {
    SpeechService.speak(
      localSettings.language === 'hindi'
        ? 'Namaste! Yeh Nanhe Sitare app hai. Chaliye seekhein!'
        : localSettings.language === 'bilingual'
        ? 'Hello parents! Namaste! Let us learn and play together!'
        : 'Hello parents! Welcome to Nanhe Sitare learning app!',
      {
        pitch: localSettings.speechPitch,
        rate: localSettings.speechRate,
      }
    );
  };

  // Accuracy calculation
  const accuracyPct =
    progress.accuracyTotalAttempts > 0
      ? Math.round((progress.accuracyTotalCorrect / progress.accuracyTotalAttempts) * 100)
      : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-indigo-300 flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-indigo-50/70 rounded-t-3xl">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Parent Zone & Controls
              </h2>
              <p className="text-xs text-slate-500">
                Screen time, learning progress & child safety settings
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEffects.playClick();
              setIsAuthenticated(false);
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {!isAuthenticated ? (
            /* Parental Security Gate */
            <div className="max-w-md mx-auto py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center mb-3">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">
                Grown-ups Only!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-6">
                To keep children safe, please solve this quick math problem or enter your PIN:
              </p>

              <form onSubmit={handleVerifyGate} className="space-y-4">
                <div className="bg-indigo-50/80 p-4 rounded-2xl border border-indigo-200">
                  <label htmlFor={mathInputId} className="block text-sm font-bold text-indigo-950 mb-1">
                    What is {gateQuestion.n1} + {gateQuestion.n2} = ?
                  </label>
                  <input
                    id={mathInputId}
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Enter answer"
                    className="w-full text-center text-2xl font-black p-2.5 rounded-xl border-2 border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    autoFocus
                  />
                </div>

                <div className="text-xs text-slate-400 font-semibold">— OR ENTER PIN (Default: 1234) —</div>

                <div>
                  <label htmlFor={pinInputId} className="sr-only">Parent PIN</label>
                  <input
                    id={pinInputId}
                    type="password"
                    maxLength={6}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Parent PIN"
                    className="w-full text-center text-lg font-bold p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                {gateError && (
                  <p className="text-xs font-bold text-rose-600">{gateError}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md transition-transform active:scale-98"
                >
                  Unlock Parent Dashboard
                </button>
              </form>
            </div>
          ) : (
            /* Unlocked Parent Dashboard */
            <div className="space-y-5">
              {/* Tabs */}
              <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
                {[
                  { id: 'reports', label: '📊 Learning Report', icon: Award },
                  { id: 'screentime', label: '⏱️ Screen Time', icon: Clock },
                  { id: 'audio', label: '🗣️ Voice & Sounds', icon: Volume2 },
                  { id: 'content', label: '⚙️ Modules & Safety', icon: Sliders },
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        soundEffects.playClick();
                        setActiveTab(tab.id as typeof activeTab);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
                        activeTab === tab.id
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: Learning Report */}
              {activeTab === 'reports' && (
                <div className="space-y-4">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-center">
                      <span className="text-2xl font-black text-amber-700">⭐ {progress.totalStars}</span>
                      <p className="text-xs font-bold text-slate-600 mt-1">Total Stars</p>
                    </div>
                    <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 text-center">
                      <span className="text-2xl font-black text-emerald-700">{accuracyPct}%</span>
                      <p className="text-xs font-bold text-slate-600 mt-1">Quiz Accuracy</p>
                    </div>
                    <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200 text-center">
                      <span className="text-2xl font-black text-rose-700">{progress.screenTimeMinutesToday}m</span>
                      <p className="text-xs font-bold text-slate-600 mt-1">Used Today</p>
                    </div>
                    <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-200 text-center">
                      <span className="text-2xl font-black text-blue-700">{progress.dailyStreak} Days</span>
                      <p className="text-xs font-bold text-slate-600 mt-1">Streak</p>
                    </div>
                  </div>

                  {/* Category Progress Breakdown */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                      Curriculum Progress
                    </h4>

                    {/* Alphabets */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>🔤 Alphabets Explored</span>
                        <span>{progress.alphabetsMastered.length} / 26 Letters</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full transition-all"
                          style={{ width: `${(progress.alphabetsMastered.length / 26) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Numbers */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>🔢 Numbers Mastered</span>
                        <span>{progress.numbersMastered.length} / 20 Numbers</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all"
                          style={{ width: `${(progress.numbersMastered.length / 20) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Colors */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>🎨 Colors Mastered</span>
                        <span>{progress.colorsMastered.length} / 10 Colors</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-teal-500 h-full rounded-full transition-all"
                          style={{ width: `${(progress.colorsMastered.length / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Motivation / Pedagogy Note */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Pedagogy Advice:</strong> Children learn best in 15-20 minute sessions with positive reinforcement. Encourage your child by reviewing their sticker book together!
                    </span>
                  </div>
                </div>
              )}

              {/* Tab 2: Screen Time Controls */}
              {activeTab === 'screentime' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-1">
                      Daily Healthy Screen Time Limit
                    </h4>
                    <p className="text-xs text-slate-500 mb-3">
                      When time expires, the app will gently guide the child to rest their eyes with a cute sleeping lullaby screen.
                    </p>

                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {[15, 30, 45, 60, 0].map(mins => (
                        <button
                          key={mins}
                          onClick={() => {
                            const updated = { ...localSettings, screenTimeLimitMinutes: mins };
                            setLocalSettings(updated);
                            onUpdateSettings(updated);
                          }}
                          className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all ${
                            localSettings.screenTimeLimitMinutes === mins
                              ? 'bg-indigo-600 text-white border-indigo-700 shadow'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {mins === 0 ? 'Unlimited' : `${mins} mins`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Current Usage Status */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Today&apos;s Active Screen Time:</span>
                      <span>
                        {progress.screenTimeMinutesToday} min / {localSettings.screenTimeLimitMinutes > 0 ? `${localSettings.screenTimeLimitMinutes} min` : '∞'}
                      </span>
                    </div>
                    {localSettings.screenTimeLimitMinutes > 0 && (
                      <div className="w-full bg-slate-200 rounded-full h-3.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            progress.screenTimeMinutesToday >= localSettings.screenTimeLimitMinutes
                              ? 'bg-rose-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{
                            width: `${Math.min(100, (progress.screenTimeMinutesToday / localSettings.screenTimeLimitMinutes) * 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Voice & Narration Controls */}
              {activeTab === 'audio' && (
                <div className="space-y-4">
                  {/* Language Mode */}
                  <div>
                    <label htmlFor={langSelectId} className="block text-sm font-bold text-slate-800 mb-1">
                      Voice Narration Language
                    </label>
                    <select
                      id={langSelectId}
                      value={localSettings.language}
                      onChange={(e) => {
                        const updated = { ...localSettings, language: e.target.value as LanguageMode };
                        setLocalSettings(updated);
                        onUpdateSettings(updated);
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="bilingual">Bilingual (English + Hindi / Hinglish) - Recommended</option>
                      <option value="english">English Only</option>
                      <option value="hindi">Hindi Only</option>
                    </select>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-2.5 pt-1">
                    <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                      <span className="text-xs sm:text-sm font-bold text-slate-700">
                        Voice Narration (Clear spoken letters, numbers, items)
                      </span>
                      <input
                        type="checkbox"
                        checked={localSettings.voiceNarration}
                        onChange={(e) => {
                          const updated = { ...localSettings, voiceNarration: e.target.checked };
                          setLocalSettings(updated);
                          onUpdateSettings(updated);
                        }}
                        className="w-5 h-5 accent-indigo-600 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                      <span className="text-xs sm:text-sm font-bold text-slate-700">
                        Sound Effects (Chimes, pops, star sparkles)
                      </span>
                      <input
                        type="checkbox"
                        checked={localSettings.soundEffects}
                        onChange={(e) => {
                          const updated = { ...localSettings, soundEffects: e.target.checked };
                          setLocalSettings(updated);
                          onUpdateSettings(updated);
                        }}
                        className="w-5 h-5 accent-indigo-600 rounded"
                      />
                    </label>
                  </div>

                  {/* Voice sliders */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label htmlFor={speechPitchId} className="block text-xs font-bold text-slate-600 mb-1">
                        Speech Pitch (Child-friendly)
                      </label>
                      <input
                        id={speechPitchId}
                        type="range"
                        min="0.8"
                        max="1.6"
                        step="0.1"
                        value={localSettings.speechPitch}
                        onChange={(e) => {
                          const updated = { ...localSettings, speechPitch: parseFloat(e.target.value) };
                          setLocalSettings(updated);
                          onUpdateSettings(updated);
                        }}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                    <div>
                      <label htmlFor={speechRateId} className="block text-xs font-bold text-slate-600 mb-1">
                        Speech Speed (Pace)
                      </label>
                      <input
                        id={speechRateId}
                        type="range"
                        min="0.7"
                        max="1.2"
                        step="0.05"
                        value={localSettings.speechRate}
                        onChange={(e) => {
                          const updated = { ...localSettings, speechRate: parseFloat(e.target.value) };
                          setLocalSettings(updated);
                          onUpdateSettings(updated);
                        }}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={testVoice}
                    className="w-full py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" /> Test Voice Narration
                  </button>
                </div>
              )}

              {/* Tab 4: Modules & Reset */}
              {activeTab === 'content' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-1">
                      Active Learning Modules
                    </h4>
                    <p className="text-xs text-slate-500 mb-3">
                      Turn off specific categories if you want your child to focus on certain topics.
                    </p>

                    <div className="space-y-2">
                      {[
                        { key: 'alphabets', label: '🔤 Alphabets (A-Z, Bubble Pop, Tracing)' },
                        { key: 'numbers', label: '🔢 Numbers (1-20, Counting, Bunny Feed)' },
                        { key: 'colors', label: '🎨 Colors (10 Colors, Bucket Sort, Paint Pad)' },
                        { key: 'games', label: '🎮 Fun Games (Memory Match, Pop Frenzy)' },
                        { key: 'stickers', label: '⭐ Sticker Room & Rewards' },
                      ].map(item => (
                        <label
                          key={item.key}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer"
                        >
                          <span className="text-xs sm:text-sm font-bold text-slate-700">
                            {item.label}
                          </span>
                          <input
                            type="checkbox"
                            checked={localSettings.enabledCategories[item.key as keyof typeof localSettings.enabledCategories]}
                            onChange={(e) => {
                              const updated = {
                                ...localSettings,
                                enabledCategories: {
                                  ...localSettings.enabledCategories,
                                  [item.key]: e.target.checked,
                                },
                              };
                              setLocalSettings(updated);
                              onUpdateSettings(updated);
                            }}
                            className="w-5 h-5 accent-indigo-600 rounded"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={handleResetConfirm}
                      className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" /> Reset Learning Progress
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-end">
          <button
            onClick={() => {
              soundEffects.playClick();
              setIsAuthenticated(false);
              onClose();
            }}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs sm:text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
