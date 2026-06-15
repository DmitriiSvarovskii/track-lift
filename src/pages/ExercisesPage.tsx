import { Check, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { useTrainingStore } from '../store/trainingStore';
import type { Exercise, ExerciseType } from '../types/domain';

const exerciseTypeLabels: Record<ExerciseType, string> = {
  strength: 'Силовое',
  cardio: 'Кардио',
  stretching: 'Растяжка',
  other: 'Другое',
};

const blankForm = {
  name: '',
  muscleGroup: '',
  type: 'strength' as ExerciseType,
  description: '',
  isActive: true,
};

export function ExercisesPage() {
  const { exercises, addExercise, updateExercise, deleteExercise } = useTrainingStore();
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('all');

  const groups = useMemo(
    () => [...new Set(exercises.map((exercise) => exercise.muscleGroup).filter(Boolean))].sort(),
    [exercises],
  );

  const filteredExercises = exercises.filter((exercise) => {
    const matchesQuery = `${exercise.name} ${exercise.muscleGroup}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    const matchesGroup = muscleGroup === 'all' || exercise.muscleGroup === muscleGroup;
    return matchesQuery && matchesGroup;
  });

  const resetForm = () => {
    setForm(blankForm);
    setEditingId(null);
  };

  const editExercise = (exercise: Exercise) => {
    setEditingId(exercise.id);
    setForm({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      type: exercise.type,
      description: exercise.description ?? '',
      isActive: exercise.isActive,
    });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const payload = {
      ...form,
      name: form.name.trim(),
      muscleGroup: form.muscleGroup.trim(),
      description: form.description.trim(),
    };

    if (!payload.name || !payload.muscleGroup) {
      return;
    }

    if (editingId) {
      updateExercise(editingId, payload);
    } else {
      addExercise(payload);
    }

    resetForm();
  };

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Справочник</p>
          <h1>Упражнения</h1>
        </div>
      </header>

      <div className="toolbar">
        <label className="search-field">
          <Search size={18} aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск" />
        </label>
        <select className="select" value={muscleGroup} onChange={(event) => setMuscleGroup(event.target.value)}>
          <option value="all">Все группы</option>
          {groups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
      </div>

      <div className="work-grid">
        <form className="panel form-panel" onSubmit={onSubmit}>
          <div className="panel-heading">
            <h2>{editingId ? 'Редактирование' : 'Новое упражнение'}</h2>
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
              placeholder="Жим лежа"
              required
            />
          </label>

          <label className="field">
            <span>Группа мышц</span>
            <input
              value={form.muscleGroup}
              onChange={(event) => setForm((current) => ({ ...current, muscleGroup: event.target.value }))}
              placeholder="Грудь"
              required
            />
          </label>

          <label className="field">
            <span>Тип</span>
            <select
              value={form.type}
              onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as ExerciseType }))}
            >
              {Object.entries(exerciseTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Описание или техника</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              rows={4}
              placeholder="Краткая техника выполнения"
            />
          </label>

          <label className="check-row">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
            />
            <span>Активно</span>
          </label>

          <button className="primary-button" type="submit">
            {editingId ? <Check size={19} /> : <Plus size={19} />}
            {editingId ? 'Сохранить' : 'Добавить'}
          </button>
        </form>

        <div className="entity-list">
          {filteredExercises.length ? (
            filteredExercises.map((exercise) => (
              <article className="entity-card" key={exercise.id}>
                <div className="entity-main">
                  <div>
                    <h2>{exercise.name}</h2>
                    <p>
                      {exercise.muscleGroup} · {exerciseTypeLabels[exercise.type]}
                    </p>
                  </div>
                  <span className={exercise.isActive ? 'status-pill' : 'status-pill muted'}>
                    {exercise.isActive ? 'Активно' : 'Скрыто'}
                  </span>
                </div>
                {exercise.description && <p className="description">{exercise.description}</p>}
                <div className="card-actions">
                  <button className="secondary-button" type="button" onClick={() => editExercise(exercise)}>
                    <Pencil size={17} />
                    Изменить
                  </button>
                  <button
                    className="ghost-button danger"
                    type="button"
                    onClick={() => {
                      if (window.confirm('Удалить упражнение?')) {
                        deleteExercise(exercise.id);
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
            <div className="panel empty-state">Упражнения не найдены.</div>
          )}
        </div>
      </div>
    </section>
  );
}
