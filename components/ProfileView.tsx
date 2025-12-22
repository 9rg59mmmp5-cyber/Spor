
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, User, Clock, Trophy, Settings2, Timer } from 'lucide-react';
import { getWorkoutLogs, getUserSettings, saveUserSettings } from '../services/storageService';
import { UserSettings } from '../types';

export const ProfileView: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(getUserSettings());
  const [workoutDates, setWorkoutDates] = useState<Set<string>>(new Set());
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const userSettings = getUserSettings();
    setSettings(userSettings);

    const logs = getWorkoutLogs();
    const dates = new Set(logs.map(l => l.date));
    setWorkoutDates(dates);
  }, []);

  const handleSaveSettings = () => {
    saveUserSettings(settings);
    setEditMode(false);
  };

  const renderCalendar = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
    
    // Adjust for Monday start (Turkey standard)
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    
    const days = [];
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isWorkoutDay = workoutDates.has(dateStr);
      const isToday = d === today.getDate();

      days.push(
        <div key={d} className="aspect-square flex items-center justify-center relative">
          <div 
            className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium transition-all
              ${isWorkoutDay ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'text-slate-400'}
              ${isToday && !isWorkoutDay ? 'border border-primary text-primary' : ''}
            `}
          >
            {d}
          </div>
        </div>
      );
    }

    return days;
  };

  const getDaysRemaining = () => {
    if (!settings.membershipEndDate) return null;
    const end = new Date(settings.membershipEndDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const remainingDays = getDaysRemaining();

  return (
    <div className="p-4 pb-24 space-y-6 animate-in fade-in">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center shadow-xl">
          <User size={32} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Profilim</h2>
          <p className="text-slate-400 text-sm">Sporcu</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={18} className="text-yellow-500" />
            <span className="text-xs text-slate-400 uppercase">Toplam</span>
          </div>
          <p className="text-2xl font-bold text-white">{workoutDates.size}</p>
          <p className="text-xs text-slate-500">Antrenman</p>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
           <div className="flex items-center gap-2 mb-2">
            <CalendarIcon size={18} className="text-emerald-500" />
            <span className="text-xs text-slate-400 uppercase">Bu Ay</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {[...workoutDates].filter(d => d.startsWith(new Date().toISOString().slice(0,7))).length}
          </p>
          <p className="text-xs text-slate-500">Gün</p>
        </div>
      </div>

      {/* Antrenman Ayarları (YENİ) */}
      <div className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800 shadow-lg">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold flex items-center gap-2">
                <Settings2 size={18} className="text-primary" />
                Antrenman Ayarları
            </h3>
        </div>
        
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-widest">Set Arası Dinlenme (sn)</label>
                <div className="flex items-center gap-3">
                    <Timer size={16} className="text-zinc-600" />
                    <input 
                        type="number"
                        inputMode="numeric"
                        value={settings.restBetweenSets || 90}
                        onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            const newSettings = {...settings, restBetweenSets: val};
                            setSettings(newSettings);
                            saveUserSettings(newSettings);
                        }}
                        className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono focus:border-primary outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-widest">Hareket Arası Dinlenme (sn)</label>
                <div className="flex items-center gap-3">
                    <Timer size={16} className="text-zinc-600" />
                    <input 
                        type="number"
                        inputMode="numeric"
                        value={settings.restBetweenExercises || 120}
                        onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            const newSettings = {...settings, restBetweenExercises: val};
                            setSettings(newSettings);
                            saveUserSettings(newSettings);
                        }}
                        className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono focus:border-primary outline-none"
                    />
                </div>
            </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800 shadow-lg">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <CalendarIcon size={18} className="text-primary" />
          Antrenman Takvimi
        </h3>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
            <div key={d} className="text-[10px] text-slate-500 uppercase font-bold">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {renderCalendar()}
        </div>
      </div>

      {/* Membership Settings */}
      <div className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            Üyelik Durumu
          </h3>
          <button 
            onClick={() => editMode ? handleSaveSettings() : setEditMode(true)}
            className="text-xs text-primary font-bold px-3 py-1 bg-primary/10 rounded-full"
          >
            {editMode ? 'Kaydet' : 'Düzenle'}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-widest">Bitiş Tarihi</label>
            {editMode ? (
              <input 
                type="date" 
                value={settings.membershipEndDate || ''}
                onChange={(e) => setSettings({...settings, membershipEndDate: e.target.value})}
                className="w-full bg-black text-white px-4 py-3 rounded-xl border border-zinc-800 focus:outline-none focus:border-primary"
              />
            ) : (
              <div className="text-white font-bold bg-black/50 p-3 rounded-xl border border-zinc-800">
                {settings.membershipEndDate ? new Date(settings.membershipEndDate).toLocaleDateString('tr-TR') : 'Belirtilmedi'}
              </div>
            )}
          </div>

          {remainingDays !== null && (
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              remainingDays < 7 ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'
            }`}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Kalan Süre</p>
                <p className={`text-2xl font-black ${remainingDays < 7 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {remainingDays} Gün
                </p>
              </div>
              {remainingDays < 7 && (
                <div className="text-red-400 text-[10px] font-black px-3 py-1.5 bg-red-500/20 rounded-lg uppercase tracking-wider">
                  YENİLE
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
