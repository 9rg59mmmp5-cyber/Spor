
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getWorkoutLogs } from '../services/storageService';
import { ExerciseSet } from '../types';

interface Props {
  exerciseId: string;
  exerciseName: string;
}

export const ExerciseProgressChart: React.FC<Props> = ({ exerciseId, exerciseName }) => {
  const logs = getWorkoutLogs();

  const data = logs
    .filter(log => log.exercises && log.exercises[exerciseId])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(log => {
      const sets = log.exercises[exerciseId] as ExerciseSet[];
      const completedSets = sets.filter(s => s.completed);
      
      if (completedSets.length === 0) return null;

      // Calculate max weight lifted in this session
      const maxWeight = Math.max(...completedSets.map(s => s.weight));
      // Calculate total volume
      const volume = completedSets.reduce((acc, s) => acc + (s.weight * s.reps), 0);

      return {
        date: new Date(log.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
        weight: maxWeight,
        volume: volume
      };
    })
    .filter(Boolean)
    .slice(-10); // Last 10 sessions

  if (data.length < 2) {
    return (
      <div className="p-4 text-center text-slate-500 text-xs bg-slate-900/50 rounded-xl border border-dashed border-slate-700">
        Grafik için en az 2 antrenman verisi gerekiyor.
      </div>
    );
  }

  return (
    <div className="h-40 w-full mt-2">
      <p className="text-xs text-slate-400 mb-2 text-center">Maksimum Ağırlık Gelişimi</p>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`colorWeight-${exerciseId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#64748b" 
            fontSize={10} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={10} 
            tickLine={false}
            axisLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
            itemStyle={{ color: '#38bdf8' }}
          />
          <Area 
            type="monotone" 
            dataKey="weight" 
            stroke="#0ea5e9" 
            strokeWidth={2} 
            fillOpacity={1} 
            fill={`url(#colorWeight-${exerciseId})`} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
