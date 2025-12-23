import React, { useState, useMemo } from 'react';
import { Search, Trophy, ChevronDown, ChevronUp, Dumbbell, History } from 'lucide-react';
import { WorkoutLog, WorkoutDay, ExerciseSet } from '../types';
import { ExerciseProgressChart } from './ExerciseProgressChart';

interface Props {
  logs: WorkoutLog[];
  program: WorkoutDay[];
}

export const ExerciseAnalysisList: React.FC<Props> = ({ logs, program }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 1. Programdan ID -> İsim eşleşmesi oluştur
  const exerciseNames = useMemo(() => {
    const map: { [id: string]: string } = {};
    program.forEach(day => {
      day.exercises.forEach(ex => {
        map[ex.id] = ex.name;
      });
    });
    return map;
  }, [program]);

  // 2. Loglardan hareket istatistiklerini çıkar
  const exerciseStats = useMemo(() => {
    const stats: { [id: string]: { maxWeight: number, lastWeight: number, totalSets: number, name: string } } = {};

    logs.forEach(log => {
      Object.entries(log.exercises).forEach(([exId, sets]) => {
        if (!stats[exId]) {
          stats[exId] = { 
            maxWeight: 0, 
            lastWeight: 0, 
            totalSets: 0, 
            name: exerciseNames[exId] || exId // İsim programda yoksa ID kullan
          };
        }

        const validSets = (sets as ExerciseSet[]).filter(s => s.completed);
        if (validSets.length > 0) {
          const sessionMax = Math.max(...validSets.map(s => s.weight));
          if (sessionMax > stats[exId].maxWeight) {
            stats[exId].maxWeight = sessionMax;
          }
          stats[exId].totalSets += validSets.length;
          
          // Loglar tarihe göre sıralı geldiği için (yeni->eski veya eski->yeni dışarıdan kontrol edilmeli)
          // Burada basitlik için en son işlenen logu "son ağırlık" kabul edebiliriz ama
          // App.tsx'de loglar tarihe göre sıralı. 
        }
      });
    });

    // Filtreleme ve Sıralama
    return Object.entries(stats)
      .map(([id, stat]) => ({ id, ...stat }))
      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => b.maxWeight - a.maxWeight); // En yüksek ağırlığa göre sırala
  }, [logs, exerciseNames, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <History size={20} className="text-primary" />
            Hareket Gelişimi
          </h3>
          <span className="text-xs text-zinc-500 font-bold bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
            {exerciseStats.length} Hareket
          </span>
      </div>

      {/* Arama Barı */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
        <input 
          type="text" 
          placeholder="Hareket ara..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 text-sm font-medium transition-all"
        />
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {exerciseStats.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs">
            Kriterlere uygun hareket bulunamadı.
          </div>
        ) : (
          exerciseStats.map((stat) => (
            <div key={stat.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300">
              <button 
                onClick={() => setExpandedId(expandedId === stat.id ? null : stat.id)}
                className={`w-full p-4 flex items-center justify-between transition-colors ${expandedId === stat.id ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}
              >
                <div className="flex items-center gap-3 text-left">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${expandedId === stat.id ? 'bg-primary text-white' : 'bg-zinc-950 text-zinc-600'}`}>
                    <Dumbbell size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{stat.name}</h4>
                    <div className="flex gap-3 mt-1">
                      <span className="text-[10px] text-zinc-400 font-bold bg-black/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Trophy size={10} className="text-yellow-500" /> Max: {stat.maxWeight}kg
                      </span>
                      <span className="text-[10px] text-zinc-500 font-bold">
                        Toplam {stat.totalSets} Set
                      </span>
                    </div>
                  </div>
                </div>
                {expandedId === stat.id ? <ChevronUp size={20} className="text-zinc-400" /> : <ChevronDown size={20} className="text-zinc-600" />}
              </button>

              {expandedId === stat.id && (
                <div className="p-4 bg-black/20 border-t border-zinc-800 animate-in slide-in-from-top-2">
                   <ExerciseProgressChart exerciseId={stat.id} exerciseName={stat.name} />
                   <div className="mt-2 text-center">
                     <p className="text-[10px] text-zinc-500">Bu grafik, bu hareketteki maksimum ağırlık gelişimini gösterir.</p>
                   </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};