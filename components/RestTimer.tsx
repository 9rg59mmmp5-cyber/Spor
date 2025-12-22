
import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Timer } from 'lucide-react';
import { playTimerFinishedSound, triggerHaptic } from '../utils/audio';

interface Props {
  targetTime: number; // Timestamp when timer ends
  onDismiss: () => void;
  onAddSeconds: (seconds: number) => void;
}

export const RestTimer: React.FC<Props> = ({ targetTime, onDismiss, onAddSeconds }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.ceil((targetTime - now) / 1000);
      
      if (diff <= 0) {
        if (!isFinished) {
            setIsFinished(true);
            playTimerFinishedSound();
            triggerHaptic(500);
        }
        setTimeLeft(0);
      } else {
        setTimeLeft(diff);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [targetTime, isFinished]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`fixed bottom-20 left-4 right-4 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-3 z-50 flex items-center justify-between animate-in slide-in-from-bottom-4 duration-300 ${isFinished ? 'ring-2 ring-red-500 bg-red-900/20' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${isFinished ? 'bg-red-500 animate-pulse' : 'bg-primary'}`}>
            <Timer size={20} className="text-white" />
        </div>
        <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Dinlenme</p>
            <p className="text-xl font-mono font-bold text-white">{formatTime(timeLeft)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
            onClick={() => onAddSeconds(-10)}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
        >
            <Minus size={16} />
        </button>
        <button 
            onClick={() => onAddSeconds(30)}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
        >
            <Plus size={16} />
        </button>
        <div className="w-px h-8 bg-slate-700 mx-1"></div>
        <button 
            onClick={onDismiss}
            className="p-2 bg-slate-700 hover:bg-red-900/50 hover:text-red-400 rounded-lg text-slate-300 transition-colors"
        >
            <X size={16} />
        </button>
      </div>
    </div>
  );
};
