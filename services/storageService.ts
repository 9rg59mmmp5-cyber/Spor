
import { WorkoutLog, UserSettings, ExerciseSet } from '../types';
import { WEEKLY_PROGRAM } from '../constants';

const STORAGE_KEY = 'spor_takip_logs_v1';
const SETTINGS_KEY = 'spor_takip_settings_v1';
const SESSION_KEY = 'spor_takip_session_v1';

export const getWorkoutLogs = (): WorkoutLog[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error parsing workout logs:", error);
    return [];
  }
};

const calculateStatsAndPRs = (currentLog: WorkoutLog, history: WorkoutLog[]): WorkoutLog => {
  let totalVolume = 0;
  let totalSets = 0;
  const prs: string[] = [];

  // 1. Calculate Volume and Sets for current session
  Object.entries(currentLog.exercises).forEach(([exerciseId, sets]) => {
    sets.forEach(set => {
      if (set.completed && set.weight > 0 && set.reps > 0) {
        totalVolume += set.weight * set.reps;
        totalSets++;
      }
    });

    // 2. Check for PRs (Max Weight)
    const currentMaxWeight = Math.max(...sets.filter(s => s.completed).map(s => s.weight), 0);
    
    if (currentMaxWeight > 0) {
      // Find historical max for this exercise
      let historicalMax = 0;
      history.forEach(log => {
        const oldSets = log.exercises[exerciseId] as ExerciseSet[];
        if (oldSets) {
          const max = Math.max(...oldSets.filter(s => s.completed).map(s => s.weight), 0);
          if (max > historicalMax) historicalMax = max;
        }
      });

      // If current is strictly greater than historical, it's a PR
      // Note: We need to be careful not to compare against itself if the log is already saved, 
      // but saveWorkoutLog handles "existingIndex", so usually we are comparing against others.
      // For simplicity here, if current > historicalMax, it is a PR.
      if (currentMaxWeight > historicalMax) {
        // Get exercise name for readability in UI later, but store ID
        prs.push(exerciseId);
      }
    }
  });

  return {
    ...currentLog,
    totalVolume,
    totalSets,
    prs
  };
};

export const saveWorkoutLog = (log: WorkoutLog): WorkoutLog => {
  const logs = getWorkoutLogs();
  
  // Filter out the current log if it exists (to calculate PRs correctly against PAST workouts)
  const history = logs.filter(l => !(l.date === log.date && l.dayId === log.dayId));
  
  // Calculate stats
  const logWithStats = calculateStatsAndPRs(log, history);

  const existingIndex = logs.findIndex(l => l.date === log.date && l.dayId === log.dayId);
  
  if (existingIndex >= 0) {
    logs[existingIndex] = logWithStats;
  } else {
    logs.push(logWithStats);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  return logWithStats;
};

export const startSession = (dayId: string): number => {
  const existingSession = getSessionStartTime(dayId);
  if (existingSession) return existingSession;

  const startTime = Date.now();
  const session = { dayId, startTime };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return startTime;
};

export const endSession = (dayId: string): void => {
  localStorage.removeItem(SESSION_KEY);
};

export const getSessionStartTime = (dayId: string): number | null => {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    
    const session = JSON.parse(stored);
    if (session.dayId === dayId) {
      return session.startTime;
    }
    return null;
  } catch {
    return null;
  }
};

export const getUserSettings = (): UserSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const saveUserSettings = (settings: UserSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};