import React, { useState, useEffect } from 'react';
import { Activity, Calendar, Dumbbell, ChevronLeft, ArrowRight, User, Play, BarChart3, Trophy, Clock } from 'lucide-react';
import { WEEKLY_PROGRAM } from './constants';
import { ExerciseCard } from './components/ExerciseCard';
import { WorkoutTimer } from './components/WorkoutTimer';
import { AIRecommendations } from './components/AIRecommendations';
import { RestTimer } from './components/RestTimer';
import { MotivationCard } from './components/MotivationCard';
import { ProfileView } from './components/ProfileView';
import { IOSInstallPrompt } from './components/IOSInstallPrompt';
import { HistoryChart } from './components/HistoryChart';
import { WorkoutSummaryModal } from './components/WorkoutSummaryModal';
import { AppView, WorkoutDay, ExerciseSet, WorkoutLog } from './types';
import { saveWorkoutLog, getWorkoutLogs, startSession, endSession, getSessionStartTime } from './services/storageService';
import { triggerHaptic } from './utils/audio';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
  const [activeLog, setActiveLog] = useState<{ [exerciseId: string]: ExerciseSet[] }>({});
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [greeting, setGreeting] = useState('Merhaba');
  
  // Summary Modal State
  const [completedWorkoutLog, setCompletedWorkoutLog] = useState<WorkoutLog | null>(null);
  
  // Rest Timer State
  const [restTargetTime, setRestTargetTime] = useState<number | null>(null);
  const DEFAULT_REST_SECONDS = 90;
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Günaydın');
    else if (hour < 18) setGreeting('İyi Günler');
    else setGreeting('İyi Akşamlar');
  }, []);

  const navigate = (view: AppView) => {
    setCurrentView(view);
  };

  const startWorkoutView = (day: WorkoutDay) => {
    setSelectedDay(day);
    const today = new Date().toISOString().split('T')[0];
    const logs = getWorkoutLogs();
    const existingLog = logs.find(l => l.date === today && l.dayId === day.id);
    const activeSessionStart = getSessionStartTime(day.id);

    // If there is an existing log or active session, load it
    if (existingLog) {
      setActiveLog(existingLog.exercises);
      setWorkoutStartTime(activeSessionStart || null);
    } else {
      setActiveLog({});
      // If there is an active session in storage, use it, otherwise wait for manual start
      setWorkoutStartTime(activeSessionStart || null);
    }
    
    setCurrentView(AppView.WORKOUT);
  };

  const handleManualStart = () => {
    if (!selectedDay) return;
    const startTime = startSession(selectedDay.id);
    setWorkoutStartTime(startTime);
    triggerHaptic(100);
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
    if (!selectedDay) return;
    
    const endTime = Date.now();
    const duration = workoutStartTime ? Math.floor((endTime - workoutStartTime) / 1000) : 0;
    const effectiveStartTime = workoutStartTime || endTime;

    const today = new Date().toISOString().split('T')[0];
    
    const logData: WorkoutLog = {
      date: today,
      dayId: selectedDay.id,
      startTime: effectiveStartTime,
      endTime: endTime,
      duration: duration,
      exercises: activeLog
    };
    
    // Save and get the calculated stats back
    const savedLog = saveWorkoutLog(logData);
    endSession(selectedDay.id);
    
    setShowFinishConfirm(false);
    setRestTargetTime(null);
    setCompletedWorkoutLog(savedLog); // Trigger Summary Modal
    
    // We don't change view immediately, the modal covers it. 
    // Closing the modal will navigate to DASHBOARD.
  };

  const handleCloseSummary = () => {
    setCompletedWorkoutLog(null);
    setCurrentView(AppView.DASHBOARD);
  };

  const getLastWorkoutInfo = () => {
    const logs = getWorkoutLogs();
    if (logs.length === 0) return null;
    const lastLog = logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const dayName = WEEKLY_PROGRAM.find(d => d.id === lastLog.dayId)?.name;
    return { name: dayName, date: lastLog.date, duration: lastLog.duration };
  };

  const lastWorkout = getLastWorkoutInfo();

  const getDayLabel = (id: string) => {
    switch(id) {
      case 'mon': return 'Push & Pull';
      case 'wed': return 'Leg Day';
      case 'thu': return 'Upper Body';
      case 'sat': return 'Full Body';
      default: return 'Workout';
    }
  };

  // Tab Item Component
  const TabItem = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => (
    <button onClick={onClick} className="flex-1 flex flex-col items-center justify-center gap-[2px] active:opacity-70 transition-opacity">
        <div className={`transition-colors duration-200 ${isActive ? 'text-primary' : 'text-zinc-500'}`}>
            {React.cloneElement(icon as React.ReactElement, { 
                fill: isActive ? "currentColor" : "none",
                strokeWidth: isActive ? 2.5 : 2,
                size: 26
            })}
        </div>
        <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'text-primary' : 'text-zinc-500'}`}>
            {label}
        </span>
    </button>
  );

  return (
    <div className="bg-background min-h-screen text-text font-sans selection:bg-primary/30 pb-safe">
      <IOSInstallPrompt />

      {/* Main Scrollable Content */}
      <main className={`flex-1 overflow-y-auto no-scrollbar pb-24 ${currentView === AppView.WORKOUT ? 'pt-safe' : 'pt-0'}`}>
        
        {/* === DASHBOARD VIEW === */}
        {currentView === AppView.DASHBOARD && (
          <div className="animate-in fade-in duration-500 pt-14 px-5 pb-10">
             {/* Header */}
             <div className="mb-6">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
                    {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long'})}
                </p>
                <div className="flex justify-between items-end">
                    <h1 className="text-3xl font-bold tracking-tight text-white">{greeting}</h1>
                    <button 
                        onClick={() => navigate(AppView.PROFILE)}
                        className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-primary"
                    >
                        <User size={18} />
                    </button>
                </div>
             </div>

             {/* Motivation Card */}
             <div className="mb-8">
                 <MotivationCard />
             </div>

             {/* Recent Activity / Quick Actions */}
             <div className="space-y-6">
                
                {/* Last Workout Summary (if exists) */}
                {lastWorkout && (
                    <div 
                        onClick={() => setCurrentView(AppView.HISTORY)}
                        className="bg-black rounded-2xl p-4 border border-zinc-800 active:bg-zinc-900 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                <Activity size={16} className="text-green-500" />
                                Son Aktivite
                            </h3>
                            <ArrowRight size={14} className="text-zinc-500" />
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-lg font-bold">{lastWorkout.name || 'Antrenman'}</p>
                                <p className="text-xs text-zinc-500 mt-1">
                                    {new Date(lastWorkout.date).toLocaleDateString('tr-TR', { weekday: 'long' })} • {Math.floor((lastWorkout.duration || 0) / 60)} dk
                                </p>
                            </div>
                            <div className="h-8 w-24">
                                {/* Mini chart visualization placeholder */}
                                <div className="flex items-end justify-end gap-1 h-full">
                                    <div className="w-1.5 h-[40%] bg-primary/20 rounded-t-sm"></div>
                                    <div className="w-1.5 h-[70%] bg-primary/40 rounded-t-sm"></div>
                                    <div className="w-1.5 h-[50%] bg-primary/30 rounded-t-sm"></div>
                                    <div className="w-1.5 h-[100%] bg-primary rounded-t-sm"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Workout Program List (iOS Inset Grouped Style) */}
                <div>
                    <h2 className="text-lg font-bold text-white mb-3 ml-1">Programım</h2>
                    <div className="bg-black rounded-2xl overflow-hidden border border-zinc-800 divide-y divide-zinc-800">
                        {WEEKLY_PROGRAM.map((day) => {
                            const isToday = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase() === day.id;
                            return (
                                <button
                                    key={day.id}
                                    onClick={() => startWorkoutView(day)}
                                    className={`w-full text-left px-4 py-4 flex items-center justify-between group transition-colors 
                                        ${isToday ? 'bg-primary/10' : 'hover:bg-zinc-900'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                                            ${isToday ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-zinc-900 text-zinc-500'}`}>
                                            {day.name.substring(0, 1)}
                                        </div>
                                        <div>
                                            <div className={`font-semibold text-base ${isToday ? 'text-primary' : 'text-white'}`}>
                                                {day.name}
                                            </div>
                                            <div className="text-xs text-zinc-500 font-medium mt-0.5">
                                                {getDayLabel(day.id)}
                                            </div>
                                        </div>
                                    </div>
                                    {isToday ? (
                                        <div className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full">BUGÜN</div>
                                    ) : (
                                        <ChevronLeft size={18} className="text-zinc-500 rotate-180" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
             </div>
          </div>
        )}

        {/* === WORKOUT VIEW === */}
        {currentView === AppView.WORKOUT && selectedDay && (
           <div className="animate-in slide-in-from-right duration-300 bg-background min-h-screen">
               {/* Sticky Header */}
               <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl border-b border-zinc-800 pt-safe transition-all">
                   <div className="flex items-center justify-between px-4 py-3">
                       <button 
                            onClick={() => setShowFinishConfirm(true)} 
                            className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors"
                       >
                            <ChevronLeft size={24} />
                       </button>
                       <div className="flex flex-col items-center">
                           <h2 className="font-bold text-sm text-white">{selectedDay.name}</h2>
                           
                           {/* TIMER OR START BUTTON */}
                           <div className="scale-90 origin-center mt-1">
                                {workoutStartTime ? (
                                    <WorkoutTimer startTime={workoutStartTime} />
                                ) : (
                                    <button 
                                        onClick={handleManualStart}
                                        className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full animate-pulse shadow-lg shadow-primary/30 flex items-center gap-1"
                                    >
                                        <Play size={10} fill="currentColor" /> BAŞLAT
                                    </button>
                                )}
                           </div>
                       </div>
                       <button 
                            onClick={() => setShowFinishConfirm(true)} 
                            className="text-red-500 font-bold text-sm px-2 py-1 hover:bg-red-500/10 rounded-md transition-colors"
                       >
                           Bitir
                       </button>
                   </div>
               </div>
               
               {/* Exercises Content */}
               <div className={`p-4 space-y-4 pb-32 transition-opacity duration-500 ${!workoutStartTime ? 'opacity-80' : 'opacity-100'}`}>
                   {selectedDay.exercises.map(exercise => (
                       <ExerciseCard 
                           key={exercise.id}
                           exercise={exercise}
                           initialLogs={activeLog[exercise.id] || []}
                           onUpdate={handleExerciseUpdate}
                           onSetComplete={handleSetComplete}
                       />
                   ))}
                   
                   <button 
                        onClick={() => setShowFinishConfirm(true)}
                        className="w-full mt-8 py-4 bg-zinc-900 border border-zinc-800 text-red-500 font-bold rounded-2xl hover:bg-red-950/20 transition-colors"
                   >
                       Antrenmanı Bitir
                   </button>
               </div>
           </div>
        )}

        {/* === HISTORY / ANALYSIS VIEW === */}
        {currentView === AppView.HISTORY && (
             <div className="pt-14 px-5 space-y-8 pb-10">
                 <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Hedeflerin</h1>
                        <p className="text-zinc-500 text-sm">Güç gelişimin ve sıradaki durakların.</p>
                    </div>
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Trophy size={20} className="text-primary" />
                    </div>
                 </div>
                 
                 {/* Replaced Chart with Progression Hub */}
                 <HistoryChart />
                 
                 <AIRecommendations />

                 {/* Workout History List */}
                 <div>
                    <h3 className="text-lg font-bold text-white mb-3">Antrenman Günlüğü</h3>
                    <div className="space-y-3">
                        {getWorkoutLogs().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((log, i) => {
                            const dayName = WEEKLY_PROGRAM.find(d => d.id === log.dayId)?.name || 'Antrenman';
                            const hasPR = log.prs && log.prs.length > 0;
                            return (
                                <div key={i} className="bg-black rounded-2xl p-4 border border-zinc-800 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center justify-center bg-zinc-900 w-12 h-12 rounded-xl border border-zinc-800">
                                            <span className="text-xs font-bold text-zinc-500 uppercase">{new Date(log.date).toLocaleDateString('tr-TR', { month: 'short' })}</span>
                                            <span className="text-lg font-bold text-white leading-none">{new Date(log.date).getDate()}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">{dayName}</h4>
                                            <div className="flex gap-2 text-xs text-zinc-500 mt-1">
                                                <span className="flex items-center gap-0.5"><Clock size={10} /> {Math.floor((log.duration || 0)/60)}dk</span>
                                                <span className="flex items-center gap-0.5"><Dumbbell size={10} /> {(log.totalVolume || 0).toLocaleString()}kg</span>
                                            </div>
                                        </div>
                                    </div>
                                    {hasPR && (
                                        <div className="bg-yellow-500/10 p-2 rounded-full">
                                            <Trophy size={16} className="text-yellow-500" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {getWorkoutLogs().length === 0 && (
                            <div className="text-center text-zinc-500 py-8 text-sm">
                                Henüz antrenman kaydı bulunmuyor.
                            </div>
                        )}
                    </div>
                 </div>
             </div>
        )}

        {/* === PROFILE VIEW === */}
        {currentView === AppView.PROFILE && (
            <div className="pt-10">
                <ProfileView />
            </div>
        )}

      </main>

      {/* === NATIVE IOS STYLE BOTTOM TAB BAR === */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#000000]/90 backdrop-blur-xl border-t border-zinc-800 pb-safe pt-2 z-50">
          <div className="flex justify-around items-center h-[50px]">
              <TabItem 
                icon={<Dumbbell />} 
                label="Antrenman" 
                isActive={currentView === AppView.DASHBOARD || currentView === AppView.WORKOUT} 
                onClick={() => navigate(AppView.DASHBOARD)} 
              />
              <TabItem 
                icon={<BarChart3 />} 
                label="Analiz" 
                isActive={currentView === AppView.HISTORY} 
                onClick={() => navigate(AppView.HISTORY)} 
              />
              <TabItem 
                icon={<User />} 
                label="Profil" 
                isActive={currentView === AppView.PROFILE} 
                onClick={() => navigate(AppView.PROFILE)} 
              />
          </div>
      </div>
      
      {/* Rest Timer Floating Overlay */}
      {restTargetTime && (
          <RestTimer 
             targetTime={restTargetTime} 
             onDismiss={handleRestDismiss} 
             onAddSeconds={handleAddRestTime}
          />
      )}
      
      {/* Workout Summary Modal */}
      {completedWorkoutLog && (
        <WorkoutSummaryModal 
            log={completedWorkoutLog} 
            onClose={handleCloseSummary} 
        />
      )}

      {/* Finish Confirmation Modal (iOS Action Sheet Style) */}
      {showFinishConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm space-y-2 animate-in slide-in-from-bottom duration-300">
                <div className="bg-zinc-900/90 backdrop-blur-xl rounded-2xl overflow-hidden text-center border border-zinc-800">
                    <div className="p-4 border-b border-zinc-800">
                        <h3 className="text-sm font-bold text-zinc-400">Antrenmanı Bitir?</h3>
                        <p className="text-xs text-zinc-500 mt-1">Bu oturum sonlandırılacak ve veriler kaydedilecek.</p>
                    </div>
                    <button 
                        onClick={finishWorkout}
                        className="w-full py-4 text-blue-500 font-bold text-lg hover:bg-white/5 transition-colors"
                    >
                        Bitir ve Kaydet
                    </button>
                </div>
                
                <button 
                    onClick={() => setShowFinishConfirm(false)}
                    className="w-full py-4 bg-zinc-900 text-white font-bold text-lg rounded-2xl hover:bg-zinc-800 transition-colors border border-zinc-800"
                >
                    Vazgeç
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;