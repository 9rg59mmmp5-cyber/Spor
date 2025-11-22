
import { WorkoutLog, UserSettings } from '../types';

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

export const saveWorkoutLog = (log: WorkoutLog): void => {
  const logs = getWorkoutLogs();
  const existingIndex = logs.findIndex(l => l.date === log.date && l.dayId === log.dayId);
  
  if (existingIndex >= 0) {
    logs[existingIndex] = log;
  } else {
    logs.push(log);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
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
