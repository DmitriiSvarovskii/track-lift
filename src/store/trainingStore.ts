import { create } from 'zustand';
import { api } from '../api/client';
import type {
  AppUser,
  AuthSession,
  Exercise,
  ExerciseType,
  ProgramExercise,
  TelegramAuthPayload,
  UserTrainingData,
  WorkoutProgram,
  WorkoutSession,
  WorkoutSessionExercise,
} from '../types/domain';
import { createId, nowIso } from '../utils/ids';

const ACTIVITY_THROTTLE_MS = 60 * 1000;

type ExerciseInput = {
  name: string;
  muscleGroup: string;
  type: ExerciseType;
  description?: string;
  youtubeUrl?: string;
  isActive: boolean;
};

type ProgramInput = {
  name: string;
  description?: string;
  exercises: Omit<ProgramExercise, 'id'>[];
};

type WorkoutSessionInput = {
  programId?: string;
  date: string;
  title: string;
  exercises: WorkoutSessionExercise[];
  comment?: string;
};

type AuthStatus = 'checking' | 'authenticated' | 'anonymous';

type TrainingState = {
  user?: AppUser;
  authSession?: AuthSession;
  authStatus: AuthStatus;
  exercises: Exercise[];
  programs: WorkoutProgram[];
  sessions: WorkoutSession[];
  isSyncing: boolean;
  syncError?: string;
  initializeAuth: () => Promise<void>;
  loginWithTelegram: (payload: TelegramAuthPayload) => Promise<void>;
  logout: () => Promise<void>;
  touchSession: () => Promise<void>;
  getCurrentUser: () => AppUser | undefined;
  addExercise: (input: ExerciseInput) => void;
  updateExercise: (id: string, input: ExerciseInput) => void;
  deleteExercise: (id: string) => void;
  addProgram: (input: ProgramInput) => void;
  updateProgram: (id: string, input: ProgramInput) => void;
  deleteProgram: (id: string) => void;
  addSession: (input: WorkoutSessionInput) => void;
  deleteSession: (id: string) => void;
};

const emptyData: UserTrainingData = {
  exercises: [],
  programs: [],
  sessions: [],
};

let lastTouchRequest = 0;

const getCurrentData = (state: TrainingState): UserTrainingData => ({
  exercises: state.exercises,
  programs: state.programs,
  sessions: state.sessions,
});

const saveTrainingSnapshot = async (data: UserTrainingData, set: (partial: Partial<TrainingState>) => void) => {
  set({ isSyncing: true, syncError: undefined });

  try {
    const savedData = await api.saveTraining(data);
    set({
      ...savedData,
      isSyncing: false,
      syncError: undefined,
    });
  } catch (error) {
    set({
      isSyncing: false,
      syncError: error instanceof Error ? error.message : 'Не удалось сохранить данные',
    });
  }
};

const applyAndSync = (
  state: TrainingState,
  set: (partial: Partial<TrainingState>) => void,
  data: UserTrainingData,
) => {
  void saveTrainingSnapshot(data, set);
  return {
    ...state,
    ...data,
    syncError: undefined,
  };
};

export const useTrainingStore = create<TrainingState>()((set, get) => ({
  user: undefined,
  authSession: undefined,
  authStatus: 'checking',
  exercises: [],
  programs: [],
  sessions: [],
  isSyncing: false,
  syncError: undefined,
  initializeAuth: async () => {
    set({ authStatus: 'checking' });

    try {
      const auth = await api.me();
      const trainingData = await api.getTraining();
      set({
        user: auth.user,
        authSession: auth.session,
        authStatus: 'authenticated',
        ...trainingData,
        syncError: undefined,
      });
    } catch {
      set({
        user: undefined,
        authSession: undefined,
        authStatus: 'anonymous',
        ...emptyData,
      });
    }
  },
  loginWithTelegram: async (payload) => {
    const auth = await api.loginWithTelegram(payload);
    const trainingData = await api.getTraining();
    set({
      user: auth.user,
      authSession: auth.session,
      authStatus: 'authenticated',
      ...trainingData,
      syncError: undefined,
    });
  },
  logout: async () => {
    try {
      await api.logout();
    } finally {
      set({
        user: undefined,
        authSession: undefined,
        authStatus: 'anonymous',
        ...emptyData,
      });
    }
  },
  touchSession: async () => {
    const now = Date.now();
    if (now - lastTouchRequest < ACTIVITY_THROTTLE_MS) {
      return;
    }

    lastTouchRequest = now;

    try {
      const auth = await api.touchSession();
      set({ user: auth.user, authSession: auth.session, authStatus: 'authenticated' });
    } catch {
      set({
        user: undefined,
        authSession: undefined,
        authStatus: 'anonymous',
        ...emptyData,
      });
    }
  },
  getCurrentUser: () => get().user,
  addExercise: (input) =>
    set((state) => {
      const data = getCurrentData(state);
      const timestamp = nowIso();
      return applyAndSync(state, set, {
        ...data,
        exercises: [
          ...data.exercises,
          {
            id: createId(),
            createdAt: timestamp,
            updatedAt: timestamp,
            ...input,
          },
        ],
      });
    }),
  updateExercise: (id, input) =>
    set((state) => {
      const data = getCurrentData(state);
      return applyAndSync(state, set, {
        ...data,
        exercises: data.exercises.map((exercise) =>
          exercise.id === id ? { ...exercise, ...input, updatedAt: nowIso() } : exercise,
        ),
      });
    }),
  deleteExercise: (id) =>
    set((state) => {
      const data = getCurrentData(state);
      return applyAndSync(state, set, {
        ...data,
        exercises: data.exercises.filter((exercise) => exercise.id !== id),
        programs: data.programs.map((program) => ({
          ...program,
          exercises: program.exercises.filter((exercise) => exercise.exerciseId !== id),
          updatedAt: nowIso(),
        })),
      });
    }),
  addProgram: (input) =>
    set((state) => {
      const data = getCurrentData(state);
      const timestamp = nowIso();
      return applyAndSync(state, set, {
        ...data,
        programs: [
          ...data.programs,
          {
            id: createId(),
            createdAt: timestamp,
            updatedAt: timestamp,
            name: input.name,
            description: input.description,
            exercises: input.exercises.map((exercise) => ({
              ...exercise,
              id: createId(),
            })),
          },
        ],
      });
    }),
  updateProgram: (id, input) =>
    set((state) => {
      const data = getCurrentData(state);
      return applyAndSync(state, set, {
        ...data,
        programs: data.programs.map((program) =>
          program.id === id
            ? {
                ...program,
                name: input.name,
                description: input.description,
                exercises: input.exercises.map((exercise) => ({ ...exercise, id: createId() })),
                updatedAt: nowIso(),
              }
            : program,
        ),
      });
    }),
  deleteProgram: (id) =>
    set((state) => {
      const data = getCurrentData(state);
      return applyAndSync(state, set, {
        ...data,
        programs: data.programs.filter((program) => program.id !== id),
      });
    }),
  addSession: (input) =>
    set((state) => {
      const data = getCurrentData(state);
      const timestamp = nowIso();
      return applyAndSync(state, set, {
        ...data,
        sessions: [
          {
            id: createId(),
            createdAt: timestamp,
            updatedAt: timestamp,
            ...input,
          },
          ...data.sessions,
        ],
      });
    }),
  deleteSession: (id) =>
    set((state) => {
      const data = getCurrentData(state);
      return applyAndSync(state, set, {
        ...data,
        sessions: data.sessions.filter((session) => session.id !== id),
      });
    }),
}));
