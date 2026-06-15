import type { Exercise, WorkoutProgram, WorkoutSession } from '../types/domain';

export type ExerciseProgressPoint = {
  date: string;
  label: string;
  maxWeight: number;
  volume: number;
};

export type PersonalRecord = {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  date: string;
};

export const getExerciseName = (exercises: Exercise[], id: string) =>
  exercises.find((exercise) => exercise.id === id)?.name ?? 'Удаленное упражнение';

export const getProgramName = (programs: WorkoutProgram[], id?: string) =>
  id ? programs.find((program) => program.id === id)?.name ?? 'Удаленная программа' : 'Без программы';

export const getSessionVolume = (session: WorkoutSession) =>
  session.exercises.reduce(
    (sessionTotal, exercise) =>
      sessionTotal + exercise.sets.reduce((setTotal, set) => setTotal + set.weight * set.reps, 0),
    0,
  );

export const getExerciseProgress = (
  sessions: WorkoutSession[],
  exerciseId: string,
): ExerciseProgressPoint[] =>
  sessions
    .map((session) => {
      const entry = session.exercises.find((exercise) => exercise.exerciseId === exerciseId);
      if (!entry) {
        return null;
      }

      const maxWeight = entry.sets.reduce((max, set) => Math.max(max, set.weight), 0);
      const volume = entry.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);

      return {
        date: session.date,
        label: new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short' }).format(new Date(session.date)),
        maxWeight,
        volume,
      };
    })
    .filter((point): point is ExerciseProgressPoint => Boolean(point))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

export const getSessionVolumePoints = (sessions: WorkoutSession[]) =>
  [...sessions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((session) => ({
      date: session.date,
      label: new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short' }).format(new Date(session.date)),
      volume: getSessionVolume(session),
    }));

export const getWorkoutCount = (sessions: WorkoutSession[], days: number) => {
  const from = Date.now() - days * 24 * 60 * 60 * 1000;
  return sessions.filter((session) => new Date(session.date).getTime() >= from).length;
};

export const getPersonalRecords = (sessions: WorkoutSession[], exercises: Exercise[]): PersonalRecord[] => {
  const records = new Map<string, PersonalRecord>();

  [...sessions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .forEach((session) => {
      session.exercises.forEach((entry) => {
        entry.sets.forEach((set) => {
          const existing = records.get(entry.exerciseId);
          if (!existing || set.weight > existing.weight) {
            records.set(entry.exerciseId, {
              exerciseId: entry.exerciseId,
              exerciseName: getExerciseName(exercises, entry.exerciseId),
              weight: set.weight,
              date: session.date,
            });
          }
        });
      });
    });

  return [...records.values()].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
