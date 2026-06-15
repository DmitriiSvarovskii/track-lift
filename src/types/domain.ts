export type ExerciseType = 'strength' | 'cardio' | 'stretching' | 'other';

export type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  type: ExerciseType;
  description?: string;
  youtubeUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProgramExercise = {
  id: string;
  exerciseId: string;
  order: number;
  plannedSets?: number;
  plannedReps?: number;
  comment?: string;
};

export type WorkoutProgram = {
  id: string;
  name: string;
  description?: string;
  exercises: ProgramExercise[];
  createdAt: string;
  updatedAt: string;
};

export type WorkoutSet = {
  id: string;
  weight: number;
  reps: number;
};

export type AppUser = {
  id: string;
  telegramId: string;
  displayName: string;
  username?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthSession = {
  userId: string;
  lastActivityAt: string;
  expiresAt: string;
};

export type TelegramAuthPayload = {
  idToken?: string;
  user: {
    id?: number | string;
    sub?: number | string;
    name?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    preferred_username?: string;
    photo_url?: string;
    picture?: string;
  };
};

export type UserTrainingData = {
  exercises: Exercise[];
  programs: WorkoutProgram[];
  sessions: WorkoutSession[];
};

export type WorkoutSessionExercise = {
  id: string;
  exerciseId: string;
  sets: WorkoutSet[];
  comment?: string;
};

export type WorkoutSession = {
  id: string;
  programId?: string;
  date: string;
  title: string;
  exercises: WorkoutSessionExercise[];
  comment?: string;
  createdAt: string;
  updatedAt: string;
};
