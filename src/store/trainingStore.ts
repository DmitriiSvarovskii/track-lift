import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const ACTIVITY_THROTTLE_MS = 60 * 1000;

type ExerciseInput = {
  name: string;
  muscleGroup: string;
  type: ExerciseType;
  description?: string;
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

type TrainingState = {
  users: Record<string, AppUser>;
  userData: Record<string, UserTrainingData>;
  authSession?: AuthSession;
  currentUserId?: string;
  exercises: Exercise[];
  programs: WorkoutProgram[];
  sessions: WorkoutSession[];
  loginWithTelegram: (payload: TelegramAuthPayload) => void;
  logout: () => void;
  validateSession: () => void;
  touchSession: () => void;
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

const sessionExpiresAt = (date = Date.now()) => new Date(date + SESSION_TTL_MS).toISOString();

const createSession = (userId: string): AuthSession => {
  const now = nowIso();
  return {
    userId,
    lastActivityAt: now,
    expiresAt: sessionExpiresAt(),
  };
};

const isSessionActive = (session?: AuthSession) => Boolean(session && new Date(session.expiresAt).getTime() > Date.now());

const emptyData: UserTrainingData = {
  exercises: [],
  programs: [],
  sessions: [],
};

const createSeedExercises = (): Exercise[] => {
  const timestamp = nowIso();
  return [
    {
      id: 'exercise-bench-press',
      name: 'Жим лежа',
      muscleGroup: 'Грудь',
      type: 'strength',
      description: 'Контролируйте опускание штанги, держите лопатки сведенными.',
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'exercise-squat',
      name: 'Присед',
      muscleGroup: 'Ноги',
      type: 'strength',
      description: 'Сохраняйте нейтральную спину и устойчивую стопу.',
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'exercise-deadlift',
      name: 'Становая тяга',
      muscleGroup: 'Спина',
      type: 'strength',
      description: 'Начинайте движение ногами, держите гриф близко к корпусу.',
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'exercise-pullups',
      name: 'Подтягивания',
      muscleGroup: 'Спина',
      type: 'strength',
      description: 'Работайте в полной амплитуде без рывков.',
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'exercise-leg-press',
      name: 'Жим ногами',
      muscleGroup: 'Ноги',
      type: 'strength',
      description: 'Не блокируйте колени в верхней точке.',
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
};

const createInitialData = (): UserTrainingData => ({
  exercises: createSeedExercises(),
  programs: [],
  sessions: [],
});

const getTelegramId = (payload: TelegramAuthPayload) => String(payload.user.id ?? payload.user.sub ?? '');

const getDisplayName = (payload: TelegramAuthPayload) => {
  const fullName = [payload.user.first_name, payload.user.last_name].filter(Boolean).join(' ').trim();
  return payload.user.name || fullName || payload.user.username || payload.user.preferred_username || 'Telegram user';
};

const getCurrentData = (state: TrainingState) =>
  state.currentUserId ? state.userData[state.currentUserId] ?? createInitialData() : emptyData;

const syncCurrentData = (state: TrainingState, data: UserTrainingData) => {
  if (!state.currentUserId) {
    return state;
  }

  return {
    ...state,
    userData: {
      ...state.userData,
      [state.currentUserId]: data,
    },
    exercises: data.exercises,
    programs: data.programs,
    sessions: data.sessions,
  };
};

const clearSessionState = () => ({
  authSession: undefined,
  currentUserId: undefined,
  exercises: [],
  programs: [],
  sessions: [],
});

export const useTrainingStore = create<TrainingState>()(
  persist(
    (set, get) => ({
      users: {},
      userData: {},
      authSession: undefined,
      currentUserId: undefined,
      exercises: [],
      programs: [],
      sessions: [],
      loginWithTelegram: (payload) =>
        set((state) => {
          const telegramId = getTelegramId(payload);

          if (!telegramId) {
            return state;
          }

          const existingUser = state.users[telegramId];
          const timestamp = nowIso();
          const user: AppUser = {
            id: telegramId,
            telegramId,
            displayName: getDisplayName(payload),
            username: payload.user.username ?? payload.user.preferred_username,
            avatarUrl: payload.user.photo_url ?? payload.user.picture,
            createdAt: existingUser?.createdAt ?? timestamp,
            updatedAt: timestamp,
          };
          const data = state.userData[telegramId] ?? createInitialData();

          return {
            ...state,
            users: {
              ...state.users,
              [telegramId]: user,
            },
            userData: {
              ...state.userData,
              [telegramId]: data,
            },
            authSession: createSession(telegramId),
            currentUserId: telegramId,
            exercises: data.exercises,
            programs: data.programs,
            sessions: data.sessions,
          };
        }),
      logout: () => set(clearSessionState()),
      validateSession: () =>
        set((state) => {
          if (!state.authSession) {
            return state;
          }

          if (!isSessionActive(state.authSession)) {
            return {
              ...state,
              ...clearSessionState(),
            };
          }

          const data = state.userData[state.authSession.userId] ?? createInitialData();

          return {
            ...state,
            currentUserId: state.authSession.userId,
            userData: {
              ...state.userData,
              [state.authSession.userId]: data,
            },
            exercises: data.exercises,
            programs: data.programs,
            sessions: data.sessions,
          };
        }),
      touchSession: () =>
        set((state) => {
          if (!state.authSession || !isSessionActive(state.authSession)) {
            return {
              ...state,
              ...clearSessionState(),
            };
          }

          const lastActivity = new Date(state.authSession.lastActivityAt).getTime();
          const now = Date.now();

          if (now - lastActivity < ACTIVITY_THROTTLE_MS) {
            return state;
          }

          return {
            ...state,
            authSession: {
              ...state.authSession,
              lastActivityAt: new Date(now).toISOString(),
              expiresAt: sessionExpiresAt(now),
            },
          };
        }),
      getCurrentUser: () => {
        const state = get();
        return state.currentUserId ? state.users[state.currentUserId] : undefined;
      },
      addExercise: (input) =>
        set((state) => {
          const data = getCurrentData(state);
          const timestamp = nowIso();
          return syncCurrentData(state, {
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
          return syncCurrentData(state, {
            ...data,
            exercises: data.exercises.map((exercise) =>
              exercise.id === id ? { ...exercise, ...input, updatedAt: nowIso() } : exercise,
            ),
          });
        }),
      deleteExercise: (id) =>
        set((state) => {
          const data = getCurrentData(state);
          return syncCurrentData(state, {
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
          return syncCurrentData(state, {
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
          return syncCurrentData(state, {
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
          return syncCurrentData(state, {
            ...data,
            programs: data.programs.filter((program) => program.id !== id),
          });
        }),
      addSession: (input) =>
        set((state) => {
          const data = getCurrentData(state);
          const timestamp = nowIso();
          return syncCurrentData(state, {
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
          return syncCurrentData(state, {
            ...data,
            sessions: data.sessions.filter((session) => session.id !== id),
          });
        }),
    }),
    {
      name: 'track-lift-storage',
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<TrainingState> | undefined;

        return {
          users: state?.users ?? {},
          userData: state?.userData ?? {},
          authSession: state?.authSession,
          currentUserId: state?.currentUserId,
          exercises: state?.currentUserId ? state?.userData?.[state.currentUserId]?.exercises ?? [] : [],
          programs: state?.currentUserId ? state?.userData?.[state.currentUserId]?.programs ?? [] : [],
          sessions: state?.currentUserId ? state?.userData?.[state.currentUserId]?.sessions ?? [] : [],
        };
      },
    },
  ),
);
