
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PIANO_KEYS } from './constants';
import { InstrumentType, ChatMessage } from './types';
import { audioEngine } from './services/audioEngine';
import { getMusicAdvice } from './services/gemini';
import PianoKey from './components/PianoKey';
import Assistant from './components/Assistant';

const App: React.FC = () => {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [instrument, setInstrument] = useState<InstrumentType>('sine');
  const [volume, setVolume] = useState(0.5);
  const [chatOpen, setChatOpen] = useState(true);
  const [highlightedNotes, setHighlightedNotes] = useState<string[]>([]);
  const [isPlayingMelody, setIsPlayingMelody] = useState(false);

  const handleNoteOn = useCallback((note: string, freq: number) => {
    setActiveNotes(prev => new Set(prev).add(note));
    audioEngine.playNote(note, freq);
  }, []);

  const handleNoteOff = useCallback((note: string) => {
    setActiveNotes(prev => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
    audioEngine.stopNote(note);
  }, []);

  const playMelody = useCallback(async (notes: string[]) => {
    if (isPlayingMelody) return;
    setIsPlayingMelody(true);
    
    for (const noteName of notes) {
      const keyData = PIANO_KEYS.find(k => k.note.toUpperCase() === noteName.toUpperCase());
      if (keyData) {
        handleNoteOn(keyData.note, keyData.frequency);
        await new Promise(r => setTimeout(r, 400));
        handleNoteOff(keyData.note);
        await new Promise(r => setTimeout(r, 100));
      }
    }
    setIsPlayingMelody(false);
  }, [handleNoteOn, handleNoteOff, isPlayingMelody]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const keyData = PIANO_KEYS.find(k => k.keyboardShortcut === e.key.toLowerCase());
      if (keyData) {
        handleNoteOn(keyData.note, keyData.frequency);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyData = PIANO_KEYS.find(k => k.keyboardShortcut === e.key.toLowerCase());
      if (keyData) {
        handleNoteOff(keyData.note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleNoteOn, handleNoteOff]);

  useEffect(() => {
    audioEngine.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    audioEngine.setInstrument(instrument);
  }, [instrument]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 p-4 md:p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Gemini Virtuoso
          </h1>
          <p className="text-slate-400 text-sm">Interactive Synth & AI Music Tutor</p>
        </div>
        
        <div className="flex gap-4 items-center bg-slate-900/50 p-2 rounded-xl border border-slate-800">
           <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1">Instrument</label>
            <select 
              value={instrument}
              onChange={(e) => setInstrument(e.target.value as InstrumentType)}
              className="bg-slate-800 text-sm rounded px-2 py-1 outline-none border border-slate-700 hover:border-cyan-500 transition-colors"
            >
              <option value="sine">Sine (Pure)</option>
              <option value="square">Square (Chiptune)</option>
              <option value="sawtooth">Sawtooth (Edgy)</option>
              <option value="triangle">Triangle (Warm)</option>
            </select>
           </div>
           
           <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1">Volume</label>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
           </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col gap-6 lg:flex-row h-full">
        {/* Piano Section */}
        <div className="flex-1 flex flex-col bg-slate-900/40 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isPlayingMelody ? 'bg-amber-500 animate-ping' : 'bg-cyan-500 animate-pulse'}`}></span>
              Performance Stage
            </h2>
            <div className="text-xs text-slate-500">
              Use your keyboard (A-L, W-P) to play
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-4 md:p-12 overflow-x-auto">
            <div className="relative flex piano-container h-80 min-w-[800px] shadow-2xl rounded-lg overflow-hidden border-2 border-slate-800">
              {PIANO_KEYS.map((key) => (
                <PianoKey 
                  key={key.note}
                  data={key}
                  isActive={activeNotes.has(key.note)}
                  isHighlighted={highlightedNotes.includes(key.note)}
                  onDown={() => handleNoteOn(key.note, key.frequency)}
                  onUp={() => handleNoteOff(key.note)}
                />
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex gap-2 overflow-x-auto">
            <span className="text-xs text-slate-500 py-1 px-2">Recent Notes:</span>
            {Array.from(activeNotes).map(note => (
              <span key={note} className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded border border-cyan-500/30">
                {note}
              </span>
            ))}
          </div>
        </div>

        {/* AI Assistant Sidebar */}
        <Assistant 
          isOpen={chatOpen} 
          onToggle={() => setChatOpen(!chatOpen)}
          onHighlightNotes={(notes) => setHighlightedNotes(notes)}
          onPlayMelody={playMelody}
          isPlaying={isPlayingMelody}
        />
      </main>

      <footer className="mt-8 text-center text-slate-600 text-xs">
        Crafted with ❤️ for musicians and dreamers. Powered by Gemini.
      </footer>
    </div>
  );
};

export default App;
