import React, { useState, useCallback } from 'react';

interface AssistantProps {
  isOpen: boolean;
  onToggle: () => void;
  onHighlightNotes: (notes: string[]) => void;
  onPlayMelody: (notes: string[]) => Promise<void>;
  isPlaying: boolean;
}

const Assistant: React.FC<AssistantProps> = ({
  isOpen,
  onToggle,
  onHighlightNotes,
  onPlayMelody,
  isPlaying
}) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;

    setMessages(prev => [...prev, `You: ${inputText}`]);
    
    // Simple auto-response for demo
    setTimeout(() => {
      setMessages(prev => [...prev, 'AI: Try pressing A, S, D, F, G to play notes!']);
    }, 500);
    
    setInputText('');
  }, [inputText]);
    if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-4 top-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 z-50"
      >
        Open Assistant
      </button>
    );
  }

  return (
    <div className="w-full lg:w-96 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          AI Music Assistant
        </h3>
        <button
          onClick={onToggle}
          className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-96">
        {messages.length === 0 ? (
      <div className="text-center text-slate-500 py-8">
            <p className="mb-4">Ask me about music theory!</p>
            <div className="space-y-2 text-sm">
              <p>"Play C major scale"</p>
              <p>"What notes are in a C chord?"</p>
              <p>"Show me the black keys"</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="text-sm">
              {msg}
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/60">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question..."
            className="flex-1 bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none text-sm"
            disabled={isPlaying}
          />
          <button
            onClick={handleSend}
            disabled={isPlaying || !inputText.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
