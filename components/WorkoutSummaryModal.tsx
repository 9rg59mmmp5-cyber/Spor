
import React from 'react';
import { Trophy, Clock, Dumbbell, Repeat, CheckCircle2 } from 'lucide-react';
import { WorkoutLog } from '../types';
import { DEFAULT_PROGRAM } from '../constants';
import { getProgram } from '../services/storageService';

interface Props {
  log: WorkoutLog;
  onClose: () => void;
}

export const WorkoutSummaryModal: React.FC<Props> = ({ log, onClose }) => {
  const program = getProgram();
  const dayName = program.find(d => d.id === log.dayId)?.name || 'Antrenman';
  
  const formatTime = (seconds?: number) => {
    if (!seconds) return '0dk';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}sa ${m}dk`;
    return `${m}dk`;
  };

  const getExerciseName = (id: string) => {
    const currentProgram = getProgram();
    for (const day of currentProgram) {
        const ex = day.exercises.find(e => e.id === id);
        if (ex) return ex.name;
    }
    return id;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-[#1C1C1E] rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
        
        {/* Header with Animation */}
        <div className="relative h-32 bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 flex flex-col items-center justify-center border-b border-white/5">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-3 animate-in zoom-in duration-500 delay-100">
            <CheckCircle2 size={32} className="text-black" strokeWidth={3} />
          </div>
          <h2 className="text-white font-bold text-xl relative z-10">Antrenman Tamamlandı!</h2>
        </div>

        {/* Main Stats Grid */}
        <div className="p-6 space-y-6">
            <div className="text-center">
                <p className="text-slate-400 text-sm uppercase tracking-wider font-bold mb-1">PROGRAM</p>
                <p className="text-white text-2xl font-bold">{dayName}</p>
                <p className="text-slate-500 text-xs mt-1">{new Date(log.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="bg-black/40 p-3 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-1">
                    <Clock size={18} className="text-blue-500 mb-1" />
                    <span className="text-white font-bold text-lg">{formatTime(log.duration)}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Süre</span>
                </div>
                <div className="bg-black/40 p-3 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-1">
                    <Dumbbell size={18} className="text-purple-500 mb-1" />
                    <span className="text-white font-bold text-lg">{(log.totalVolume || 0).toLocaleString()}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Kg Hacim</span>
                </div>
                <div className="bg-black/40 p-3 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-1">
                    <Repeat size={18} className="text-orange-500 mb-1" />
                    <span className="text-white font-bold text-lg">{log.totalSets || 0}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Set</span>
                </div>
            </div>

            {/* PR Section */}
            {log.prs && log.prs.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Trophy size={18} className="text-yellow-500" />
                        <span className="text-yellow-500 font-bold text-sm uppercase tracking-wide">Yeni Rekorlar!</span>
                    </div>
                    <div className="space-y-2">
                        {log.prs.map(id => (
                            <div key={id} className="flex items-center gap-2 text-sm text-slate-200">
                                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                                {getExerciseName(id)}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-black/40 border-t border-white/5 flex gap-3">
            <button 
                onClick={onClose}
                className="flex-1 bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all active:scale-95"
            >
                Harika
            </button>
        </div>
      </div>
    </div>
  );
};
