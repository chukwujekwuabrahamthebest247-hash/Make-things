import React from 'react';

interface PianoKeyProps {
  data: {
    note: string;
    frequency: number;
    keyboardShortcut: string;
    isBlack?: boolean;
  };
  isActive: boolean;
  isHighlighted: boolean;
  onDown: () => void;
  onUp: () => void;
}

const PianoKey: React.FC<PianoKeyProps> = ({
  data,
  isActive,
  isHighlighted,
  onDown,
  onUp
}) => {
  const { note, keyboardShortcut, isBlack = false } = data;

  const keyClass = isBlack
    ? `absolute top-0 w-7 h-48 bg-slate-900 border border-slate-700 rounded-b-lg z-10 transition-all duration-100 ${
        isActive ? 'bg-slate-800 h-46' : ''
      } ${isHighlighted ? 'ring-2 ring-yellow-400' : ''}`
    : `flex-1 h-64 bg-white border border-slate-300 rounded-b-lg transition-all duration-100 ${
        isActive ? 'bg-slate-200 h-62' : ''
      } ${isHighlighted ? 'ring-2 ring-yellow-400 shadow-lg' : ''}`;
  
return (
    <div
      className={`${keyClass} relative cursor-pointer select-none`}
      onMouseDown={onDown}
      onMouseUp={onUp}
      onMouseLeave={onUp}
      onTouchStart={(e) => {
        e.preventDefault();
        onDown();
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        onUp();
      }}
    >
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-slate-500">
        <div className="font-semibold">{note}</div>
        <div className="text-xs mt-1 bg-slate-100 px-1 rounded">{keyboardShortcut}</div>
      </div>
    </div>
  );
};

export default PianoKey;
