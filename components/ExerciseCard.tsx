
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Check, TrendingUp, Trash2, ChevronDown, Edit2, X } from 'lucide-react';
import { ExerciseData, ExerciseSet } from '../types';
import { playSuccessSound, triggerHaptic } from '../utils/audio';
import { ExerciseProgressChart } from './ExerciseProgressChart';
import { getWorkoutLogs } from '../services/storageService';

interface Props {
  exercise: ExerciseData;
  initialLogs: ExerciseSet[];
  onUpdate: (exerciseId: string, logs: ExerciseSet[]) => void;
  onSetComplete: (isExerciseFinished: boolean) => void;
  onTargetChange?: (newTarget: string) => void;
}

// React listesi için kararlı ID yapısı
interface ExtendedSet extends ExerciseSet {
  _id: string;
}

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

export const ExerciseCard: React.FC<Props> = ({ exercise, initialLogs, onUpdate, onSetComplete, onTargetChange }) => {
  const [sets, setSets] = useState<ExtendedSet[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [warningSetIndex, setWarningSetIndex] = useState<number | null>(null);
  
  // Historical Max Logic (PR Hesaplama)
  const [historicalMax, setHistoricalMax] = useState<number>(0);
  
  // Edit Target Mode
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(exercise.targetSets);
  
  // Swipe state
  const [swipedIdx, setSwipedIdx] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStart = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isDragging = useRef(false);

  // Enter ve Blur çakışmasını önlemek için ref
  const ignoreNextAutoCheck = useRef(false);

  // 1. Geçmiş Maksimum Ağırlığı Bul (PR)
  useEffect(() => {
    const logs = getWorkoutLogs();
    let max = 0;
    logs.forEach(log => {
       const logSets = log.exercises[exercise.id];
       if (logSets) {
           logSets.forEach(s => {
               if (s.completed && s.weight > max) max = s.weight;
           });
       }
    });
    setHistoricalMax(max);
  }, [exercise.id]);

  // 2. Veri Senkronizasyonu ve Başlangıç Setleri
  useEffect(() => {
    if (initialLogs && initialLogs.length > 0) {
        setSets(prev => {
            if (prev.length === initialLogs.length) {
                const isDifferent = initialLogs.some((l, i) => 
                    l.weight !== prev[i].weight || 
                    l.reps !== prev[i].reps || 
                    l.completed !== prev[i].completed
                );
                if (!isDifferent) return prev;
            }
            return initialLogs.map((s, i) => ({ 
                ...s, 
                _id: (prev[i] && prev[i]._id) ? prev[i]._id : generateId() 
            }));
        });
    } else if (sets.length === 0) {
      // Varsayılan set sayısı
      const match = exercise.targetSets.match(/^(\d+)x/);
      const defaultSetCount = match ? parseInt(match[1]) : 3;
      
      // Varsayılan ağırlık: Eğer geçmiş rekor varsa onu kullan, yoksa hedef ağırlığı kullan
      const targetWeightNum = parseFloat(exercise.targetWeight.replace(/[^0-9.]/g, '')) || 0;
      const initialWeight = historicalMax > 0 ? historicalMax : targetWeightNum;

      const initial: ExtendedSet[] = Array(defaultSetCount).fill(null).map(() => ({
        _id: generateId(),
        reps: 0,
        weight: initialWeight, // Otomatik dolacak değer (En yüksek ağırlık)
        completed: false
      }));
      setSets(initial);
    }
  }, [initialLogs, exercise.targetSets, exercise.targetWeight, historicalMax]); 

  const updateParent = (currentSets: ExtendedSet[]) => {
    const cleanSets = currentSets.map(({ _id, ...rest }) => rest);
    onUpdate(exercise.id, cleanSets);
  };

  const handleSetChange = (id: string, field: 'reps' | 'weight', value: string) => {
    const newSets = sets.map(s => {
        if (s._id === id) {
            const numVal = value === '' ? 0 : parseFloat(value);
            return { ...s, [field]: numVal };
        }
        return s;
    });
    setSets(newSets);
    updateParent(newSets);
  };

  const saveTargetChange = () => {
    setIsEditingTarget(false);
    if (onTargetChange && tempTarget !== exercise.targetSets) {
        onTargetChange(tempTarget);
        
        const match = tempTarget.match(/^(\d+)x/);
        if (match) {
            const newCount = parseInt(match[1]);
            let newSets = [...sets];
            
            if (newCount > sets.length) {
                const setsToAdd = newCount - sets.length;
                const lastSet = sets[sets.length - 1] || { weight: 0, reps: 0 };
                for(let i=0; i<setsToAdd; i++) {
                    newSets.push({
                        _id: generateId(),
                        reps: 0,
                        weight: lastSet.weight,
                        completed: false
                    });
                }
                setSets(newSets);
                updateParent(newSets);
            } else if (newCount < sets.length) {
                // Set sayısı azaltıldıysa sondakileri sil
                newSets = newSets.slice(0, newCount);
                setSets(newSets);
                updateParent(newSets);
            }
        }
    }
  };

  const toggleComplete = (id: string) => {
    if (swipedIdx === id) {
      setSwipedIdx(null);
      setSwipeOffset(0);
      return;
    }

    const index = sets.findIndex(s => s._id === id);
    if (index === -1) return;

    const currentSet = sets[index];
    const isCompleting = !currentSet.completed;

    if (isCompleting && (currentSet.weight <= 0 || currentSet.reps <= 0)) {
        setWarningSetIndex(index);
        triggerHaptic(100);
        setTimeout(() => setWarningSetIndex(null), 1000);
        return;
    }

    const newSets = [...sets];
    newSets[index] = { ...newSets[index], completed: isCompleting };
    setSets(newSets);
    updateParent(newSets);

    if (isCompleting) {
      playSuccessSound();
      triggerHaptic(50);
      onSetComplete(newSets.every(s => s.completed));
    }
  };

  const handleAutoCheck = (id: string) => {
    // Eğer Enter tuşu ile tetiklendiyse, blur olayını yoksay
    if (ignoreNextAutoCheck.current) {
        ignoreNextAutoCheck.current = false;
        return;
    }
    const set = sets.find(s => s._id === id);
    if (set && !set.completed && set.weight > 0 && set.reps > 0) {
        toggleComplete(id);
    }
  };

  const addSet = () => {
    const lastSet = sets[sets.length - 1] || { reps: 0, weight: 0, completed: false };
    const { _id, completed, ...restLastSet } = lastSet; 
    const newSet = { 
        ...restLastSet, 
        completed: false, 
        _id: generateId() 
    };
    const newSets = [...sets, newSet];
    setSets(newSets);
    updateParent(newSets);
    triggerHaptic(50);
  };

  const removeSet = (idToRemove: string) => {
    setSwipedIdx(null);
    setSwipeOffset(0);
    triggerHaptic(50);
    const newSets = sets.filter(s => s._id !== idToRemove);
    setSets(newSets);
    updateParent(newSets);
  };

  // --- MOBİL UYUMLU SWIPE ---
  const handleTouchStart = (setEvent: React.TouchEvent, id: string) => {
    const set = sets.find(s => s._id === id);
    if (!set) return; 
    
    // Android Fix: Eğer tıklanan element bir INPUT ise swipe işlemini başlatma.
    const target = setEvent.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.closest('input')) return;
    
    if (target.closest('.delete-btn-area')) return;

    touchStart.current = setEvent.touches[0].clientX;
    touchStartY.current = setEvent.touches[0].clientY;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || touchStart.current === null || touchStartY.current === null) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    
    const diffX = touchStart.current - currentX;
    const diffY = Math.abs(currentY - touchStartY.current);

    // Dikey kaydırma (scroll) yapılıyorsa swipe'ı iptal et
    if (diffY > Math.abs(diffX)) {
        isDragging.current = false;
        return;
    }

    // Sadece sola çekmeye izin ver (Pozitif diffX sola kaydırma demektir, çünkü start - current > 0)
    if (diffX > 0) {
        setSwipeOffset(Math.min(diffX, 80)); 
    }
  };

  const handleTouchEnd = (e: React.TouchEvent, id: string) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    touchStart.current = null;
    touchStartY.current = null;

    if (swipeOffset > 40) {
        setSwipedIdx(id);
        setSwipeOffset(80);
    } else {
        setSwipedIdx(null);
        setSwipeOffset(0);
    }
  };

  // --- DYNAMIC BADGE LOGIC ---
  const currentSetCount = sets.length;
  const displaySetBadge = exercise.targetSets.match(/^\d+[xX]/)
    ? exercise.targetSets.replace(/^\d+/, currentSetCount.toString())
    : `${currentSetCount} SET`;

  const currentMaxWeight = Math.max(...sets.map(s => s.weight || 0));
  
  const displayWeightBadge = (currentMaxWeight > 0)
    ? `${currentMaxWeight} KG`
    : exercise.targetWeight;

  return (
    <div className={`border border-zinc-800 rounded-3xl overflow-hidden shadow-lg transition-all duration-300 ${isExpanded ? 'bg-zinc-900' : 'bg-black'}`}>
        
        {/* Header Section */}
        <div className="p-5 active:bg-zinc-900/50 transition-colors" onClick={() => !isEditingTarget && setIsExpanded(!isExpanded)}>
            <div className="flex justify-between items-start">
                <div className="flex-1 space-y-2">
                    <h3 className="font-bold text-lg text-white leading-tight">{exercise.name}</h3>
                    {/* Badges */}
                    <div className="flex items-center gap-2">
                        {isEditingTarget ? (
                            <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-1 border border-primary/50" onClick={e => e.stopPropagation()}>
                                <input 
                                    value={tempTarget}
                                    onChange={(e) => setTempTarget(e.target.value)}
                                    className="bg-transparent text-white text-xs font-bold uppercase w-24 text-center focus:outline-none"
                                    autoFocus
                                    onBlur={saveTargetChange}
                                    onKeyDown={(e) => e.key === 'Enter' && saveTargetChange()}
                                />
                                <button onClick={saveTargetChange} className="p-1 bg-primary rounded text-white"><Check size={12} /></button>
                            </div>
                        ) : (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onTargetChange) setIsEditingTarget(true);
                                }}
                                className="bg-zinc-900 border border-zinc-800 text-zinc-500 text-[10px] font-bold px-3 py-1.5 rounded-lg tracking-wider uppercase active:bg-zinc-800 active:text-white transition-colors flex items-center gap-1"
                            >
                                {displaySetBadge} <Edit2 size={10} className="opacity-50" />
                            </button>
                        )}
                        
                        <span className="bg-zinc-900 border border-zinc-800 text-zinc-500 text-[10px] font-bold px-3 py-1.5 rounded-lg tracking-wider uppercase transition-all duration-300">
                            {displayWeightBadge}
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                     <button 
                        onClick={(e) => { e.stopPropagation(); setShowChart(!showChart); }} 
                        className={`w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center transition-colors ${showChart ? 'text-primary border-primary/30' : 'text-zinc-600 hover:text-white'}`}
                     >
                        <TrendingUp size={18} />
                     </button>
                     <div className={`w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-white' : ''}`}>
                        <ChevronDown size={20} />
                     </div>
                </div>
            </div>

            {/* MAVİ İLERLEME ÇİZGİSİ (SEGMENTED BAR) */}
            <div className="flex gap-0.5 mt-4 h-0.5 w-full px-1">
                {sets.map((s, i) => (
                    <div 
                        key={s._id || i} 
                        className={`h-full flex-1 rounded-full transition-all duration-300 ${s.completed ? 'bg-primary shadow-[0_0_8px_rgba(10,132,255,0.6)]' : 'bg-zinc-800'}`} 
                    />
                ))}
            </div>

            {showChart && (
                <div className="mt-4 mb-2 animate-in slide-in-from-top-4 duration-300" onClick={e => e.stopPropagation()}>
                    <ExerciseProgressChart exerciseId={exercise.id} exerciseName={exercise.name} />
                </div>
            )}
        </div>

        {/* Sets Section */}
        {isExpanded && (
            <div className="p-2 bg-black/40 border-t border-zinc-800 space-y-2">
                <div className="grid grid-cols-10 gap-2 px-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-center mb-1">
                    <div className="col-span-1">#</div>
                    <div className="col-span-3">KG</div>
                    <div className="col-span-3">TEKRAR</div>
                    <div className="col-span-3">DURUM</div>
                </div>

                {sets.map((set, index) => {
                    let placeholderWeight = '';
                    if (index === 0) {
                        placeholderWeight = historicalMax > 0 
                            ? historicalMax.toString() 
                            : exercise.targetWeight.replace(/[^0-9.]/g, '');
                    } else {
                        const prevSet = sets[index - 1];
                        placeholderWeight = (prevSet && prevSet.weight > 0) 
                            ? prevSet.weight.toString() 
                            : (historicalMax > 0 ? historicalMax.toString() : '');
                    }

                    // --- RENK MANTIĞI ---
                    const rowBorderClass = set.completed 
                        ? 'border-emerald-500/50 bg-zinc-900 shadow-[inset_0_0_15px_rgba(16,185,129,0.05)]' 
                        : (warningSetIndex === index ? 'border-red-500 bg-zinc-900' : 'border-zinc-800 bg-zinc-900');
                        
                    const inputClass = set.completed 
                        ? 'text-emerald-500 border-transparent' 
                        : 'text-white border-zinc-800 placeholder:text-zinc-700';

                    const indexBadgeClass = set.completed 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                        : 'bg-zinc-800 text-zinc-500';

                    const buttonClass = set.completed 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                        : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700';

                    return (
                        <div key={set._id} className="relative overflow-hidden h-12">
                            {/* Delete Background Button - Sadece Swipe ile görünür */}
                            <div className="absolute inset-y-0 right-0 w-20 bg-red-600 flex items-center justify-center rounded-xl delete-btn-area z-0">
                                <button onClick={() => removeSet(set._id)} className="w-full h-full flex items-center justify-center text-white">
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            {/* Set Row Content - Üst Katman */}
                            <div 
                                className={`relative z-10 grid grid-cols-10 gap-2 items-center rounded-xl p-1 transition-transform duration-200 border select-none ${rowBorderClass}`}
                                style={{ 
                                    transform: `translateX(-${swipedIdx === set._id ? swipeOffset : 0}px)`,
                                    touchAction: 'pan-y'
                                }}
                                onTouchStart={(e) => handleTouchStart(e, set._id)}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={(e) => handleTouchEnd(e, set._id)}
                            >
                                <div className="col-span-1 flex justify-center">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${indexBadgeClass}`}>
                                        {index + 1}
                                    </div>
                                </div>
                                <div className="col-span-3">
                                    <input 
                                        type="number"
                                        inputMode="decimal"
                                        placeholder={placeholderWeight}
                                        value={set.weight || ''}
                                        onChange={(e) => handleSetChange(set._id, 'weight', e.target.value)}
                                        disabled={set.completed} // Kilitli
                                        className={`w-full bg-black text-center font-bold py-2 rounded-lg border focus:outline-none focus:border-primary transition-colors ${inputClass}`}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input 
                                        type="number"
                                        inputMode="numeric"
                                        placeholder="0"
                                        value={set.reps || ''}
                                        onChange={(e) => handleSetChange(set._id, 'reps', e.target.value)}
                                        onBlur={() => handleAutoCheck(set._id)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                ignoreNextAutoCheck.current = true;
                                                toggleComplete(set._id);
                                                (e.target as HTMLInputElement).blur();
                                            }
                                        }}
                                        disabled={set.completed} // Kilitli
                                        className={`w-full bg-black text-center font-bold py-2 rounded-lg border focus:outline-none focus:border-primary transition-colors ${inputClass}`}
                                    />
                                </div>
                                <div className="col-span-3 flex justify-center">
                                    <button 
                                        onClick={() => toggleComplete(set._id)}
                                        className={`w-full h-9 rounded-lg flex items-center justify-center transition-all active:scale-95 ${buttonClass}`}
                                    >
                                        {set.completed ? <Check size={20} strokeWidth={3} /> : <div className="w-4 h-4 rounded-full border-2 border-zinc-600"></div>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                <button 
                    onClick={addSet}
                    className="w-full py-3 mt-2 flex items-center justify-center gap-2 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 rounded-xl transition-all border border-dashed border-zinc-700 hover:border-zinc-500 text-xs font-bold uppercase tracking-wider active:scale-95"
                >
                    <Plus size={16} /> SET EKLE
                </button>
            </div>
        )}
    </div>
  );
};
