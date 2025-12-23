
import { WorkoutLog, UserSettings, ExerciseSet, WorkoutDay } from '../types';
import { DEFAULT_PROGRAM } from '../constants';

const LOGS_KEY = 'spor_takip_logs_v1';
const SETTINGS_KEY = 'spor_takip_settings_v1';
const SESSION_KEY = 'spor_takip_session_v1';
const PROGRAM_KEY = 'spor_takip_program_v1';

export const getWorkoutLogs = (): WorkoutLog[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(LOGS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

export const deleteWorkoutLog = (logToDelete: WorkoutLog): WorkoutLog[] => {
  const logs = getWorkoutLogs();
  
  // Kesin eşleşme için Index bulma yöntemi (En güvenilir yöntem)
  const index = logs.findIndex(l => {
    // 1. Eğer ikisinde de startTime varsa, bu benzersiz ID gibidir.
    if (l.startTime && logToDelete.startTime) {
        return String(l.startTime) === String(logToDelete.startTime);
    }
    // 2. Eğer startTime yoksa (eski veri), Tarih, DayID ve Süre eşleşmesine bak.
    return l.date === logToDelete.date && l.dayId === logToDelete.dayId && l.duration === logToDelete.duration;
  });

  if (index !== -1) {
    logs.splice(index, 1); // Sadece bulunan o spesifik kaydı sil
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  }
  
  return logs;
};

export const getProgram = (): WorkoutDay[] => {
  try {
    const stored = localStorage.getItem(PROGRAM_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_PROGRAM;
  } catch { return DEFAULT_PROGRAM; }
};

export const saveProgram = (program: WorkoutDay[]) => {
  localStorage.setItem(PROGRAM_KEY, JSON.stringify(program));
};

export const getNextRecommendedWorkoutId = (): string => {
  const logs = getWorkoutLogs();
  if (logs.length === 0) return 'routine-a';
  
  const lastLog = logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  
  // A/B Alternating Logic
  if (lastLog.dayId === 'routine-a') return 'routine-b';
  if (lastLog.dayId === 'routine-b') return 'routine-a';
  
  return 'routine-a'; // Default
};

export const saveWorkoutLog = (log: WorkoutLog): WorkoutLog => {
  const logs = getWorkoutLogs();
  
  // Eğer aynı startTime'a sahip bir kayıt zaten varsa, onu güncelle (Update/Edit senaryosu)
  const existingIndex = logs.findIndex(l => {
      if (log.startTime && l.startTime) return String(l.startTime) === String(log.startTime);
      return false;
  });

  // Volume and PR Calculation
  let totalVolume = 0;
  let totalSets = 0;
  const prs: string[] = [];
  
  // Geçmiş max değerleri hesapla (PR kontrolü için)
  const history = [...logs]; // Mevcut logları referans al

  Object.entries(log.exercises).forEach(([id, sets]) => {
    const validSets = sets.filter(s => s.completed && s.weight > 0);
    totalSets += validSets.length;
    validSets.forEach(s => totalVolume += s.weight * s.reps);

    const currentMax = Math.max(...validSets.map(s => s.weight), 0);
    if (currentMax > 0) {
      let historicalMax = 0;
      history.forEach(h => {
        // Eğer güncellenen log kendisiyse PR hesabına katma
        if (log.startTime && h.startTime && String(h.startTime) === String(log.startTime)) return;
        
        const oldSets = h.exercises[id];
        if (oldSets) {
          const max = Math.max(...oldSets.filter(s => s.completed).map(s => s.weight), 0);
          if (max > historicalMax) historicalMax = max;
        }
      });
      if (currentMax > historicalMax) prs.push(id);
    }
  });

  const finalLog = { ...log, totalVolume, totalSets, prs };

  if (existingIndex > -1) {
      logs[existingIndex] = finalLog;
  } else {
      logs.push(finalLog);
  }
  
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  return finalLog;
};

export const startSession = (dayId: string): number => {
  const startTime = Date.now();
  localStorage.setItem(SESSION_KEY, JSON.stringify({ dayId, startTime }));
  return startTime;
};

export const endSession = () => localStorage.removeItem(SESSION_KEY);

export const getSessionStartTime = (dayId: string): number | null => {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || '');
    return session.dayId === dayId ? session.startTime : null;
  } catch { return null; }
};

export const getUserSettings = (): UserSettings => {
  try { 
    const stored = localStorage.getItem(SETTINGS_KEY);
    const settings = stored ? JSON.parse(stored) : {};
    return {
      restBetweenSets: 90,
      restBetweenExercises: 120,
      ...settings
    };
  }
  catch { 
    return {
      restBetweenSets: 90,
      restBetweenExercises: 120
    }; 
  }
};

export const saveUserSettings = (s: UserSettings) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
