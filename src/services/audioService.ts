// Audio synthesizer and speech narration engine for Kids Learning App

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const soundEffects = {
  // Joyful tap / click
  playClick: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // safe fallback
    }
  },

  // Bubble / Balloon pop
  playPop: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.09);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // safe fallback
    }
  },

  // Correct answer / success chime
  playSuccess: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.07;
        const endTime = startTime + 0.18;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, endTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(endTime);
      });
    } catch {
      // safe fallback
    }
  },

  // Star earned sparkle sound
  playStarEarn: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const freqs = [587.33, 880, 1174.66, 1760]; // D5, A5, D6, A6
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + i * 0.06;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.26);
      });
    } catch {
      // safe fallback
    }
  },

  // Gentle, friendly wrong answer boing (never harsh)
  playGentleTryAgain: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // safe fallback
    }
  },

  // Victory Fanfare / Level up
  playFanfare: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const melody = [
        { f: 523.25, d: 0.12 }, // C
        { f: 659.25, d: 0.12 }, // E
        { f: 783.99, d: 0.12 }, // G
        { f: 1046.5, d: 0.28 }, // High C
      ];
      let t = ctx.currentTime;
      melody.forEach(item => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.f, t);

        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + item.d);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + item.d);
        t += item.d + 0.03;
      });
    } catch {
      // safe fallback
    }
  },

  // Calming Bedtime Lullaby (when screen time limit is reached)
  playLullaby: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const notes = [440, 392, 349, 329.6, 293.6]; // A4, G4, F4, E4, D4
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + idx * 0.35;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.65);
      });
    } catch {
      // safe fallback
    }
  },
};

// Web Speech Narration Engine
export class SpeechService {
  private static isSpeaking = false;

  public static speak(
    text: string,
    options?: {
      pitch?: number;
      rate?: number;
      lang?: string;
      onEnd?: () => void;
    }
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (options?.onEnd) options.onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending or ongoing speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = options?.pitch ?? 1.25; // slightly cheerful & child-friendly
      utterance.rate = options?.rate ?? 0.92;   // clear and not rushed for toddlers
      
      // Auto voice selection if Hindi or English requested
      const voices = window.speechSynthesis.getVoices();
      if (options?.lang) {
        utterance.lang = options.lang;
        const matchingVoice = voices.find(v => v.lang.toLowerCase().includes(options.lang!.toLowerCase()));
        if (matchingVoice) utterance.voice = matchingVoice;
      } else {
        // Prefer child-like or high quality standard voices
        const friendlyVoice = voices.find(
          v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira'))
        );
        if (friendlyVoice) utterance.voice = friendlyVoice;
      }

      utterance.onend = () => {
        SpeechService.isSpeaking = false;
        if (options?.onEnd) options.onEnd();
      };
      utterance.onerror = () => {
        SpeechService.isSpeaking = false;
        if (options?.onEnd) options.onEnd();
      };

      SpeechService.isSpeaking = true;
      window.speechSynthesis.speak(utterance);
    } catch {
      SpeechService.isSpeaking = false;
      if (options?.onEnd) options.onEnd();
    }
  }

  public static stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      SpeechService.isSpeaking = false;
    }
  }
}
