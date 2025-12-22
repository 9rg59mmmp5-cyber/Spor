
export interface ExerciseSet {
  reps: number;
  weight: number;
  rpe?: number;
  completed: boolean;
}

export interface ExerciseData {
  id: string;
  name: string;
  targetSets: string;
  targetWeight: string;
  lastLog?: string;
}

export interface WorkoutDay {
  id: string;
  name: string;
  exercises: ExerciseData[];
}

export interface WorkoutLog {
  date: string;
  dayId: string;
  startTime?: number;
  endTime?: number;
  duration?: number;
  totalVolume?: number;
  totalSets?: number;
  prs?: string[];
  exercises: {
    [exerciseId: string]: ExerciseSet[];
  };
}

export interface UserSettings {
  membershipEndDate?: string;
  membershipStartDate?: string;
  restBetweenSets?: number; // Saniye cinsinden
  restBetweenExercises?: number; // Saniye cinsinden
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  WORKOUT = 'WORKOUT',
  HISTORY = 'HISTORY',
  PROFILE = 'PROFILE',
}
