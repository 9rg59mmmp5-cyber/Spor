
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, User, Clock, Trophy, Settings2, Timer, Zap, Activity, Dumbbell, PowerOff } from 'lucide-react';
import { getWorkoutLogs, getUserSettings, saveUserSettings } from '../services/storageService';
import { UserSettings } from '../types';

const SCIENTIFIC_PRESETS = [
  { label: 'Kapalı', val: 0, icon: <PowerOff size={14} className="text-red-400" /> },
  { label: 'Metabolik', val: 45, icon: <Activity size={14} className="text-blue-400" /> },
  { label: 'Hipertrofi', val: 90, icon: <Dumbbell size={14} className="text-emerald-400" /> },
  { label: 'Maks. Güç', val: 180, icon: <Zap size={14} className="text-yellow-400" /> },
];

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

  const updateSetting = (key: keyof UserSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveUserSettings(newSettings);
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
    <div className="pt-14 px-5 pb-24 space-y-6 animate-in fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-black">Ayarlar</h1>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Uygulama Tercihleri</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={18} className="text-yellow-500" />
            <span className="text-xs text-slate-400 uppercase">Toplam</span>
          </div>
          <p className="text-xl font-bold text-white">{workoutDates.size}</p>
          <p className="text-xs text-slate-500">Antrenman</p>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
           <div className="flex items-center gap-2 mb-2">
            <CalendarIcon size={18} className="text-emerald-500" />
            <span className="text-xs text-slate-400 uppercase">Bu Ay</span>
          </div>
          <p className="text-xl font-bold text-white">
            {[...workoutDates].filter(d => d.startsWith(new Date().toISOString().slice(0,7))).length}
          </p>
          <p className="text-xs text-slate-500">Gün</p>
        </div>
      </div>

      {/* Antrenman Ayarları (YENİLENMİŞ & BİLİMSEL) */}
      <div className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800 shadow-lg">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold flex items-center gap-2">
                <Settings2 size={18} className="text-primary" />
                Dinlenme Süreleri
            </h3>
        </div>
        
        <div className="space-y-6">
            {/* Set Arası Dinlenme */}
            <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800/50">
                <label className="block text-xs font-bold text-zinc-400 mb-3 uppercase tracking-widest flex items-center justify-between">
                    <span>Set Arası Dinlenme</span>
                    <span className="text-primary">{(settings.restBetweenSets === 0 || settings.restBetweenSets === undefined) ? 'KAPALI' : `${settings.restBetweenSets} sn`}</span>
                </label>
                
                <div className="flex items-center gap-3 mb-4">
                    <Timer size={24} className="text-zinc-500" />
                    <input 
                        type="number"
                        inputMode="numeric"
                        min="0"
                        placeholder="Örn: 90 (0 = Kapalı)"
                        value={settings.restBetweenSets === undefined ? '' : settings.restBetweenSets}
                        onChange={(e) => {
                            const val = e.target.value === '' ? undefined : parseInt(e.target.value);
                            updateSetting('restBetweenSets', val);
                        }}
                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white font-mono text-base font-bold focus:border-primary outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SCIENTIFIC_PRESETS.map((preset) => (
                        <button
                            key={preset.label}
                            onClick={() => updateSetting('restBetweenSets', preset.val)}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-bold border transition-all active:scale-95 ${
                                settings.restBetweenSets === preset.val 
                                ? 'bg-primary/20 border-primary text-white' 
                                : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:bg-zinc-700'
                            }`}
                        >
                            {preset.icon}
                            <span className="mt-1 text-center leading-tight">{preset.label}</span>
                            <span className="text-xs mt-0.5 opacity-80">{preset.val > 0 ? `${preset.val}sn` : 'Yok'}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Hareket Arası Dinlenme */}
            <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800/50">
                <label className="block text-xs font-bold text-zinc-400 mb-3 uppercase tracking-widest flex items-center justify-between">
                    <span>Hareket Arası Dinlenme</span>
                    <span className="text-primary">{(settings.restBetweenExercises === 0 || settings.restBetweenExercises === undefined) ? 'KAPALI' : `${settings.restBetweenExercises} sn`}</span>
                </label>
                <div className="flex items-center gap-3">
                    <Timer size={24} className="text-zinc-500" />
                    <input 
                        type="number"
                        inputMode="numeric"
                        min="0"
                        placeholder="Örn: 120 (0 = Kapalı)"
                        value={settings.restBetweenExercises === undefined ? '' : settings.restBetweenExercises}
                        onChange={(e) => {
                             const val = e.target.value === '' ? undefined : parseInt(e.target.value);
                             updateSetting('restBetweenExercises', val);
                        }}
                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white font-mono text-base font-bold focus:border-primary outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                </div>
                <p className="text-[10px] text-zinc-500 mt-2 px-1">
                    0 girilirse zamanlayıcı otomatik açılmaz.
                </p>
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
                <p className={`text-xl font-black ${remainingDays < 7 ? 'text-red-400' : 'text-emerald-400'}`}>
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
