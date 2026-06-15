import { Plus, Save, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrainingStore } from '../store/trainingStore';
import type { WorkoutSessionExercise } from '../types/domain';
import { createId } from '../utils/ids';
import { getExerciseName } from '../utils/metrics';

const toLocalDateTimeInput = (date = new Date()) => {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 16);
};

export function WorkoutPage() {
  const navigate = useNavigate();
  const { exercises, programs, addSession } = useTrainingStore();
  const activeExercises = exercises.filter((exercise) => exercise.isActive);
  const [programId, setProgramId] = useState('');
  const [title, setTitle] = useState('Свободная тренировка');
  const [date, setDate] = useState(toLocalDateTimeInput());
  const [comment, setComment] = useState('');
  const [entries, setEntries] = useState<WorkoutSessionExercise[]>([]);

  const selectedProgram = useMemo(() => programs.find((program) => program.id === programId), [programId, programs]);

  const applyProgram = (id: string) => {
    const program = programs.find((item) => item.id === id);
    setProgramId(id);

    if (!program) {
      setTitle('Свободная тренировка');
      setEntries([]);
      return;
    }

    setTitle(program.name);
    setEntries(
      [...program.exercises]
        .sort((a, b) => a.order - b.order)
        .map((programExercise) => ({
          id: createId(),
          exerciseId: programExercise.exerciseId,
          comment: programExercise.comment ?? '',
          sets: Array.from({ length: Math.max(programExercise.plannedSets ?? 1, 1) }, () => ({
            id: createId(),
            weight: 0,
            reps: programExercise.plannedReps ?? 0,
          })),
        })),
    );
  };

  const addExerciseEntry = () => {
    if (!activeExercises[0]) {
      return;
    }

    setEntries((current) => [
      ...current,
      {
        id: createId(),
        exerciseId: activeExercises[0].id,
        sets: [{ id: createId(), weight: 0, reps: 10 }],
        comment: '',
      },
    ]);
  };

  const saveWorkout = () => {
    const preparedEntries = entries
      .map((entry) => ({
        ...entry,
        sets: entry.sets.filter((set) => set.reps > 0 || set.weight > 0),
      }))
      .filter((entry) => entry.sets.length);

    if (!title.trim() || !preparedEntries.length) {
      return;
    }

    addSession({
      programId: programId || undefined,
      title: title.trim(),
      date: new Date(date).toISOString(),
      comment: comment.trim(),
      exercises: preparedEntries,
    });

    navigate('/history');
  };

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Запись</p>
          <h1>Тренировка</h1>
        </div>
        <button className="primary-button header-action" type="button" onClick={saveWorkout} disabled={!entries.length}>
          <Save size={19} />
          Сохранить
        </button>
      </header>

      <div className="panel workout-setup">
        <label className="field">
          <span>Программа</span>
          <select value={programId} onChange={(event) => applyProgram(event.target.value)}>
            <option value="">Без программы</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Название</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="field">
          <span>Дата</span>
          <input type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
      </div>

      {selectedProgram?.description && <p className="hint-line">{selectedProgram.description}</p>}

      <div className="workout-list">
        {entries.length ? (
          entries.map((entry, entryIndex) => (
            <article className="panel workout-card" key={entry.id}>
              <div className="workout-card-heading">
                <label className="field exercise-select">
                  <span>Упражнение</span>
                  <select
                    value={entry.exerciseId}
                    onChange={(event) =>
                      setEntries((current) =>
                        current.map((item, index) =>
                          index === entryIndex ? { ...item, exerciseId: event.target.value } : item,
                        ),
                      )
                    }
                  >
                    {activeExercises.map((exercise) => (
                      <option key={exercise.id} value={exercise.id}>
                        {exercise.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="icon-button danger"
                  type="button"
                  onClick={() => setEntries((current) => current.filter((_, index) => index !== entryIndex))}
                  title="Удалить упражнение"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="sets-table">
                <div className="sets-head">
                  <span>Подход</span>
                  <span>Вес, кг</span>
                  <span>Повторы</span>
                  <span />
                </div>
                {entry.sets.map((set, setIndex) => (
                  <div className="set-row" key={set.id}>
                    <strong>{setIndex + 1}</strong>
                    <input
                      type="number"
                      min="0"
                      inputMode="decimal"
                      value={set.weight}
                      onChange={(event) =>
                        setEntries((current) =>
                          current.map((item, index) =>
                            index === entryIndex
                              ? {
                                  ...item,
                                  sets: item.sets.map((itemSet, indexSet) =>
                                    indexSet === setIndex ? { ...itemSet, weight: Number(event.target.value) } : itemSet,
                                  ),
                                }
                              : item,
                          ),
                        )
                      }
                    />
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={set.reps}
                      onChange={(event) =>
                        setEntries((current) =>
                          current.map((item, index) =>
                            index === entryIndex
                              ? {
                                  ...item,
                                  sets: item.sets.map((itemSet, indexSet) =>
                                    indexSet === setIndex ? { ...itemSet, reps: Number(event.target.value) } : itemSet,
                                  ),
                                }
                              : item,
                          ),
                        )
                      }
                    />
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() =>
                        setEntries((current) =>
                          current.map((item, index) =>
                            index === entryIndex
                              ? { ...item, sets: item.sets.filter((_, indexSet) => indexSet !== setIndex) }
                              : item,
                          ),
                        )
                      }
                      title="Удалить подход"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="inline-actions">
                <button
                  className="secondary-button compact-button"
                  type="button"
                  onClick={() =>
                    setEntries((current) =>
                      current.map((item, index) =>
                        index === entryIndex
                          ? {
                              ...item,
                              sets: [
                                ...item.sets,
                                {
                                  id: createId(),
                                  weight: item.sets[item.sets.length - 1]?.weight ?? 0,
                                  reps: item.sets[item.sets.length - 1]?.reps ?? 10,
                                },
                              ],
                            }
                          : item,
                      ),
                    )
                  }
                >
                  <Plus size={17} />
                  Подход
                </button>
              </div>

              <label className="field">
                <span>Комментарий</span>
                <input
                  value={entry.comment ?? ''}
                  onChange={(event) =>
                    setEntries((current) =>
                      current.map((item, index) =>
                        index === entryIndex ? { ...item, comment: event.target.value } : item,
                      ),
                    )
                  }
                  placeholder={`Заметка: ${getExerciseName(exercises, entry.exerciseId)}`}
                />
              </label>
            </article>
          ))
        ) : (
          <div className="panel empty-state">Выберите программу или добавьте упражнение вручную.</div>
        )}
      </div>

      <div className="sticky-workout-actions">
        <button className="secondary-button" type="button" onClick={addExerciseEntry} disabled={!activeExercises.length}>
          <Plus size={18} />
          Упражнение
        </button>
        <button className="primary-button" type="button" onClick={saveWorkout} disabled={!entries.length}>
          <Save size={18} />
          Сохранить
        </button>
      </div>

      <label className="panel field comment-panel">
        <span>Комментарий к тренировке</span>
        <textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={3} />
      </label>
    </section>
  );
}
