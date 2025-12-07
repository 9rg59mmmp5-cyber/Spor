
import React, { useState, useEffect } from 'react';
import { Plus, Check, Trash2, ChevronDown, Dumbbell, AlertCircle, TrendingUp, FileText, Dna, Loader2, X } from 'lucide-react';
import { ExerciseData, ExerciseSet } from '../types';
import { playSuccessSound, triggerHaptic } from '../utils/audio';
import { ExerciseProgressChart } from './ExerciseProgressChart';
import { EXERCISE_ANATOMY } from '../constants';
import { generateAnatomyImage } from '../services/geminiService';

interface Props {
  exercise: ExerciseData;
  initialLogs: ExerciseSet[];
  onUpdate: (exerciseId: string, logs: ExerciseSet[]) => void;
  onSetComplete: () => void;
}

export const ExerciseCard: React.FC<Props> = ({ exercise, initialLogs, onUpdate, onSetComplete }) => {
  const [sets, setSets] = useState<ExerciseSet[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showAnatomy, setShowAnatomy] = useState(false);
  const [anatomyImage, setAnatomyImage] = useState<string | null>(null);
  const [loadingAnatomy, setLoadingAnatomy] = useState(false);
  const [note, setNote] = useState('');
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
        onSetComplete();
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

  const handleShowAnatomy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAnatomy(!showAnatomy);
    setShowChart(false);
    setShowNotes(false);

    // If opening and we don't have an image in state
    if (!showAnatomy && !anatomyImage) {
        const cacheKey = `anatomy_img_v3_${exercise.id}`; // Updated key for new format
        
        // 1. Check Local Storage (System Cache)
        try {
            const cachedImg = localStorage.getItem(cacheKey);
            if (cachedImg) {
                setAnatomyImage(cachedImg);
                return;
            }
        } catch (e) {
            console.warn("Storage access failed");
        }

        // 2. If not cached, generate new
        const info = EXERCISE_ANATOMY[exercise.id];
        if (info) {
            setLoadingAnatomy(true);
            const img = await generateAnatomyImage(info);
            
            if (img) {
                setAnatomyImage(img);
                // 3. Save to System (Local Storage)
                try {
                    localStorage.setItem(cacheKey, img);
                } catch (e) {
                    console.warn("Could not cache image (likely quota exceeded)");
                }
            }
            setLoadingAnatomy(false);
        }
    }
  };

  const totalVolume = sets.reduce((acc, set) => acc + (set.completed ? (set.weight * set.reps) : 0), 0);
  const completedSetsCount = sets.filter(s => s.completed).length;

  return (
    <div className={`bg-slate-900 rounded-3xl border transition-all duration-500 overflow-hidden group ${isExpanded ? 'border-slate-700 ring-1 ring-primary/20 shadow-2xl' : 'border-slate-800 shadow-lg'}`}>
      {/* Header */}
      <div 
        className="p-5 flex justify-between items-center cursor-pointer active:bg-slate-800/50 transition-colors relative"
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
                <h3 className={`text-lg font-bold tracking-tight transition-colors ${completedSetsCount === sets.length && sets.length > 0 ? 'text-emerald-400' : 'text-white'}`}>
                    {exercise.name}
                </h3>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950 border border-slate-800 px-2 py-1 rounded-md">
                    {exercise.targetSets} Set
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950 border border-slate-800 px-2 py-1 rounded-md flex items-center gap-1">
                    <Dumbbell size={10} /> {exercise.targetWeight}
                </span>
            </div>
        </div>

        <div className="flex items-center gap-2 pl-2">
             <button 
                onClick={handleShowAnatomy}
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${showAnatomy ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                title="Anatomi"
             >
                <Dna size={16} />
             </button>
             <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setShowChart(!showChart);
                    setShowNotes(false);
                    setShowAnatomy(false);
                }}
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${showChart ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
             >
                <TrendingUp size={16} />
             </button>
             <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setShowNotes(!showNotes);
                    setShowChart(false);
                    setShowAnatomy(false);
                }}
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${showNotes ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
             >
                <FileText size={16} />
             </button>
             <div className={`w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-slate-700 text-white' : ''}`}>
                <ChevronDown size={18} />
             </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-5 animate-in slide-in-from-top-4 duration-300 bg-slate-900">
            
            {showAnatomy && (
                 <div className="mb-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner animate-in zoom-in-95 duration-200 relative min-h-[200px] flex items-center justify-center">
                    <button 
                        onClick={() => setShowAnatomy(false)}
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white/70 hover:text-white z-10"
                    >
                        <X size={16} />
                    </button>
                    {loadingAnatomy ? (
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                            <Loader2 className="animate-spin text-primary" size={32} />
                            <p className="text-xs font-mono">3D X-Ray Anatomi Oluşturuluyor...</p>
                        </div>
                    ) : anatomyImage ? (
                        <div className="relative w-full rounded-xl overflow-hidden group/img">
                            <img src={anatomyImage} alt="Anatomy" className="w-full h-auto object-cover rounded-xl" />
                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent text-white text-xs font-mono opacity-0 group-hover/img:opacity-100 transition-opacity">
                                Hedef Kas: {EXERCISE_ANATOMY[exercise.id]?.variables?.target_muscle_group || 'Bilinmiyor'}
                            </div>
                            <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] text-emerald-400 border border-emerald-500/30">
                                SİSTEME KAYDEDİLDİ
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-slate-500">
                            <p>Görsel oluşturulamadı.</p>
                            <p className="text-[10px] mt-1">API anahtarınızı kontrol edin.</p>
                        </div>
                    )}
                 </div>
            )}

            {showChart && (
                <div className="mb-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner animate-in zoom-in-95 duration-200">
                    <ExerciseProgressChart exerciseId={exercise.id} exerciseName={exercise.name} />
                </div>
            )}

            {showNotes && (
                <div className="mb-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner animate-in zoom-in-95 duration-200">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Kişisel Notlar</label>
                    <textarea 
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Bu hareket için form notları, koltuk ayarı vb..."
                        className="w-full bg-slate-900 text-slate-200 text-sm rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-primary border border-slate-800 resize-none h-24 placeholder:text-slate-600"
                    />
                </div>
            )}

            {/* Sets Header */}
            <div className="grid grid-cols-12 gap-2 mb-3 px-1">
                <div className="col-span-1 text-center text-[10px] font-bold text-slate-500 uppercase">#</div>
                <div className="col-span-4 text-center text-[10px] font-bold text-slate-500 uppercase">KG</div>
                <div className="col-span-4 text-center text-[10px] font-bold text-slate-500 uppercase">Tekrar</div>
                <div className="col-span-3 text-center text-[10px] font-bold text-slate-500 uppercase">Durum</div>
            </div>

            {/* Sets List */}
            <div className="space-y-3">
                {sets.map((set, idx) => {
                    const isWarning = warningSetIndex === idx;
                    return (
                    <div key={idx} className="relative group/set">
                        <div 
                            className={`grid grid-cols-12 gap-2 items-center p-2 rounded-2xl transition-all duration-300 ${
                                set.completed ? 'bg-emerald-900/10 border border-emerald-500/20 shadow-[0_0_15px_-5px_rgba(16,185,129,0.2)]' : 
                                isWarning ? 'bg-red-900/10 border border-red-500/30' :
                                'bg-slate-950 border border-slate-800 hover:border-slate-700'
                            }`}
                        >
                            {/* Set Number */}
                            <div className="col-span-1 flex justify-center">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-inner ${set.completed ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-slate-400'}`}>
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
                                    className={`w-full text-center py-3 rounded-xl font-mono font-bold text-lg tracking-tighter focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner ${
                                        set.completed ? 'bg-transparent text-emerald-400' : 
                                        'bg-slate-900 text-white placeholder:text-slate-700'
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
                                    className={`w-full text-center py-3 rounded-xl font-mono font-bold text-lg tracking-tighter focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner ${
                                        set.completed ? 'bg-transparent text-emerald-400' : 
                                        'bg-slate-900 text-white placeholder:text-slate-700'
                                    }`}
                                />
                            </div>

                            {/* Actions */}
                            <div className="col-span-3 flex justify-center pl-1">
                                <button
                                    onClick={() => toggleComplete(idx)}
                                    className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 shadow-lg ${
                                        set.completed 
                                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-emerald-500/20' 
                                        : isWarning
                                        ? 'bg-red-500 hover:bg-red-400 text-white animate-pulse'
                                        : 'bg-slate-800 hover:bg-primary hover:text-white text-slate-400 border border-slate-700'
                                    }`}
                                >
                                    {set.completed ? <Check size={20} strokeWidth={3} /> : <Check size={20} />}
                                </button>
                            </div>
                            
                             {/* DELETE BUTTON (Absolute positioned on right, appearing on hover/swipe) */}
                             {!set.completed && (
                                <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/set:opacity-100 group-hover/set:translate-x-full transition-all duration-300 z-10 pl-2">
                                    <button 
                                        onClick={() => removeSet(idx)}
                                        className="h-10 w-10 flex items-center justify-center rounded-full bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white transition-colors shadow-lg backdrop-blur-sm"
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
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hacim</span>
                   <span className="text-lg font-mono font-bold text-white">{totalVolume.toLocaleString()} <span className="text-xs text-slate-500">kg</span></span>
                </div>
                <button 
                    onClick={addSet}
                    className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-primary rounded-2xl text-xs font-bold uppercase tracking-widest transition-all border border-slate-700 shadow-lg active:scale-95"
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
