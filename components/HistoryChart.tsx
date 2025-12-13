import React, { useMemo } from 'react';
import { getWorkoutLogs } from '../services/storageService';
import { ExerciseSet } from '../types';
import { Trophy, TrendingUp, Target, ArrowUp, Lock } from 'lucide-react';

const TRACKED_EXERCISES = [
  { id: 'bp', name: 'Bench Press', short: 'Bench', milestoneStep: 20 }, // 60, 80, 100
  { id: 'sq', name: 'Squat', short: 'Squat', milestoneStep: 20 },
  { id: 'dl', name: 'Deadlift', short: 'Deadlift', milestoneStep: 20 },
  { id: 'ohp', name: 'Overhead Press', short: 'OHP', milestoneStep: 10 }
];

export const HistoryChart: React.FC = () => {
  const logs = getWorkoutLogs();

  const stats = useMemo(() => {
    return TRACKED_EXERCISES.map(ex => {
      // Get all logs for this exercise
      const exerciseLogs = logs
        .filter(log => log.exercises && log.exercises[ex.id])
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      let currentMax = 0;
      let lastWeekMax = 0;
      let totalSets = 0;

      if (exerciseLogs.length > 0) {
        // Current Max (Last Session)
        const lastSession = exerciseLogs[exerciseLogs.length - 1];
        const lastSets = lastSession.exercises[ex.id] as ExerciseSet[];
        const validSets = lastSets.filter(s => s.completed && s.weight > 0);
        if (validSets.length > 0) {
           currentMax = Math.max(...validSets.map(s => s.weight));
        }

        // Previous Max (Session before last)
        if (exerciseLogs.length > 1) {
             const prevSession = exerciseLogs[exerciseLogs.length - 2];
             const prevSets = prevSession.exercises[ex.id] as ExerciseSet[];
             const validPrevSets = prevSets.filter(s => s.completed && s.weight > 0);
             if (validPrevSets.length > 0) {
                 lastWeekMax = Math.max(...validPrevSets.map(s => s.weight));
             }
        }
        
        // Total Sets All Time
        exerciseLogs.forEach(l => {
             const s = l.exercises[ex.id] as ExerciseSet[];
             totalSets += s.filter(x => x.completed).length;
        });
      }

      // Progression Logic
      const nextTarget = currentMax > 0 ? currentMax + 2.5 : 20; // Default start 20kg
      const nextMilestone = (Math.floor(currentMax / ex.milestoneStep) + 1) * ex.milestoneStep;
      const progressPercent = currentMax > 0 
        ? Math.min(100, Math.max(5, ((currentMax - (nextMilestone - ex.milestoneStep)) / ex.milestoneStep) * 100))
        : 0;

      return {
        ...ex,
        currentMax,
        lastWeekMax,
        nextTarget,
        nextMilestone,
        progressPercent,
        totalSets,
        hasData: exerciseLogs.length > 0
      };
    });
  }, [logs]);

  return (
    <div className="space-y-4">
      {stats.map((stat) => (
        <div key={stat.id} className="relative overflow-hidden bg-black rounded-3xl border border-zinc-800 p-5 group">
             {/* Background Gradient */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-800/20 blur-3xl rounded-full -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors duration-500"></div>

             <div className="relative z-10">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${stat.hasData ? 'bg-zinc-900 text-white' : 'bg-zinc-900/50 text-zinc-600'}`}>
                            <Trophy size={20} className={stat.hasData ? 'text-yellow-500' : 'opacity-20'} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white leading-none">{stat.name}</h3>
                            <p className="text-xs text-zinc-500 mt-1">{stat.totalSets} Set tamamlandı</p>
                        </div>
                    </div>
                    {stat.hasData && stat.currentMax > stat.lastWeekMax && (
                        <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-lg">
                            <TrendingUp size={14} />
                            <span className="text-xs font-bold">+{stat.currentMax - stat.lastWeekMax}kg</span>
                        </div>
                    )}
                </div>

                {stat.hasData ? (
                    <>
                        {/* Main Numbers */}
                        <div className="flex items-end gap-1 mb-4">
                             <div className="flex-1">
                                <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">Şu Anki Max</p>
                                <p className="text-3xl font-bold text-white">{stat.currentMax} <span className="text-sm font-medium text-zinc-600">kg</span></p>
                             </div>
                             <div className="flex-1 border-l border-zinc-800 pl-4">
                                <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider mb-1 flex items-center gap-1">
                                    <Target size={10} /> Sıradaki Hedef
                                </p>
                                <p className="text-3xl font-bold text-emerald-500">{stat.nextTarget} <span className="text-sm font-medium text-emerald-500/50">kg</span></p>
                             </div>
                        </div>

                        {/* Milestone Progress Bar */}
                        <div className="mt-4">
                            <div className="flex justify-between text-xs font-bold text-zinc-500 mb-2">
                                <span>İlerleme</span>
                                <span className="text-white">{stat.nextMilestone} kg Kilidi</span>
                            </div>
                            <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50 relative">
                                <div 
                                    className="h-full bg-gradient-to-r from-blue-600 to-primary rounded-full transition-all duration-1000"
                                    style={{ width: `${stat.progressPercent}%` }}
                                ></div>
                            </div>
                            <p className="text-[10px] text-zinc-600 mt-1.5 text-right">
                                {stat.nextMilestone} kg hedefine %{Math.round(stat.progressPercent)} yaklaştın
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="py-4 flex flex-col items-center justify-center text-zinc-600 gap-2 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                         <Lock size={18} />
                         <span className="text-xs">Veri yok. Antrenman yapınca açılacak.</span>
                    </div>
                )}
             </div>
        </div>
      ))}
    </div>
  );
};