
import React, { useState, useEffect } from 'react';
import { Dumbbell, ChevronLeft, ArrowRight, User, Play, BarChart3, Trophy, Clock, Edit2, Plus, Trash2, X, Check } from 'lucide-react';
import { ExerciseCard } from './components/ExerciseCard';
import { WorkoutTimer } from './components/WorkoutTimer';
import { AIRecommendations } from './components/AIRecommendations';
import { RestTimer } from './components/RestTimer';
import { ProfileView } from './components/ProfileView';
import { IOSInstallPrompt } from './components/IOSInstallPrompt';
import { HistoryChart } from './components/HistoryChart';
import { WorkoutSummaryModal } from './components/WorkoutSummaryModal';
import { AppView, WorkoutDay, ExerciseSet, WorkoutLog, ExerciseData, UserSettings } from './types';
import { saveWorkoutLog, getWorkoutLogs, startSession, endSession, getSessionStartTime, getProgram, saveProgram, getNextRecommendedWorkoutId, getUserSettings } from './services/storageService';
import { triggerHaptic } from './utils/audio';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [program, setProgram] = useState<WorkoutDay[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
  const [activeLog, setActiveLog] = useState<{ [exerciseId: string]: ExerciseSet[] }>({});
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  
  const [completedWorkoutLog, setCompletedWorkoutLog] = useState<WorkoutLog | null>(null);
  const [restTargetTime, setRestTargetTime] = useState<number | null>(null);
  
  useEffect(() => {
    setProgram(getProgram());
  }, []);

  const navigate = (view: AppView) => {
    setCurrentView(view);
    setIsEditMode(false);
  };

  const startWorkoutView = (day: WorkoutDay) => {
    if (isEditMode) return;
    setSelectedDay(day);
    const today = new Date().toISOString().split('T')[0];
    const logs = getWorkoutLogs();
    const existingLog = logs.find(l => l.date === today && l.dayId === day.id);
    const activeSessionStart = getSessionStartTime(day.id);

    if (existingLog) setActiveLog(existingLog.exercises);
    else setActiveLog({});
    
    setWorkoutStartTime(activeSessionStart);
    setCurrentView(AppView.WORKOUT);
  };

  const handleManualStart = () => {
    if (!selectedDay) return;
    const startTime = startSession(selectedDay.id);
    setWorkoutStartTime(startTime);
    triggerHaptic(100);
  };

  const handleExerciseUpdate = (exId: string, sets: ExerciseSet[]) => {
    setActiveLog(prev => ({ ...prev, [exId]: sets }));
  };

  const handleSetComplete = (isExerciseFinished: boolean) => {
    const settings = getUserSettings();
    const restSeconds = isExerciseFinished 
        ? (settings.restBetweenExercises || 120) 
        : (settings.restBetweenSets || 90);
    
    setRestTargetTime(Date.now() + (restSeconds * 1000));
  };

  const finishWorkout = () => {
    if (!selectedDay) return;
    const endTime = Date.now();
    const duration = workoutStartTime ? Math.floor((endTime - workoutStartTime) / 1000) : 0;
    const logData: WorkoutLog = {
      date: new Date().toISOString().split('T')[0],
      dayId: selectedDay.id,
      startTime: workoutStartTime || endTime,
      endTime,
      duration,
      exercises: activeLog
    };
    const savedLog = saveWorkoutLog(logData);
    endSession();
    setShowFinishConfirm(false);
    setRestTargetTime(null);
    setCompletedWorkoutLog(savedLog);
  };

  const handleUpdateProgram = (newProgram: WorkoutDay[]) => {
    setProgram(newProgram);
    saveProgram(newProgram);
  };

  const addNewWorkoutDay = () => {
    const newDay: WorkoutDay = {
      id: `day-${Date.now()}`,
      name: 'Yeni Antrenman Günü',
      exercises: []
    };
    const updated = [...program, newDay];
    handleUpdateProgram(updated);
    triggerHaptic(50);
  };

  const removeWorkoutDay = (dayId: string) => {
    if (confirm('Bu antrenman gününü ve içindeki tüm hareketleri silmek istediğine emin misin?')) {
      const updated = program.filter(d => d.id !== dayId);
      handleUpdateProgram(updated);
      triggerHaptic(100);
    }
  };

  const updateWorkoutDayName = (dayId: string, name: string) => {
    const updated = program.map(d => d.id === dayId ? { ...d, name } : d);
    handleUpdateProgram(updated);
  };

  const addNewExercise = (dayId: string) => {
    const newEx: ExerciseData = { id: `ex-${Date.now()}`, name: 'Yeni Hareket', targetSets: '3x8-12', targetWeight: '20 kg' };
    const updated = program.map(d => d.id === dayId ? { ...d, exercises: [...d.exercises, newEx] } : d);
    handleUpdateProgram(updated);
  };

  const removeExercise = (dayId: string, exId: string) => {
    const updated = program.map(d => d.id === dayId ? { ...d, exercises: d.exercises.filter(e => e.id !== exId) } : d);
    handleUpdateProgram(updated);
  };

  const nextId = getNextRecommendedWorkoutId();

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-primary/30 pb-safe overflow-x-hidden">
      <IOSInstallPrompt />

      <main className={`flex-1 overflow-y-auto no-scrollbar pb-32 ${currentView === AppView.WORKOUT ? 'pt-safe' : 'pt-0'}`}>
        
        {/* === DASHBOARD === */}
        {currentView === AppView.DASHBOARD && (
          <div className="animate-in fade-in duration-500 pt-14 px-5 pb-10">
             <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter">Spor Takip</h1>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
                        {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long'})}
                    </p>
                </div>
                <button onClick={() => navigate(AppView.PROFILE)} className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-primary">
                    <User size={20} />
                </button>
             </div>

             <div className="mt-8 space-y-6">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-lg font-bold">Programın</h2>
                    <button 
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${isEditMode ? 'bg-primary text-white' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}
                    >
                        {isEditMode ? <><Check size={14} /> Tamam</> : <><Edit2 size={14} /> Düzenle</>}
                    </button>
                </div>

                <div className="space-y-4">
                    {program.map((day) => {
                        const isRecommended = day.id === nextId;
                        return (
                            <div key={day.id} className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-xl transition-all duration-300">
                                <div className="relative">
                                    <button
                                        onClick={() => startWorkoutView(day)}
                                        disabled={isEditMode}
                                        className={`w-full text-left p-5 flex items-center justify-between transition-all ${isRecommended && !isEditMode ? 'bg-primary/5' : ''}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${isRecommended ? 'bg-primary text-white' : 'bg-black text-zinc-600'}`}>
                                                {day.name.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                {isEditMode ? (
                                                    <input 
                                                        autoFocus={day.name === 'Yeni Antrenman Günü'}
                                                        value={day.name}
                                                        onChange={(e) => updateWorkoutDayName(day.id, e.target.value)}
                                                        className="bg-black/50 border border-zinc-700 rounded-lg px-2 py-1 text-base font-bold text-white focus:border-primary outline-none w-full"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                ) : (
                                                    <div className="font-bold text-white flex items-center gap-2">
                                                        {day.name}
                                                        {isRecommended && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase">Sıradaki</span>}
                                                    </div>
                                                )}
                                                <p className="text-xs text-zinc-500 mt-1">{day.exercises.length} Hareket</p>
                                            </div>
                                        </div>
                                        {!isEditMode && <ArrowRight size={18} className="text-zinc-700" />}
                                    </button>

                                    {isEditMode && (
                                        <button 
                                            onClick={() => removeWorkoutDay(day.id)}
                                            className="absolute top-4 right-4 p-2 text-red-500/50 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                                
                                {isEditMode && (
                                    <div className="p-4 bg-black/40 border-t border-zinc-800 space-y-3">
                                        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-1">Hareketler</div>
                                        {day.exercises.map((ex, i) => (
                                            <div key={ex.id} className="flex items-center gap-3 animate-in slide-in-from-left-2 duration-200">
                                                <input 
                                                    value={ex.name}
                                                    onChange={(e) => {
                                                        const updated = program.map(d => d.id === day.id ? { ...d, exercises: d.exercises.map((eObj, idx) => idx === i ? { ...eObj, name: e.target.value } : eObj) } : d);
                                                        handleUpdateProgram(updated);
                                                    }}
                                                    className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-primary outline-none"
                                                />
                                                <button onClick={() => removeExercise(day.id, ex.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <button 
                                            onClick={() => addNewExercise(day.id)}
                                            className="w-full py-2 bg-zinc-900 border border-zinc-800 border-dashed rounded-xl text-zinc-500 text-xs font-bold flex items-center justify-center gap-2 hover:border-zinc-600 hover:text-zinc-300 transition-all"
                                        >
                                            <Plus size={14} /> Hareket Ekle
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {isEditMode && (
                        <button 
                            onClick={addNewWorkoutDay}
                            className="w-full py-6 bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-3xl text-zinc-500 font-bold flex items-center justify-center gap-3 hover:bg-zinc-900 hover:border-zinc-700 hover:text-primary transition-all active:scale-95"
                        >
                            <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-600 group-hover:text-primary">
                                <Plus size={20} />
                            </div>
                            Yeni Antrenman Günü Ekle
                        </button>
                    )}
                </div>
             </div>
          </div>
        )}

        {/* === WORKOUT === */}
        {currentView === AppView.WORKOUT && selectedDay && (
           <div className="animate-in slide-in-from-right duration-300 bg-black min-h-screen">
               <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-xl border-b border-zinc-900 pt-safe px-4 py-3 flex items-center justify-between">
                   <button onClick={() => setShowFinishConfirm(true)} className="p-2 -ml-2 text-zinc-500 hover:text-white transition-colors">
                        <ChevronLeft size={24} />
                   </button>
                   <div className="flex flex-col items-center">
                       <h2 className="font-bold text-xs text-zinc-400 uppercase tracking-widest">{selectedDay.name}</h2>
                       <div className="mt-1">
                            {workoutStartTime ? <WorkoutTimer startTime={workoutStartTime} /> : (
                                <button onClick={handleManualStart} className="bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-primary/20 animate-pulse">BAŞLAT</button>
                            )}
                       </div>
                   </div>
                   <button onClick={() => setShowFinishConfirm(true)} className="text-red-500 font-bold text-sm px-2">Bitir</button>
               </div>
               
               <div className={`p-4 space-y-4 pb-32 transition-opacity duration-500 ${!workoutStartTime ? 'opacity-50' : 'opacity-100'}`}>
                   {selectedDay.exercises.map(exercise => (
                       <ExerciseCard 
                           key={exercise.id}
                           exercise={exercise}
                           initialLogs={activeLog[exercise.id] || []}
                           onUpdate={handleExerciseUpdate}
                           onSetComplete={handleSetComplete}
                       />
                   ))}
               </div>
           </div>
        )}

        {/* === HISTORY / ANALYSIS === */}
        {currentView === AppView.HISTORY && (
             <div className="pt-14 px-5 space-y-8 pb-10">
                 <div>
                    <h1 className="text-3xl font-black">Analiz</h1>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Hedeflerine Odaklan</p>
                 </div>
                 
                 <HistoryChart />
                 
                 <AIRecommendations />

                 <div>
                    <h3 className="text-lg font-bold mb-4">Antrenman Geçmişi</h3>
                    <div className="space-y-3">
                        {getWorkoutLogs().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((log, i) => {
                            const day = program.find(d => d.id === log.dayId);
                            const hasPR = log.prs && log.prs.length > 0;
                            return (
                                <div key={i} className="bg-zinc-900 rounded-3xl p-4 border border-zinc-800 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center justify-center bg-black w-12 h-12 rounded-2xl border border-zinc-800">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase leading-none mb-1">{new Date(log.date).toLocaleDateString('tr-TR', { month: 'short' })}</span>
                                            <span className="text-lg font-black text-white leading-none">{new Date(log.date).getDate()}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm">{day?.name || 'Antrenman'}</h4>
                                            <div className="flex gap-3 text-[10px] text-zinc-500 mt-1 font-bold">
                                                <span className="flex items-center gap-1"><Clock size={12} /> {Math.floor((log.duration || 0)/60)}dk</span>
                                                <span className="flex items-center gap-1"><Dumbbell size={12} /> {(log.totalVolume || 0).toLocaleString()}kg</span>
                                            </div>
                                        </div>
                                    </div>
                                    {hasPR && <Trophy size={18} className="text-yellow-500" />}
                                </div>
                            );
                        })}
                    </div>
                 </div>
             </div>
        )}

        {/* === PROFILE === */}
        {currentView === AppView.PROFILE && <ProfileView />}

      </main>

      {/* === TAB BAR === */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-zinc-900 pb-safe pt-2 z-50">
          <div className="flex justify-around items-center h-[50px]">
              <TabItem icon={<Dumbbell />} label="Antrenman" isActive={currentView === AppView.DASHBOARD || currentView === AppView.WORKOUT} onClick={() => navigate(AppView.DASHBOARD)} />
              <TabItem icon={<BarChart3 />} label="Analiz" isActive={currentView === AppView.HISTORY} onClick={() => navigate(AppView.HISTORY)} />
              <TabItem icon={<User />} label="Profil" isActive={currentView === AppView.PROFILE} onClick={() => navigate(AppView.PROFILE)} />
          </div>
      </div>
      
      {restTargetTime && <RestTimer targetTime={restTargetTime} onDismiss={() => setRestTargetTime(null)} onAddSeconds={(s) => setRestTargetTime(restTargetTime + (s * 1000))} />}
      {completedWorkoutLog && <WorkoutSummaryModal log={completedWorkoutLog} onClose={() => {setCompletedWorkoutLog(null); navigate(AppView.DASHBOARD);}} />}

      {showFinishConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm space-y-2 animate-in slide-up duration-300">
                <div className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800">
                    <div className="p-6 text-center border-b border-zinc-800">
                        <h3 className="text-lg font-bold">Antrenman Bitsin mi?</h3>
                        <p className="text-xs text-zinc-500 mt-2">Bugünkü performansın kaydedilecek.</p>
                    </div>
                    <button onClick={finishWorkout} className="w-full py-5 text-primary font-black text-lg active:bg-white/5">KAYDET VE BİTİR</button>
                </div>
                <button onClick={() => setShowFinishConfirm(false)} className="w-full py-5 bg-zinc-900 text-white font-bold rounded-3xl border border-zinc-800">İptal</button>
            </div>
        </div>
      )}
    </div>
  );
};

const TabItem = ({ icon, label, isActive, onClick }: any) => (
  <button onClick={onClick} className="flex-1 flex flex-col items-center justify-center gap-[2px]">
      <div className={`transition-colors duration-200 ${isActive ? 'text-primary' : 'text-zinc-600'}`}>
          {React.cloneElement(icon, { fill: isActive ? "currentColor" : "none", strokeWidth: isActive ? 3 : 2, size: 24 })}
      </div>
      <span className={`text-[10px] font-bold tracking-tighter ${isActive ? 'text-primary' : 'text-zinc-600'}`}>{label}</span>
  </button>
);

export default App;
