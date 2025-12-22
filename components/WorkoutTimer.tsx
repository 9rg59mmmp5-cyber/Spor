import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface Props {
  startTime: number;
}

export const WorkoutTimer: React.FC<Props> = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const update = () => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    };
    
    update();
    const interval = setInterval(update, 1000);
    
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
      <Timer size={14} className="text-primary animate-pulse" />
      <span className="font-mono font-medium text-white text-sm tracking-wider min-w-[48px] text-center">
        {formatTime(elapsed)}
      </span>
    </div>
  );
};
