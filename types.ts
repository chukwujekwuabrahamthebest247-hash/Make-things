
export type InstrumentType = 'sine' | 'square' | 'sawtooth' | 'triangle';

export interface PianoKeyData {
  note: string;
  frequency: number;
  isBlack: boolean;
  keyboardShortcut: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChordSuggestion {
  name: string;
  notes: string[];
}
