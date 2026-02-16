import * as Tone from 'tone';

export interface AudioSettings {
  sfxEnabled: boolean;
  musicEnabled: boolean;
  sfxVolume: number;
  musicVolume: number;
}

export class AudioManager {
  private static instance: AudioManager;
  private initialized = false;
  private settings: AudioSettings = {
    sfxEnabled: true,
    musicEnabled: true,
    sfxVolume: 0.7,
    musicVolume: 0.2,
  };
  
  // Synths
  private correctSynth: Tone.PolySynth | null = null;
  private wrongSynth: Tone.Synth | null = null;
  private levelUpSynth: Tone.PolySynth | null = null;
  private bgmSynth: Tone.PolySynth | null = null;
  
  // BGM loop
  private bgmLoop: Tone.Loop | null = null;
  private isPlayingBGM = false;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    
    await Tone.start();
    
    // Initialize synths
    this.correctSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.1, release: 0.5 },
    }).toDestination();
    this.correctSynth.volume.value = -10;

    this.wrongSynth = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 },
    }).toDestination();
    this.wrongSynth.volume.value = -8;

    this.levelUpSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 1 },
    }).toDestination();
    this.levelUpSynth.volume.value = -8;

    // BGM setup
    this.bgmSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.5, decay: 0.5, sustain: 0.5, release: 2 },
    }).toDestination();
    this.bgmSynth.volume.value = -20;

    this.loadSettings();
    this.initialized = true;
  }

  // SFX Methods
  playCorrect(): void {
    if (!this.initialized || !this.settings.sfxEnabled) return;
    
    // Happy major chord arpeggio
    const now = Tone.now();
    this.correctSynth?.triggerAttackRelease('C5', '16n', now);
    this.correctSynth?.triggerAttackRelease('E5', '16n', now + 0.05);
    this.correctSynth?.triggerAttackRelease('G5', '16n', now + 0.1);
    this.correctSynth?.triggerAttackRelease('C6', '8n', now + 0.15);
  }

  playWrong(): void {
    if (!this.initialized || !this.settings.sfxEnabled) return;
    
    // Low dissonant buzz
    this.wrongSynth?.triggerAttackRelease('A2', '8n');
    setTimeout(() => {
      this.wrongSynth?.triggerAttackRelease('G#2', '8n');
    }, 100);
  }

  playLevelUp(): void {
    if (!this.initialized || !this.settings.sfxEnabled) return;
    
    // Victory fanfare
    const now = Tone.now();
    this.levelUpSynth?.triggerAttackRelease('C4', '8n', now);
    this.levelUpSynth?.triggerAttackRelease('E4', '8n', now + 0.1);
    this.levelUpSynth?.triggerAttackRelease('G4', '8n', now + 0.2);
    this.levelUpSynth?.triggerAttackRelease('C5', '4n', now + 0.3);
    
    // Add sparkle
    setTimeout(() => {
      this.correctSynth?.triggerAttackRelease(['E5', 'G5', 'B5'], '8n');
    }, 400);
  }

  playGameOver(): void {
    if (!this.initialized || !this.settings.sfxEnabled) return;
    
    // Sad descending line
    const now = Tone.now();
    this.wrongSynth?.triggerAttackRelease('C4', '4n', now);
    this.wrongSynth?.triggerAttackRelease('G3', '4n', now + 0.3);
    this.wrongSynth?.triggerAttackRelease('C3', '2n', now + 0.6);
  }

  // BGM Methods
  startBGM(): void {
    if (!this.initialized || !this.settings.musicEnabled || this.isPlayingBGM) return;
    
    // Lo-fi style loop (very simple, chill progression)
    const chords = [
      ['C4', 'E4', 'G4'],
      ['F4', 'A4', 'C5'],
      ['G4', 'B4', 'D5'],
      ['C4', 'E4', 'G4'],
    ];
    
    let chordIndex = 0;
    
    this.bgmLoop = new Tone.Loop((time) => {
      const chord = chords[chordIndex];
      this.bgmSynth?.triggerAttackRelease(chord, '2n', time);
      chordIndex = (chordIndex + 1) % chords.length;
    }, '1n').start(0);
    
    Tone.Transport.bpm.value = 70; // Chill tempo
    Tone.Transport.start();
    this.isPlayingBGM = true;
  }

  stopBGM(): void {
    if (!this.isPlayingBGM) return;
    
    this.bgmLoop?.stop();
    this.bgmLoop?.dispose();
    this.bgmLoop = null;
    Tone.Transport.stop();
    this.isPlayingBGM = false;
  }

  pauseBGM(): void {
    if (this.isPlayingBGM) {
      Tone.Transport.pause();
    }
  }

  resumeBGM(): void {
    if (this.isPlayingBGM) {
      Tone.Transport.start();
    }
  }

  // Settings
  setSFXEnabled(enabled: boolean): void {
    this.settings.sfxEnabled = enabled;
    this.saveSettings();
  }

  setMusicEnabled(enabled: boolean): void {
    this.settings.musicEnabled = enabled;
    this.saveSettings();
    
    if (enabled && !this.isPlayingBGM) {
      this.startBGM();
    } else if (!enabled && this.isPlayingBGM) {
      this.stopBGM();
    }
  }

  setSFXVolume(volume: number): void {
    this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.correctSynth) this.correctSynth.volume.value = -10 + (this.settings.sfxVolume - 0.5) * 10;
    if (this.wrongSynth) this.wrongSynth.volume.value = -8 + (this.settings.sfxVolume - 0.5) * 10;
    this.saveSettings();
  }

  setMusicVolume(volume: number): void {
    this.settings.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.bgmSynth) this.bgmSynth.volume.value = -20 + (this.settings.musicVolume - 0.5) * 20;
    this.saveSettings();
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  private saveSettings(): void {
    localStorage.setItem('math-drop-audio', JSON.stringify(this.settings));
  }

  private loadSettings(): void {
    const saved = localStorage.getItem('math-drop-audio');
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
    }
  }

  // Cleanup
  destroy(): void {
    this.stopBGM();
    this.correctSynth?.dispose();
    this.wrongSynth?.dispose();
    this.levelUpSynth?.dispose();
    this.bgmSynth?.dispose();
    this.initialized = false;
  }
}
