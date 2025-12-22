
import React, { useState, useEffect } from 'react';
import { Plus, Check, Trash2, ChevronDown, Dumbbell, AlertCircle, TrendingUp } from 'lucide-react';
import { ExerciseData, ExerciseSet } from '../types';
import { playSuccessSound, triggerHaptic } from '../utils/audio';
import { ExerciseProgressChart } from './ExerciseProgressChart';

interface Props {
  exercise: ExerciseData;
  initialLogs: ExerciseSet[];
  onUpdate: (exerciseId: string, logs: ExerciseSet[]) => void;
  onSetComplete: (isExerciseFinished: boolean) => void;
}

export const ExerciseCard: React.FC<Props> = ({ exercise, initialLogs, onUpdate, onSetComplete }) => {
  const [sets, setSets] = useState<ExerciseSet[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [warningSetIndex, setWarningSetIndex] = useState<number | null>(null);

  useEffect(() => {
    if (initialLogs && initialLogs.length > 0) {
      setSets(initialLogs);
      setIsExpanded(true);
    } else {
      const match = exercise.targetSets.match(/^(\d+)x/);
      const defaultSetCount = match ? parseInt(match[1]) : 3;
      const targetWeightNum = parseFloat(exercise.targetWeight.replace(/[^0-9.]/g, '')) || 0;

      const initial: ExerciseSet[] = Array(defaultSetCount).fill(null).map(() => ({
        reps: 0,
        weight: targetWeightNum,
        rpe: undefined,
        completed: false
      }));
      setSets(initial);
    }
  }, [exercise.id]);

  const handleSetChange = (index: number, field: 'reps' | 'weight' | 'rpe', value: string) => {
    const newSets = [...sets];
    const numVal = value === '' ? 0 : parseFloat(value);
    
    newSets[index] = { ...newSets[index], [field]: numVal };
    setSets(newSets);
    onUpdate(exercise.id, newSets);
    
    if (warningSetIndex === index) {
        setWarningSetIndex(null);
    }
  };

  const toggleComplete = (index: number) => {
    const currentSet = sets[index];
    const isCompleting = !currentSet.completed;

    if (isCompleting) {
        if (currentSet.weight <= 0 || currentSet.reps <= 0) {
            setWarningSetIndex(index);
            triggerHaptic(100);
            setTimeout(() => {
                setWarningSetIndex(null);
            }, 2000);
            return;
        }
    }

    const newSets = [...sets];
    newSets[index] = { ...newSets[index], completed: isCompleting };
    setSets(newSets);
    onUpdate(exercise.id, newSets);

    if (isCompleting) {
        playSuccessSound();
        triggerHaptic(50);
        
        // Bu hareketin tüm setleri bitti mi kontrol et
        const allFinished = newSets.every(s => s.completed);
        onSetComplete(allFinished);
        
        setWarningSetIndex(null);
    }
  };

  const addSet = () => {
    const lastSet = sets[sets.length - 1] || { reps: 0, weight: 0, rpe: 8, completed: false };
    const newSets = [...sets, { ...lastSet, completed: false }];
    setSets(newSets);
    onUpdate(exercise.id, newSets);
  };

  const removeSet = (index: number) => {
    const newSets = sets.filter((_, i) => i !== index);
    setSets(newSets);
    onUpdate(exercise.id, newSets);
  };

  const toggleChart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowChart(!showChart);
  };

  const completedSetsCount = sets.filter(s => s.completed).length;
  // Calculate total volume for the exercise
  const totalVolume = sets.reduce((acc, s) => s.completed ? acc + (s.weight * s.reps) : acc, 0);

  return (
    <div className={`rounded-3xl border transition-all duration-500 overflow-hidden group ${isExpanded ? 'bg-black border-zinc-700 shadow-2xl' : 'bg-black border-zinc-800 shadow-lg'}`}>
      {/* Header */}
      <div 
        className="p-5 flex justify-between items-center cursor-pointer active:bg-white/5 transition-colors relative"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Progress Bar Background */}
        {isExpanded && sets.length > 0 && (
            <div 
                className="absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-500" 
                style={{ width: `${(completedSetsCount / sets.length) * 100}%` }}
            />
        )}

        <div className="flex-1">
            <div className="flex items-center gap-3">
                <h3 className={`text-lg font-bold tracking-tight transition-colors ${completedSetsCount === sets.length && sets.length > 0 ? 'text-emerald-500' : 'text-white'}`}>
                    {exercise.name}
                </h3>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-md">
                    {exercise.targetSets} Set
                </span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-md flex items-center gap-1">
                    <Dumbbell size={10} /> {exercise.targetWeight}
                </span>
            </div>
        </div>

        <div className="flex items-center gap-2 pl-2">
             <button 
                onClick={toggleChart}
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${showChart ? 'bg-primary text-white' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-white'}`}
             >
                <TrendingUp size={16} />
             </button>
             <div className={`w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-500 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-zinc-800 text-white' : ''}`}>
                <ChevronDown size={18} />
             </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-5 animate-in slide-in-from-top-4 duration-300 bg-black">
            
            {showChart && (
                <div className="mb-6 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 animate-in zoom-in-95 duration-200">
                    <ExerciseProgressChart exerciseId={exercise.id} exerciseName={exercise.name} />
                </div>
            )}

            {/* Sets Header */}
            <div className="grid grid-cols-12 gap-2 mb-3 px-1">
                <div className="col-span-1 text-center text-[10px] font-bold text-zinc-600 uppercase">#</div>
                <div className="col-span-4 text-center text-[10px] font-bold text-zinc-600 uppercase">KG</div>
                <div className="col-span-4 text-center text-[10px] font-bold text-zinc-600 uppercase">Tekrar</div>
                <div className="col-span-3 text-center text-[10px] font-bold text-zinc-600 uppercase">Durum</div>
            </div>

            {/* Sets List */}
            <div className="space-y-3">
                {sets.map((set, idx) => {
                    const isWarning = warningSetIndex === idx;
                    return (
                    <div key={idx} className="relative group/set">
                        <div 
                            className={`grid grid-cols-12 gap-2 items-center p-2 rounded-2xl transition-all duration-300 ${
                                set.completed ? 'bg-emerald-950/30 border border-emerald-500/20' : 
                                isWarning ? 'bg-red-950/30 border border-red-500/30' :
                                'bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700'
                            }`}
                        >
                            {/* Set Number */}
                            <div className="col-span-1 flex justify-center">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${set.completed ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                                    {idx + 1}
                                </div>
                            </div>

                            {/* Weight Input */}
                            <div className="col-span-4 relative">
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    value={set.weight === 0 ? '' : set.weight}
                                    onChange={(e) => handleSetChange(idx, 'weight', e.target.value)}
                                    placeholder="-"
                                    className={`w-full text-center py-3 rounded-xl font-mono font-bold text-lg tracking-tighter focus:outline-none focus:ring-1 focus:ring-primary transition-all ${
                                        set.completed ? 'bg-transparent text-emerald-500' : 
                                        'bg-zinc-900 text-white placeholder:text-zinc-700'
                                    }`}
                                />
                            </div>

                            {/* Reps Input */}
                            <div className="col-span-4 relative">
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    value={set.reps === 0 ? '' : set.reps}
                                    onChange={(e) => handleSetChange(idx, 'reps', e.target.value)}
                                    placeholder="-"
                                    className={`w-full text-center py-3 rounded-xl font-mono font-bold text-lg tracking-tighter focus:outline-none focus:ring-1 focus:ring-primary transition-all ${
                                        set.completed ? 'bg-transparent text-emerald-500' : 
                                        'bg-zinc-900 text-white placeholder:text-zinc-700'
                                    }`}
                                />
                            </div>

                            {/* Actions */}
                            <div className="col-span-3 flex justify-center pl-1">
                                <button
                                    onClick={() => toggleComplete(idx)}
                                    className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 ${
                                        set.completed 
                                        ? 'bg-emerald-500 text-black' 
                                        : isWarning
                                        ? 'bg-red-500 text-white animate-pulse'
                                        : 'bg-zinc-800 text-zinc-500 hover:bg-primary hover:text-white'
                                    }`}
                                >
                                    {set.completed ? <Check size={20} strokeWidth={3} /> : <Check size={20} />}
                                </button>
                            </div>
                            
                             {/* DELETE BUTTON */}
                             {!set.completed && (
                                <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/set:opacity-100 group-hover/set:translate-x-full transition-all duration-300 z-10 pl-2">
                                    <button 
                                        onClick={() => removeSet(idx)}
                                        className="h-10 w-10 flex items-center justify-center rounded-full bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white transition-colors backdrop-blur-sm"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                             )}
                        </div>
                        {isWarning && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-in zoom-in duration-200 whitespace-nowrap z-20">
                                <AlertCircle size={12} />
                                Veri Giriniz
                            </div>
                        )}
                    </div>
                )})}
            </div>

            {/* Footer Actions */}
            <div className="mt-6 flex justify-between items-center">
                <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Hacim</span>
                   <span className="text-lg font-mono font-bold text-white">{totalVolume.toLocaleString()} <span className="text-xs text-zinc-600">kg</span></span>
                </div>
                <button 
                    onClick={addSet}
                    className="flex items-center gap-2 px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-primary rounded-2xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 border border-zinc-800"
                >
                    <Plus size={16} strokeWidth={3} />
                    Set Ekle
                </button>
            </div>
        </div>
      )}
    </div>
  );
};
