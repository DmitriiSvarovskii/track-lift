import type { ProgramExercise } from '../types/domain';

export const parsePlannedReps = (value: string) => {
  const normalized = value.trim();

  if (!normalized) {
    return {
      plannedReps: undefined,
      plannedRepsText: undefined,
      plannedRepsMax: undefined,
    };
  }

  if (/^(max|мах)$/i.test(normalized)) {
    return {
      plannedReps: undefined,
      plannedRepsText: 'MAX',
      plannedRepsMax: true,
    };
  }

  const cleanText = normalized.replace(/[хx×]/gi, '/').replace(/\s+/g, '');
  const firstNumber = Number(cleanText.split('/').find(Boolean));

  return {
    plannedReps: Number.isFinite(firstNumber) && firstNumber > 0 ? firstNumber : undefined,
    plannedRepsText: cleanText || undefined,
    plannedRepsMax: undefined,
  };
};

export const formatPlannedReps = (entry: Pick<ProgramExercise, 'plannedReps' | 'plannedRepsText' | 'plannedRepsMax'>) => {
  if (entry.plannedRepsMax) {
    return 'MAX';
  }

  return entry.plannedRepsText || entry.plannedReps?.toString() || '-';
};

export const getPlannedRepsForSet = (
  entry: Pick<ProgramExercise, 'plannedReps' | 'plannedRepsText' | 'plannedRepsMax'>,
  setIndex: number,
) => {
  if (entry.plannedRepsMax) {
    return 0;
  }

  const sequence = entry.plannedRepsText
    ?.split('/')
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (sequence?.length) {
    return sequence[Math.min(setIndex, sequence.length - 1)];
  }

  return entry.plannedReps ?? 0;
};
