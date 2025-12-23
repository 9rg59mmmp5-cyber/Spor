
import React, { useMemo } from 'react';
import { getWorkoutLogs } from '../services/storageService';
import { ExerciseSet } from '../types';
import { Trophy, Target, TrendingUp, Lock, ArrowRight, Zap } from 'lucide-react';

const TRACKED_EXERCISES = [
  { id: 'bp-raw', name: 'Bench Press', milestone: 100 },
  { id: 'sq', name: 'Squat', milestone: 140 },
  { id: 'dl', name: 'Deadlift', milestone: 180 },
  { id: 'ohp-raw', name: 'Overhead Press', milestone: 60 }
];

export const HistoryChart: React.FC = () => {
  const logs = getWorkoutLogs();

  const stats = useMemo(() => {
    return TRACKED_EXERCISES.map(ex => {
      const exerciseLogs = logs
        .filter(log => log.exercises && log.exercises[ex.id])
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      let currentMax = 0;
      let prevMax = 0;

      if (exerciseLogs.length > 0) {
        const lastSets = exerciseLogs[exerciseLogs.length - 1].exercises[ex.id] as ExerciseSet[];
        currentMax = Math.max(...lastSets.filter(s => s.completed).map(s => s.weight), 0);

        if (exerciseLogs.length > 1) {
          const prevSets = exerciseLogs[exerciseLogs.length - 2].exercises[ex.id] as ExerciseSet[];
          prevMax = Math.max(...prevSets.filter(s => s.completed).map(s => s.weight), 0);
        }
      }

      const nextTarget = currentMax > 0 ? currentMax + 2.5 : 20;
      const progress = Math.min(100, Math.round((currentMax / ex.milestone) * 100));

      return { ...ex, currentMax, prevMax, nextTarget, progress, hasData: exerciseLogs.length > 0 };
    });
  }, [logs]);

  return (
    <div className="space-y-6">
      <div className="bg-primary/10 border border-primary/20 rounded-3xl p-5 flex items-center gap-4">
         <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Zap size={24} fill="currentColor" />
         </div>
         <div>
            <h3 className="text-white font-bold text-base">Güç Analizi</h3>
            <p className="text-zinc-500 text-xs">Ağırlıkları her hafta 2.5kg artırmaya odaklan.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {stats.map(stat => (
          <div key={stat.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 overflow-hidden relative group">
             {stat.hasData ? (
               <>
                 <div className="flex justify-between items-start mb-4">
                    <div>
                        <h4 className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.name}</h4>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-white">{stat.currentMax}</span>
                            <span className="text-sm text-zinc-600 font-bold">kg</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs bg-emerald-500/10 px-2 py-1 rounded-lg">
                            <Target size={12} />
                            Hedef: {stat.nextTarget}kg
                        </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-zinc-500">{stat.milestone}kg Hedefine İlerleme</span>
                        <span className="text-primary">%{stat.progress}</span>
                    </div>
                    <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-zinc-800">
                        <div 
                            className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(10,132,255,0.5)]"
                            style={{ width: `${stat.progress}%` }}
                        ></div>
                    </div>
                 </div>

                 <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center">
                    <p className="text-[10px] text-zinc-500 font-medium italic">
                        {stat.currentMax >= stat.prevMax ? "Gelişim devam ediyor! 🔥" : "Dinlen ve tekrar dene."}
                    </p>
                    <ArrowRight size={14} className="text-zinc-700" />
                 </div>
               </>
             ) : (
               <div className="py-6 flex flex-col items-center justify-center text-zinc-700 gap-2">
                  <Lock size={20} className="opacity-20" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">{stat.name} Verisi Bekleniyor</span>
               </div>
             )}
          </div>
        ))}
      </div>
    </div>
  );
};
