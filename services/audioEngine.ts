class AudioEngine {
  private oscillators: Map<string, OscillatorNode> = new Map();
  private gainNode: GainNode | null = null;
  private audioContext: AudioContext | null = null;
  private currentInstrument: OscillatorType = 'sine';
  private currentVolume: number = 0.5;

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
    }
    return this.audioContext;
  }

  playNote(note: string, frequency: number): void {
    const context = this.getAudioContext();
    
    if (context.state === 'suspended') {
      context.resume();
    }

    this.stopNote(note);

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = this.currentInstrument;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    gainNode.gain.setValueAtTime(this.currentVolume, context.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start(context.currentTime);

    this.oscillators.set(note, oscillator);
  }

  stopNote(note: string): void {
    const oscillator = this.oscillators.get(note);
    if (oscillator) {
      oscillator.stop();
      oscillator.disconnect();
      this.oscillators.delete(note);
    }
  }

  setInstrument(instrument: OscillatorType): void {
    this.currentInstrument = instrument;
  }

  setVolume(volume: number): void {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(this.currentVolume, this.audioContext?.currentTime || 0);
    }
  }

  stopAll(): void {
    this.oscillators.forEach((oscillator) => {
      oscillator.stop();
      oscillator.disconnect();
    });
    this.oscillators.clear();
  }
}

export const audioEngine = new AudioEngine();
