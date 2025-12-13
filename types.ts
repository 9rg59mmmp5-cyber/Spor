
export interface ExerciseSet {
  reps: number;
  weight: number;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  completed: boolean;
}

export interface ExerciseData {
  id: string;
  name: string;
  targetSets: string; // e.g. "5x5-8"
  targetWeight: string; // e.g. "75"
  lastLog: string; // e.g. "8-7-7-8-10"
}

export interface WorkoutDay {
  id: string;
  name: string;
  exercises: ExerciseData[];
}

export interface WorkoutLog {
  date: string;
  dayId: string;
  startTime?: number; // Timestamp in milliseconds
  endTime?: number; // Timestamp in milliseconds
  duration?: number; // Duration in seconds
  totalVolume?: number; // Total weight lifted in kg
  totalSets?: number; // Total completed sets
  prs?: string[]; // Array of exercise IDs where a PR was set
  exercises: {
    [exerciseId: string]: ExerciseSet[];
  };
}

export interface UserSettings {
  membershipEndDate?: string; // ISO Date string YYYY-MM-DD
  membershipStartDate?: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  WORKOUT = 'WORKOUT',
  HISTORY = 'HISTORY',
  AI_COACH = 'AI_COACH',
  PROFILE = 'PROFILE',
}