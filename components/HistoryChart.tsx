
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getWorkoutLogs } from '../services/storageService';
import { WEEKLY_PROGRAM } from '../constants';
import { ExerciseSet } from '../types';

export const HistoryChart: React.FC = () => {
  const logs = getWorkoutLogs();

  const data = logs
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7)
    .map(log => {
      let volume = 0;
      const exercises = log.exercises;
      const exerciseSetsList = Object.values(exercises) as ExerciseSet[][];
      
      exerciseSetsList.forEach(sets => {
        sets.forEach(set => {
          if (set.completed) {
             volume += (set.weight || 0) * (set.reps || 0);
          }
        });
      });
      
      const dayName = WEEKLY_PROGRAM.find(d => d.id === log.dayId)?.name.substring(0,3) || log.dayId;
      
      return {
        name: `${dayName} ${new Date(log.date).getDate()}`,
        volume: Math.round(volume / 1000)
      };
    });

  if (data.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-slate-500">
        <p className="text-sm">Henüz veri yok.</p>
      </div>
    );
  }

  return (
    <div className="h-52 w-full bg-slate-900/50 pt-4 pr-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#475569" 
            fontSize={10} 
            tick={{dy: 10}} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            stroke="#475569" 
            fontSize={10} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }} 
            itemStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
            formatter={(value: number) => [`${value} Ton`, '']}
            labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '2px' }}
            cursor={{ stroke: '#38bdf8', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Area 
            type="monotone" 
            dataKey="volume" 
            stroke="#0ea5e9" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorVolume)" 
            activeDot={{ r: 6, strokeWidth: 3, stroke: '#fff', fill: '#0ea5e9' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
