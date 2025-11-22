import React, { useState, useEffect } from 'react';
import { Activity, Calendar, Bot, Dumbbell, ChevronLeft, CheckCircle2, Clock, AlertTriangle, LogOut, History as HistoryIcon, User, Trophy, Flame, ArrowRight } from 'lucide-react';
import { WEEKLY_PROGRAM } from './constants';
import { ExerciseCard } from './components/ExerciseCard';
import { AICoach } from './components/AICoach';
import { HistoryChart } from './components/HistoryChart';
import { WorkoutTimer } from './components/WorkoutTimer';
import { AIRecommendations } from './components/AIRecommendations';
import { RestTimer } from './components/RestTimer';
import { MotivationCard } from './components/MotivationCard';
import { ProfileView } from './components/ProfileView';
import { IOSInstallPrompt } from './components/IOSInstallPrompt';
import { AppView, WorkoutDay, ExerciseSet, WorkoutLog } from './types';
import { saveWorkoutLog, getWorkoutLogs, startSession, endSession, getSessionStartTime } from './services/storageService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
  const [activeLog, setActiveLog] = useState<{ [exerciseId: string]: ExerciseSet[] }>({});
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [greeting, setGreeting] = useState('Merhaba');
  
  // Rest Timer State
  const [restTargetTime, setRestTargetTime] = useState<number | null>(null);
  const DEFAULT_REST_SECONDS = 90;
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Günaydın');
    else if (hour < 18) setGreeting('İyi Günler');
    else setGreeting('İyi Akşamlar');
  }, []);

  // Navigation handler
  const navigate = (view: AppView) => {
    setCurrentView(view);
    if (view !== AppView.WORKOUT) {
      setSelectedDay(null);
      setWorkoutStartTime(null);
      setRestTargetTime(null);
    }
  };

  const startWorkout = (day: WorkoutDay) => {
    setSelectedDay(day);
    
    const today = new Date().toISOString().split('T')[0];
    const logs = getWorkoutLogs();
    const existingLog = logs.find(l => l.date === today && l.dayId === day.id);
    
    if (existingLog) {
      setActiveLog(existingLog.exercises);
      if (existingLog.startTime) {
        setWorkoutStartTime(existingLog.startTime);
      } else {
        const sessionStart = startSession(day.id);
        setWorkoutStartTime(sessionStart);
      }
    } else {
      setActiveLog({});
      const startTime = startSession(day.id);
      setWorkoutStartTime(startTime);
    }
    
    navigate(AppView.WORKOUT);
  };

  const handleExerciseUpdate = (exerciseId: string, sets: ExerciseSet[]) => {
    setActiveLog(prev => ({
      ...prev,
      [exerciseId]: sets
    }));
  };

  const handleSetComplete = () => {
    setRestTargetTime(Date.now() + (DEFAULT_REST_SECONDS * 1000));
  };

  const handleRestDismiss = () => {
    setRestTargetTime(null);
  };

  const handleAddRestTime = (seconds: number) => {
    if (restTargetTime) {
        setRestTargetTime(restTargetTime + (seconds * 1000));
    }
  };

  const finishWorkout = () => {
    if (!selectedDay || !workoutStartTime) return;
    
    const endTime = Date.now();
    const duration = Math.floor((endTime - workoutStartTime) / 1000);
    const today = new Date().toISOString().split('T')[0];
    
    const log: WorkoutLog = {
      date: today,
      dayId: selectedDay.id,
      startTime: workoutStartTime,
      endTime: endTime,
      duration: duration,
      exercises: activeLog
    };
    
    saveWorkoutLog(log);
    endSession(selectedDay.id);
    setShowFinishConfirm(false);
    setRestTargetTime(null);
    navigate(AppView.DASHBOARD);
  };

  const getLastWorkoutInfo = () => {
    const logs = getWorkoutLogs();
    if (logs.length === 0) return null;
    
    const lastLog = logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const dayName = WEEKLY_PROGRAM.find(d => d.id === lastLog.dayId)?.name;
    
    return {
      name: dayName,
      date: lastLog.date,
      duration: lastLog.duration
    };
  };

  const lastWorkout = getLastWorkoutInfo();

  // Visual styles for days
  const getDayStyle = (id: string) => {
    switch(id) {
      case 'mon': return { gradient: 'from-blue-600 to-blue-900', icon: '💪', label: 'Push & Pull' };
      case 'wed': return { gradient: 'from-emerald-600 to-emerald-900', icon: '🦵', label: 'Leg Day' };
      case 'thu': return { gradient: 'from-purple-600 to-purple-900', icon: '🔥', label: 'Upper Body' };
      case 'sat': return { gradient: 'from-orange-600 to-orange-900', icon: '🚀', label: 'Full Body' };
      default: return { gradient: 'from-slate-700 to-slate-900', icon: '✨', label: 'Workout' };
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6 pb-32 animate-in fade-in duration-500">
      {/* Header */}
      <header className="pt-6 px-5 flex justify-between items-end">
        <div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">{new Date().toLocaleDateString('tr-TR', {weekday: 'long', day: 'numeric', month: 'long'})}</p>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Sporcu</span>
            </h1>
        </div>
        <div className="bg-slate-800/50 p-2.5 rounded-full border border-slate-700/50 shadow-lg backdrop-blur-md">
           <User className="text-slate-300" size={24} onClick={() => navigate(AppView.PROFILE)} />
        </div>
      </header>

      <div className="px-5 space-y-6">
        <MotivationCard />

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 bg-emerald-500/10 w-20 h-20 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
              <div className="relative">
                 <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-emerald-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase">Son Süre</span>
                 </div>
                 <p className="text-2xl font-bold text-white font-mono">
                    {lastWorkout ? `${Math.floor((lastWorkout.duration || 0)/60)}dk` : '--'}
                 </p>
              </div>
           </div>
           <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 bg-orange-500/10 w-20 h-20 rounded-full blur-xl group-hover:bg-orange-500/20 transition-all"></div>
              <div className="relative">
                 <div className="flex items-center gap-2 mb-2">
                    <Flame size={16} className="text-orange-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase">Hedef</span>
                 </div>
                 <p className="text-2xl font-bold text-white">4 Gün</p>
              </div>
           </div>
        </div>

        {/* Workout Programs List - Moved UP */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 px-1">
            <Dumbbell size={20} className="text-primary" />
            Antrenman Programı
          </h2>
          <div className="space-y-4">
            {WEEKLY_PROGRAM.map(day => {
              const style = getDayStyle(day.id);
              return (
                <button
                  key={day.id}
                  onClick={() => startWorkout(day)}
                  className="w-full relative group overflow-hidden rounded-3xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-primary/10"
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                  
                  <div className="relative p-5 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/10">
                          {style.icon}
                       </div>
                       <div className="text-left">
                          <span className="block text-xs text-white/70 font-bold uppercase tracking-widest mb-0.5">{style.label}</span>
                          <span className="block text-white font-extrabold text-xl tracking-tight">{day.name}</span>
                          <span className="text-xs text-white/50 mt-1 inline-block">{day.exercises.length} Hareket</span>
                       </div>
                    </div>
                    
                    <div className="w-10 h-10 bg-white text-slate-900 rounded-full flex items-center justify-center transform group-hover:translate-x-1 transition-transform shadow-xl">
                       <ArrowRight size={20} strokeWidth={2.5} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Recommendations Widget - Moved DOWN */}
        <AIRecommendations />

        {/* Removed HistoryChart (Performance) as requested */}
      </div>
    </div>
  );

  const renderWorkout = () => {
    if (!selectedDay) return null;
    const style = getDayStyle(selectedDay.id);
    
    return (
      <div className="pb-32 animate-in slide-in-from-right duration-300 bg-slate-950 min-h-screen">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 shadow-2xl">
          <div className="p-4 flex items-center justify-between">
            <button 
              onClick={() => navigate(AppView.DASHBOARD)}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="flex flex-col items-center">
              <h2 className="font-bold text-white text-lg flex items-center gap-2">
                {style.icon} {selectedDay.name}
              </h2>
              {workoutStartTime && <WorkoutTimer startTime={workoutStartTime} />}
            </div>
            
            <button 
              onClick={() => setShowFinishConfirm(true)}
              className="bg-primary text-slate-900 px-5 py-2 rounded-full text-sm font-bold shadow-[0_0_20px_-5px_rgba(14,165,233,0.5)] transition-all active:scale-95 hover:bg-sky-400"
            >
              Bitir
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {selectedDay.exercises.map(ex => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              initialLogs={activeLog[ex.id] || []}
              onUpdate={handleExerciseUpdate}
              onSetComplete={handleSetComplete}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderHistory = () => {
    const logs = getWorkoutLogs().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return (
      <div className="p-5 pb-32 space-y-6 animate-in fade-in bg-slate-950 min-h-screen">
        <h2 className="text-3xl font-bold text-white mt-4 flex items-center gap-3">
           <div className="bg-slate-800 p-2 rounded-xl"><Calendar className="text-primary" /></div>
           Geçmiş
        </h2>
        
        {logs.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-slate-600">
             <HistoryIcon size={64} className="mb-6 opacity-20" />
             <p className="text-lg font-medium">Henüz kayıt yok</p>
             <p className="text-sm">İlk antrenmanını tamamla!</p>
           </div>
        ) : (
          <div className="grid gap-4">
            {logs.map((log, idx) => {
               const dayName = WEEKLY_PROGRAM.find(d => d.id === log.dayId)?.name;
               return (
                  <div key={idx} className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-lg flex justify-between items-center group hover:border-slate-700 transition-colors">
                     <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-2xl shadow-inner">
                            {getDayStyle(log.dayId).icon}
                        </div>
                        <div>
                           <h3 className="font-bold text-white text-lg leading-tight">{dayName || log.dayId}</h3>
                           <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">
                              {new Date(log.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                           </p>
                        </div>
                     </div>
                     
                     <div className="text-right">
                        {log.duration && (
                            <div className="text-sm font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg mb-1 inline-block">
                               {Math.floor(log.duration / 60)}dk
                            </div>
                        )}
                        <div className="text-xs text-slate-500 font-bold">
                           {Object.keys(log.exercises).length} Hareket
                        </div>
                     </div>
                  </div>
               )
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-primary selection:text-slate-900">
      <IOSInstallPrompt />
      
      {currentView === AppView.DASHBOARD && renderDashboard()}
      {currentView === AppView.WORKOUT && renderWorkout()}
      {currentView === AppView.AI_COACH && <div className="h-[calc(100vh-90px)] pt-4 px-4 pb-4"><AICoach /></div>}
      {currentView === AppView.HISTORY && renderHistory()}
      {currentView === AppView.PROFILE && <ProfileView />}

      {/* Confirmation Modal */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 w-full max-w-sm rounded-3xl p-6 border border-slate-800 shadow-2xl transform transition-all scale-100">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-emerald-500/20 p-4 rounded-full shadow-[0_0_30px_-10px_rgba(16,185,129,0.5)]">
                <CheckCircle2 size={40} className="text-emerald-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Bitiyor musun?</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Harika bir iş çıkardın! Kaydedip çıkmak istediğine emin misin?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full mt-4">
                <button 
                  onClick={() => setShowFinishConfirm(false)}
                  className="w-full py-3.5 rounded-2xl bg-slate-800 text-white hover:bg-slate-700 font-bold transition-colors"
                >
                  Devam Et
                </button>
                <button 
                  onClick={finishWorkout}
                  className="w-full py-3.5 rounded-2xl bg-primary text-slate-900 hover:bg-sky-400 font-bold shadow-lg shadow-primary/25 transition-colors"
                >
                  Bitir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rest Timer Overlay */}
      {restTargetTime && (
        <RestTimer 
            targetTime={restTargetTime} 
            onDismiss={handleRestDismiss}
            onAddSeconds={handleAddRestTime}
        />
      )}

      {/* Floating Bottom Navigation */}
      {currentView !== AppView.WORKOUT && (
        <div className="fixed bottom-6 left-4 right-4 z-40">
          <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl shadow-black/50 h-18 px-2 max-w-md mx-auto flex justify-around items-center">
            {[
              { view: AppView.DASHBOARD, icon: Activity, label: 'Ana Sayfa' },
              { view: AppView.HISTORY, icon: Calendar, label: 'Geçmiş' },
              { view: AppView.AI_COACH, icon: Bot, label: 'Koç' },
              { view: AppView.PROFILE, icon: User, label: 'Profil' },
            ].map(item => (
              <button 
                key={item.view}
                onClick={() => navigate(item.view)}
                className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 ${
                  currentView === item.view 
                    ? 'text-white' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {/* Active Indicator Background */}
                {currentView === item.view && (
                   <div className="absolute inset-x-3 inset-y-3 bg-primary/20 rounded-xl -z-10 animate-in zoom-in-50 duration-200"></div>
                )}
                
                <item.icon 
                  size={24} 
                  strokeWidth={currentView === item.view ? 2.5 : 2} 
                  className={`transition-transform duration-300 ${currentView === item.view ? 'scale-110 -translate-y-1' : ''}`}
                />
                
                {currentView === item.view && (
                   <span className="text-[10px] font-bold mt-0.5 animate-in fade-in slide-in-from-bottom-1">{item.label}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;