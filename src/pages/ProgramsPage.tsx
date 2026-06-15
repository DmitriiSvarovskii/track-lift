import { Check, ChevronsDown, ChevronsUp, Pencil, Plus, Trash2, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useTrainingStore } from '../store/trainingStore';
import type { WorkoutProgram } from '../types/domain';
import { getExerciseName } from '../utils/metrics';
import { formatPlannedReps, parsePlannedReps } from '../utils/program';

type ProgramRow = {
  exerciseId: string;
  plannedSets: string;
  plannedReps: string;
  comment: string;
};

const blankProgram = {
  name: '',
  description: '',
};

export function ProgramsPage() {
  const { exercises, programs, addProgram, updateProgram, deleteProgram } = useTrainingStore();
  const activeExercises = exercises.filter((exercise) => exercise.isActive);
  const [form, setForm] = useState(blankProgram);
  const [rows, setRows] = useState<ProgramRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addRow = () => {
    if (!activeExercises[0]) {
      return;
    }

    setRows((current) => [
      ...current,
      {
        exerciseId: activeExercises[0].id,
        plannedSets: '3',
        plannedReps: '10',
        comment: '',
      },
    ]);
  };

  const resetForm = () => {
    setForm(blankProgram);
    setRows([]);
    setEditingId(null);
  };

  const editProgram = (program: WorkoutProgram) => {
    setEditingId(program.id);
    setForm({ name: program.name, description: program.description ?? '' });
    setRows(
      [...program.exercises]
        .sort((a, b) => a.order - b.order)
        .map((exercise) => ({
          exerciseId: exercise.exerciseId,
          plannedSets: exercise.plannedSets?.toString() ?? '',
          plannedReps: formatPlannedReps(exercise),
          comment: exercise.comment ?? '',
        })),
    );
  };

  const moveRow = (index: number, direction: -1 | 1) => {
    setRows((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) {
        return current;
      }
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!form.name.trim() || !rows.length) {
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      exercises: rows.map((row, index) => ({
        exerciseId: row.exerciseId,
        order: index + 1,
        plannedSets: Number(row.plannedSets) || undefined,
        ...parsePlannedReps(row.plannedReps),
        comment: row.comment.trim(),
      })),
    };

    if (editingId) {
      updateProgram(editingId, payload);
    } else {
      addProgram(payload);
    }

    resetForm();
  };

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Шаблоны</p>
          <h1>Программы</h1>
        </div>
      </header>

      <div className="work-grid wide-form">
        <form className="panel form-panel" onSubmit={onSubmit}>
          <div className="panel-heading">
            <h2>{editingId ? 'Редактирование' : 'Новая программа'}</h2>
            {editingId && (
              <button className="icon-button" type="button" onClick={resetForm} title="Отменить">
                <X size={18} />
              </button>
            )}
          </div>

          <label className="field">
            <span>Название</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="День 1 — Грудь / трицепс"
              required
            />
          </label>

          <label className="field">
            <span>Описание</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              rows={3}
              placeholder="Заметки по тренировочному дню"
            />
          </label>

          <div className="subsection-title">
            <span>Упражнения</span>
            <button className="secondary-button compact-button" type="button" onClick={addRow} disabled={!activeExercises.length}>
              <Plus size={17} />
              Добавить
            </button>
          </div>

          <div className="program-builder">
            {rows.length ? (
              rows.map((row, index) => (
                <div className="builder-row" key={`${row.exerciseId}-${index}`}>
                  <div className="order-controls">
                    <button className="icon-button" type="button" onClick={() => moveRow(index, -1)} title="Выше">
                      <ChevronsUp size={17} />
                    </button>
                    <button className="icon-button" type="button" onClick={() => moveRow(index, 1)} title="Ниже">
                      <ChevronsDown size={17} />
                    </button>
                  </div>
                  <label className="field">
                    <span>Упражнение</span>
                    <select
                      value={row.exerciseId}
                      onChange={(event) =>
                        setRows((current) =>
                          current.map((item, rowIndex) =>
                            rowIndex === index ? { ...item, exerciseId: event.target.value } : item,
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
                  <label className="field small-field">
                    <span>Подходы</span>
                    <input
                      type="number"
                      min="0"
                      value={row.plannedSets}
                      onChange={(event) =>
                        setRows((current) =>
                          current.map((item, rowIndex) =>
                            rowIndex === index ? { ...item, plannedSets: event.target.value } : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="field small-field">
                    <span>Повторы</span>
                    <input
                      type="text"
                      value={row.plannedReps}
                      onChange={(event) =>
                        setRows((current) =>
                          current.map((item, rowIndex) =>
                            rowIndex === index ? { ...item, plannedReps: event.target.value } : item,
                          ),
                        )
                      }
                      placeholder="12 или MAX"
                    />
                  </label>
                  <label className="field">
                    <span>Комментарий</span>
                    <input
                      value={row.comment}
                      onChange={(event) =>
                        setRows((current) =>
                          current.map((item, rowIndex) =>
                            rowIndex === index ? { ...item, comment: event.target.value } : item,
                          ),
                        )
                      }
                      placeholder="Темп, паузы, RPE"
                    />
                  </label>
                  <button
                    className="icon-button danger"
                    type="button"
                    onClick={() => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index))}
                    title="Удалить"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state bordered">Добавьте упражнения из справочника.</div>
            )}
          </div>

          <button className="primary-button" type="submit" disabled={!rows.length}>
            {editingId ? <Check size={19} /> : <Plus size={19} />}
            {editingId ? 'Сохранить программу' : 'Создать программу'}
          </button>
        </form>

        <div className="entity-list">
          {programs.length ? (
            programs.map((program) => (
              <article className="entity-card" key={program.id}>
                <div className="entity-main">
                  <div>
                    <h2>{program.name}</h2>
                    <p>{program.description || 'Без описания'}</p>
                  </div>
                  <span className="status-pill">{program.exercises.length} упр.</span>
                </div>
                <ol className="exercise-lines">
                  {[...program.exercises]
                    .sort((a, b) => a.order - b.order)
                    .map((entry) => (
                      <li key={entry.id}>
                        <span>{getExerciseName(exercises, entry.exerciseId)}</span>
                        <small>
                          {entry.plannedSets || '-'} x {formatPlannedReps(entry)}
                        </small>
                      </li>
                    ))}
                </ol>
                <div className="card-actions">
                  <button className="secondary-button" type="button" onClick={() => editProgram(program)}>
                    <Pencil size={17} />
                    Изменить
                  </button>
                  <button
                    className="ghost-button danger"
                    type="button"
                    onClick={() => {
                      if (window.confirm('Удалить программу?')) {
                        deleteProgram(program.id);
                      }
                    }}
                  >
                    <Trash2 size={17} />
                    Удалить
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="panel empty-state">Создайте первую программу тренировочного дня.</div>
          )}
        </div>
      </div>
    </section>
  );
}
