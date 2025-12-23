
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { WorkoutLog } from '../types';
import { Dumbbell, Clock, CalendarDays, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  logs: WorkoutLog[];
}

export const StatsOverview: React.FC<Props> = ({ logs }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Geçen ayın tarihi
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastYear = lastMonthDate.getFullYear();

    const currentLogs = logs.filter(l => {
        const d = new Date(l.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const lastLogs = logs.filter(l => {
        const d = new Date(l.date);
        return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
    });

    const calculateStats = (data: WorkoutLog[]) => ({
        count: data.length,
        volume: data.reduce((acc, curr) => acc + (curr.totalVolume || 0), 0),
        duration: data.reduce((acc, curr) => acc + (curr.duration || 0), 0)
    });

    const curr = calculateStats(currentLogs);
    const prev = calculateStats(lastLogs);

    return { curr, prev };
  }, [logs]);

  // Chart Data: Last 7 workouts reversed to show oldest to newest
  const chartData = useMemo(() => {
      return [...logs]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 7)
        .reverse()
        .map(log => ({
            date: new Date(log.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
            volume: log.totalVolume || 0,
            day: log.dayId
        }));
  }, [logs]);

  const getTrend = (curr: number, prev: number) => {
    if (prev === 0) return { icon: <Minus size={12} />, color: 'text-zinc-500', text: 'Veri yok' };
    const diff = ((curr - prev) / prev) * 100;
    if (diff > 0) return { icon: <TrendingUp size={12} />, color: 'text-emerald-400', text: `%${diff.toFixed(0)} Artış` };
    if (diff < 0) return { icon: <TrendingDown size={12} />, color: 'text-red-400', text: `%${Math.abs(diff).toFixed(0)} Düşüş` };
    return { icon: <Minus size={12} />, color: 'text-zinc-500', text: 'Değişim yok' };
  };

  const StatCard = ({ title, value, subValue, icon, trend, suffix }: any) => (
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                  {icon}
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold ${trend.color} bg-black/40 px-2 py-1 rounded-full`}>
                  {trend.icon} {trend.text}
              </div>
          </div>
          <div>
              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">{title}</p>
              <h4 className="text-2xl font-black text-white mt-0.5">{value}<span className="text-sm text-zinc-600 ml-1">{suffix}</span></h4>
          </div>
      </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <StatCard 
                title="Antrenman" 
                value={stats.curr.count} 
                suffix="Adet"
                icon={<CalendarDays size={18} />}
                trend={getTrend(stats.curr.count, stats.prev.count)}
            />
            <StatCard 
                title="Toplam Hacim" 
                value={(stats.curr.volume / 1000).toFixed(1)} 
                suffix="Ton"
                icon={<Dumbbell size={18} />}
                trend={getTrend(stats.curr.volume, stats.prev.volume)}
            />
            <StatCard 
                title="Süre" 
                value={(stats.curr.duration / 3600).toFixed(1)} 
                suffix="Saat"
                icon={<Clock size={18} />}
                trend={getTrend(stats.curr.duration, stats.prev.duration)}
            />
        </div>

        {/* Volume Trend Chart */}
        {chartData.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
                <div className="mb-6">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <TrendingUp size={18} className="text-primary" />
                        Hacim Trendi
                    </h3>
                    <p className="text-zinc-500 text-xs mt-1">Son 7 antrenmandaki toplam kaldırılan yük.</p>
                </div>
                
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#71717a', fontSize: 10}} 
                                dy={10}
                            />
                            <Tooltip 
                                cursor={{fill: '#27272a', opacity: 0.4}}
                                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(val: number) => [`${val.toLocaleString()} kg`, 'Hacim']}
                            />
                            <Bar dataKey="volume" radius={[4, 4, 4, 4]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#0A84FF' : '#3f3f46'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )}
    </div>
  );
};
