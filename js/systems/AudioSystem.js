/**
 * AudioSystem.js — Procedural audio for Cyber Heist
 * Uses Web Audio API oscillators to generate all sounds at runtime.
 * No external audio files needed.
 */
class AudioSystem {
    constructor() {
        this.ctx = null;
        this.initialized = false;
        this.musicGain = null;
        this.sfxGain = null;
        this.masterGain = null;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.currentMusic = null;
        this.musicPlaying = false;
    }

    /**
     * Initialize the Web Audio context. Must be called after user gesture.
     */
    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = this.musicVolume;
            this.musicGain.connect(this.masterGain);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = this.sfxVolume;
            this.sfxGain.connect(this.masterGain);

            this.initialized = true;
        } catch (e) {
            console.warn('AudioSystem: Web Audio API not available', e);
        }
    }

    /**
     * Resume audio context if suspended (browser policy).
     */
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * Set music volume (0-1).
     */
    setMusicVolume(vol) {
        this.musicVolume = vol;
        if (this.musicGain) {
            this.musicGain.gain.setValueAtTime(vol, this.ctx.currentTime);
        }
    }

    /**
     * Set SFX volume (0-1).
     */
    setSfxVolume(vol) {
        this.sfxVolume = vol;
        if (this.sfxGain) {
            this.sfxGain.gain.setValueAtTime(vol, this.ctx.currentTime);
        }
    }

    // ── Sound Effects ──

    /**
     * Play a short blip sound.
     */
    playBlip(freq = 880, duration = 0.08) {
        if (!this.initialized) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    }

    /**
     * Footstep sound.
     */
    playFootstep() {
        if (!this.initialized) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(80 + Math.random() * 40, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.06);
    }

    /**
     * Alert/detection sound — rising tone.
     */
    playAlert() {
        if (!this.initialized) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(1200, this.ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.4);
    }

    /**
     * Alarm siren — wobbling tone.
     */
    playAlarm() {
        if (!this.initialized) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.linearRampToValueAtTime(900, t + 0.25);
        osc.frequency.linearRampToValueAtTime(600, t + 0.5);
        osc.frequency.linearRampToValueAtTime(900, t + 0.75);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.setValueAtTime(0.2, t + 0.7);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.8);
    }

    /**
     * Hacking/computer interaction sound.
     */
    playHack() {
        if (!this.initialized) return;
        const t = this.ctx.currentTime;
        for (let i = 0; i < 5; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(200 + Math.random() * 2000, t + i * 0.05);
            gain.gain.setValueAtTime(0.1, t + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.04);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t + i * 0.05);
            osc.stop(t + i * 0.05 + 0.05);
        }
    }

    /**
     * Pickup/collect sound — bright ascending arpeggio.
     */
    playPickup() {
        if (!this.initialized) return;
        const t = this.ctx.currentTime;
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t + i * 0.06);
            gain.gain.setValueAtTime(0.2, t + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.15);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t + i * 0.06);
            osc.stop(t + i * 0.06 + 0.15);
        });
    }

    /**
     * Door open sound — mechanical clunk.
     */
    playDoorOpen() {
        if (!this.initialized) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.15);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.2);
    }

    /**
     * Laser hit/damage sound.
     */
    playDamage() {
        if (!this.initialized) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(50, t + 0.2);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.25);

        // Add noise burst
        const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.1, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.3;
        }
        const noise = this.ctx.createBufferSource();
        const noiseGain = this.ctx.createGain();
        noise.buffer = buffer;
        noiseGain.gain.setValueAtTime(0.2, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        noise.connect(noiseGain);
        noiseGain.connect(this.sfxGain);
        noise.start(t);
    }

    /**
     * Success/victory jingle.
     */
    playSuccess() {
        if (!this.initialized) return;
        const t = this.ctx.currentTime;
        const notes = [523, 659, 784, 1047, 1318];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t + i * 0.1);
            gain.gain.setValueAtTime(0.2, t + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.3);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t + i * 0.1);
            osc.stop(t + i * 0.1 + 0.3);
        });
    }

    /**
     * Failure/game-over sound.
     */
    playFailure() {
        if (!this.initialized) return;
        const t = this.ctx.currentTime;
        const notes = [440, 370, 311, 261];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, t + i * 0.15);
            gain.gain.setValueAtTime(0.15, t + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.3);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t + i * 0.15);
            osc.stop(t + i * 0.15 + 0.35);
        });
    }

    /**
     * EMP pulse sound (boss attack).
     */
    playEMP() {
        if (!this.initialized) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2000, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.5);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.6);
    }

    // ── Background Music ──

    /**
     * Start ambient synthwave background music loop.
     * @param {string} [type='menu'] - 'menu' or 'gameplay' or 'boss'
     */
    startMusic(type = 'menu') {
        if (!this.initialized) return;
        this.stopMusic();

        this.musicPlaying = true;
        this._playMusicLoop(type);
    }

    /**
     * Internal: recursively schedule music phrases.
     */
    _playMusicLoop(type) {
        if (!this.musicPlaying || !this.initialized) return;

        const t = this.ctx.currentTime;
        const barDuration = type === 'boss' ? 1.6 : 2.0;

        // Bass line
        const bassNotes = type === 'menu'
            ? [55, 55, 65, 65, 73, 73, 65, 65]
            : type === 'boss'
                ? [55, 65, 55, 82, 55, 65, 73, 82]
                : [55, 55, 73, 73, 82, 82, 65, 65];

        bassNotes.forEach((freq, i) => {
            if (!this.musicPlaying) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const noteTime = t + i * (barDuration / bassNotes.length);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, noteTime);
            gain.gain.setValueAtTime(0.08, noteTime);
            gain.gain.setValueAtTime(0.08, noteTime + barDuration / bassNotes.length * 0.8);
            gain.gain.exponentialRampToValueAtTime(0.001, noteTime + barDuration / bassNotes.length * 0.95);
            osc.connect(gain);
            gain.connect(this.musicGain);
            osc.start(noteTime);
            osc.stop(noteTime + barDuration / bassNotes.length);
        });

        // Pad chord
        const padFreqs = type === 'boss' ? [220, 261, 329] : [220, 277, 330];
        padFreqs.forEach(freq => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.03, t);
            gain.gain.setValueAtTime(0.03, t + barDuration * 0.9);
            gain.gain.exponentialRampToValueAtTime(0.001, t + barDuration);
            osc.connect(gain);
            gain.connect(this.musicGain);
            osc.start(t);
            osc.stop(t + barDuration + 0.01);
        });

        // Hi-hat pattern
        const hihatCount = type === 'boss' ? 16 : 8;
        for (let i = 0; i < hihatCount; i++) {
            if (!this.musicPlaying) break;
            const noteTime = t + i * (barDuration / hihatCount);
            const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.03, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let s = 0; s < data.length; s++) {
                data[s] = (Math.random() * 2 - 1) * Math.pow(1 - s / data.length, 3);
            }
            const noise = this.ctx.createBufferSource();
            const gain = this.ctx.createGain();
            const hipass = this.ctx.createBiquadFilter();
            hipass.type = 'highpass';
            hipass.frequency.value = 8000;
            noise.buffer = buffer;
            gain.gain.setValueAtTime(i % 2 === 0 ? 0.06 : 0.03, noteTime);
            noise.connect(hipass);
            hipass.connect(gain);
            gain.connect(this.musicGain);
            noise.start(noteTime);
        }

        // Schedule next bar
        this._musicTimeout = setTimeout(() => {
            if (this.musicPlaying) this._playMusicLoop(type);
        }, barDuration * 1000 - 50);
    }

    /**
     * Stop background music.
     */
    stopMusic() {
        this.musicPlaying = false;
        if (this._musicTimeout) {
            clearTimeout(this._musicTimeout);
            this._musicTimeout = null;
        }
    }
}
