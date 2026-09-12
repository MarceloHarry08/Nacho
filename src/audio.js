/**
 * Nacho el Maestro - 16-bit Retro Audio Engine
 * Powered by Tone.js (FM Synths, Noise Generators & Chiptune BGM)
 */

class RetroAudioEngine {
  constructor() {
    this.initialized = false;
    this.isMuted = false;
    this.currentTrack = null;
    this.bgmLoop = null;
    this.bassLoop = null;
    this.drumsLoop = null;
    this.volumeLevel = 0.8;
    this.isBossMusic = false;
    this.currentBiome = 1;
  }

  async init() {
    if (this.initialized) return;
    try {
      if (window.Tone) {
        await Tone.start();
        Tone.Destination.volume.value = Tone.gainToDb(this.volumeLevel);

        // Sound Effects Synths
        // 1. FM Impact Synth (Punches, Kicks)
        this.hitSynth = new Tone.MembraneSynth({
          pitchDecay: 0.05,
          octaves: 6,
          oscillator: { type: "square4" },
          envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 }
        }).toDestination();

        // 2. Whoosh / Swing Noise Synth
        this.whooshSynth = new Tone.NoiseSynth({
          noise: { type: "white" },
          envelope: { attack: 0.005, decay: 0.12, sustain: 0 }
        }).toDestination();
        this.whooshSynth.volume.value = -6;

        // 3. Jump Synth (Upward frequency sweep)
        this.jumpSynth = new Tone.Synth({
          oscillator: { type: "triangle" },
          envelope: { attack: 0.01, decay: 0.14, sustain: 0 }
        }).toDestination();

        // 4. Special "Kihap Sagrado" Synth
        this.kihapSub = new Tone.MembraneSynth({
          pitchDecay: 0.08,
          octaves: 8,
          oscillator: { type: "triangle" },
          envelope: { attack: 0.001, decay: 0.8, sustain: 0.1, release: 0.5 }
        }).toDestination();

        this.kihapNoise = new Tone.NoiseSynth({
          noise: { type: "pink" },
          envelope: { attack: 0.01, decay: 0.6, sustain: 0 }
        }).toDestination();

        this.voiceSynth = new Tone.FMSynth({
          harmonicity: 3,
          modulationIndex: 10,
          oscillator: { type: "sawtooth" },
          envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.2 },
          modulation: { type: "square" },
          modulationEnvelope: { attack: 0.01, decay: 0.2, sustain: 0 }
        }).toDestination();

        // 5. Zombie Groan FM Synth
        this.groanSynth = new Tone.FMSynth({
          harmonicity: 1.5,
          modulationIndex: 12,
          oscillator: { type: "sawtooth" },
          envelope: { attack: 0.05, decay: 0.25, sustain: 0 }
        }).toDestination();
        this.groanSynth.volume.value = -8;

        // 6. Magic Projectile Synth
        this.projectileSynth = new Tone.Synth({
          oscillator: { type: "sawtooth8" },
          envelope: { attack: 0.005, decay: 0.2, sustain: 0 }
        }).toDestination();

        // 7. Chime / Belt Fanfare Synth
        this.fanfareSynth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: "triangle8" },
          envelope: { attack: 0.02, decay: 0.3, sustain: 0.2, release: 0.6 }
        }).toDestination();

        // Music Synths
        this.leadSynth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: "square8" },
          envelope: { attack: 0.02, decay: 0.12, sustain: 0.3, release: 0.2 }
        }).toDestination();
        this.leadSynth.volume.value = -12;

        this.bassSynth = new Tone.MonoSynth({
          oscillator: { type: "sawtooth" },
          filter: { Q: 2, type: "lowpass", rolloff: -24 },
          envelope: { attack: 0.01, decay: 0.18, sustain: 0.2, release: 0.1 },
          filterEnvelope: { attack: 0.01, decay: 0.15, sustain: 0.2, baseFrequency: 80, octaves: 2.5 }
        }).toDestination();
        this.bassSynth.volume.value = -8;

        this.drumKick = new Tone.MembraneSynth({
          pitchDecay: 0.04,
          octaves: 4,
          oscillator: { type: "sine" },
          envelope: { attack: 0.001, decay: 0.18, sustain: 0 }
        }).toDestination();
        this.drumKick.volume.value = -6;

        this.drumSnare = new Tone.NoiseSynth({
          noise: { type: "white" },
          envelope: { attack: 0.001, decay: 0.12, sustain: 0 }
        }).toDestination();
        this.drumSnare.volume.value = -10;

        this.initialized = true;
      }
    } catch (e) {
      console.warn("Audio init deferred or failed:", e);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (window.Tone) {
      Tone.Destination.mute = this.isMuted;
    }
    return this.isMuted;
  }

  // --- Sound Effects ---

  playWhoosh() {
    if (!this.initialized || this.isMuted) return;
    try {
      this.whooshSynth.triggerAttackRelease("16n");
    } catch (e) {}
  }

  playHit(isHeavy = false) {
    if (!this.initialized || this.isMuted) return;
    try {
      const now = Tone.now();
      if (isHeavy) {
        this.hitSynth.triggerAttackRelease("A1", "8n", now);
        this.whooshSynth.triggerAttackRelease("8n", now);
      } else {
        this.hitSynth.triggerAttackRelease("D2", "16n", now);
      }
    } catch (e) {}
  }

  playHeavyHit() {
    this.playHit(true);
  }

  playJump() {
    if (!this.initialized || this.isMuted) return;
    try {
      const now = Tone.now();
      this.jumpSynth.triggerAttackRelease("C3", "16n", now);
      this.jumpSynth.frequency.exponentialRampTo("G4", 0.12, now);
    } catch (e) {}
  }

  playCrouch() {
    if (!this.initialized || this.isMuted) return;
    try {
      this.whooshSynth.triggerAttackRelease("32n");
    } catch (e) {}
  }

  playZombieGroan() {
    if (!this.initialized || this.isMuted) return;
    try {
      const notes = ["G1", "F1", "Ab1", "E1"];
      const note = notes[Math.floor(Math.random() * notes.length)];
      this.groanSynth.triggerAttackRelease(note, "8n");
    } catch (e) {}
  }

  playZombieGrab() {
    if (!this.initialized || this.isMuted) return;
    try {
      this.groanSynth.triggerAttackRelease("C2", "16n");
      this.whooshSynth.triggerAttackRelease("16n");
    } catch (e) {}
  }

  playShoot() {
    if (!this.initialized || this.isMuted) return;
    try {
      const now = Tone.now();
      this.projectileSynth.triggerAttackRelease("C5", "16n", now);
      this.projectileSynth.frequency.exponentialRampTo("F3", 0.15, now);
    } catch (e) {}
  }

  playKihap() {
    if (!this.initialized || this.isMuted) return;
    try {
      const now = Tone.now();
      // Massive sub-bass boom
      this.kihapSub.triggerAttackRelease("C1", "2n", now);
      // Sweeping white/pink energy explosion
      this.kihapNoise.triggerAttackRelease("4n", now);
      // Resonant Taekwondo vocal synth cry "KIHAAAAAP!"
      this.voiceSynth.triggerAttackRelease("C4", "8n", now);
      this.voiceSynth.frequency.exponentialRampTo("G4", 0.1, now);
      this.voiceSynth.frequency.exponentialRampTo("C3", 0.35, now + 0.1);
    } catch (e) {}
  }

  playSpecialReady() {
    if (!this.initialized || this.isMuted) return;
    try {
      const now = Tone.now();
      this.fanfareSynth.triggerAttackRelease("G5", "16n", now);
      this.fanfareSynth.triggerAttackRelease("C6", "8n", now + 0.08);
    } catch (e) {}
  }

  playPlayerHurt() {
    if (!this.initialized || this.isMuted) return;
    try {
      const now = Tone.now();
      this.hitSynth.triggerAttackRelease("F2", "8n", now);
      this.voiceSynth.triggerAttackRelease("D3", "16n", now);
    } catch (e) {}
  }

  playBossWarning() {
    if (!this.initialized || this.isMuted) return;
    try {
      const now = Tone.now();
      for (let i = 0; i < 3; i++) {
        this.leadSynth.triggerAttackRelease(["C5", "F#5"], "16n", now + i * 0.22);
      }
    } catch (e) {}
  }

  playBeltUpgrade() {
    if (!this.initialized || this.isMuted) return;
    try {
      const now = Tone.now();
      const chord1 = ["C4", "E4", "G4"];
      const chord2 = ["D4", "F#4", "A4"];
      const chord3 = ["E4", "G#4", "B4"];
      const chordFinal = ["C5", "G5", "C6"];

      this.fanfareSynth.triggerAttackRelease(chord1, "8n", now);
      this.fanfareSynth.triggerAttackRelease(chord2, "8n", now + 0.15);
      this.fanfareSynth.triggerAttackRelease(chord3, "8n", now + 0.3);
      this.fanfareSynth.triggerAttackRelease(chordFinal, "2n", now + 0.45);
    } catch (e) {}
  }

  playVictory() {
    if (!this.initialized || this.isMuted) return;
    try {
      this.stopBGM();
      const now = Tone.now();
      const melody = [
        { note: "C4", dur: "8n", time: 0 },
        { note: "E4", dur: "8n", time: 0.18 },
        { note: "G4", dur: "8n", time: 0.36 },
        { note: "C5", dur: "4n", time: 0.54 },
        { note: "B4", dur: "8n", time: 0.85 },
        { note: "C5", dur: "2n", time: 1.05 }
      ];
      melody.forEach(m => {
        this.fanfareSynth.triggerAttackRelease(m.note, m.dur, now + m.time);
      });
    } catch (e) {}
  }

  playGameOver() {
    if (!this.initialized || this.isMuted) return;
    try {
      this.stopBGM();
      const now = Tone.now();
      const notes = ["D4", "C#4", "C4", "B3", "A#3"];
      notes.forEach((n, i) => {
        this.leadSynth.triggerAttackRelease(n, "8n", now + i * 0.22);
      });
    } catch (e) {}
  }

  // --- Dynamic Chiptune BGM Engine ---

  startBGM(biomeIndex = 1, isBoss = false) {
    if (!this.initialized || this.isMuted) return;
    try {
      this.stopBGM();
      this.currentBiome = biomeIndex;
      this.isBossMusic = isBoss;

      Tone.Transport.cancel();
      Tone.Transport.stop();

      // Tempo settings
      const bpm = isBoss ? 144 : 126;
      Tone.Transport.bpm.value = bpm;

      // Melody & Basslines based on biome
      let leadNotes = [];
      let bassNotes = [];

      if (isBoss) {
        // High tension boss fight sequence
        leadNotes = ["D4", "D4", "F4", "G4", "Ab4", "G4", "F4", "D4"];
        bassNotes = ["D2", "D2", "D2", "D2", "F2", "G2", "Ab2", "G2"];
      } else {
        switch (biomeIndex) {
          case 1: // City (Retro Synthwave / Urban Beat)
            leadNotes = ["A3", "C4", "E4", "G4", "A4", "G4", "E4", "C4"];
            bassNotes = ["A2", "A2", "C2", "C2", "D2", "D2", "E2", "G2"];
            break;
          case 2: // Jungle (Mystic / Tribal Groove)
            leadNotes = ["E3", "G3", "A3", "B3", "D4", "B3", "A3", "G3"];
            bassNotes = ["E2", "E2", "G2", "G2", "A2", "B2", "A2", "G2"];
            break;
          case 3: // Ice Temple (Crystalline Arpeggios)
            leadNotes = ["B3", "D4", "F#4", "A4", "B4", "A4", "F#4", "D4"];
            bassNotes = ["B2", "B2", "D2", "D2", "E2", "E2", "F#2", "A2"];
            break;
          case 4: // Fire Caverns (Driving Rock/Metal FM)
            leadNotes = ["C4", "Eb4", "F4", "F#4", "G4", "F#4", "F4", "Eb4"];
            bassNotes = ["C2", "C2", "Eb2", "Eb2", "F2", "F#2", "G2", "Eb2"];
            break;
          case 5: // Castle / Dark Dragon (Epic Martial Duel)
            leadNotes = ["A3", "E4", "F4", "A4", "G4", "F4", "E4", "D4"];
            bassNotes = ["A2", "A2", "F2", "F2", "D2", "E2", "A2", "E2"];
            break;
        }
      }

      let step = 0;
      this.bgmLoop = new Tone.Loop(time => {
        const leadNote = leadNotes[step % leadNotes.length];
        const bassNote = bassNotes[step % bassNotes.length];

        // Play Lead & Bass
        if (leadNote) this.leadSynth.triggerAttackRelease(leadNote, "16n", time);
        if (bassNote) this.bassSynth.triggerAttackRelease(bassNote, "8n", time);

        // Drums (Kick on 0 and 4, Snare on 2 and 6)
        const drumStep = step % 8;
        if (drumStep === 0 || drumStep === 4) {
          this.drumKick.triggerAttackRelease("C1", "16n", time);
        } else if (drumStep === 2 || drumStep === 6) {
          this.drumSnare.triggerAttackRelease("16n", time);
        }

        step++;
      }, "8n");

      this.bgmLoop.start(0);
      Tone.Transport.start();
    } catch (e) {
      console.warn("BGM start error:", e);
    }
  }

  stopBGM() {
    try {
      if (this.bgmLoop) {
        this.bgmLoop.stop();
        this.bgmLoop.dispose();
        this.bgmLoop = null;
      }
      Tone.Transport.stop();
      Tone.Transport.cancel();
    } catch (e) {}
  }
}

// Global Audio Engine Instance
window.retroAudio = new RetroAudioEngine();
