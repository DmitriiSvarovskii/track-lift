import { Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTrainingStore } from '../store/trainingStore';
import { formatDateTime, toDateInputValue } from '../utils/format';
import { getExerciseName, getProgramName, getSessionVolume } from '../utils/metrics';

export function HistoryPage() {
  const { exercises, programs, sessions, deleteSession } = useTrainingStore();
  const [dateFilter, setDateFilter] = useState('');
  const [exerciseFilter, setExerciseFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');

  const usedExerciseIds = useMemo(
    () => [...new Set(sessions.flatMap((session) => session.exercises.map((exercise) => exercise.exerciseId)))],
    [sessions],
  );

  const filteredSessions = sessions.filter((session) => {
    const matchesDate = !dateFilter || toDateInputValue(session.date) === dateFilter;
    const matchesExercise =
      exerciseFilter === 'all' || session.exercises.some((exercise) => exercise.exerciseId === exerciseFilter);
    const matchesProgram =
      programFilter === 'all' ||
      (programFilter === 'manual' && !session.programId) ||
      session.programId === programFilter;
    return matchesDate && matchesExercise && matchesProgram;
  });

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Архив</p>
          <h1>История</h1>
        </div>
      </header>

      <div className="toolbar filters-grid">
        <label className="field inline-field">
          <span>Дата</span>
          <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
        </label>
        <label className="field inline-field">
          <span>Упражнение</span>
          <select value={exerciseFilter} onChange={(event) => setExerciseFilter(event.target.value)}>
            <option value="all">Все упражнения</option>
            {usedExerciseIds.map((id) => (
              <option key={id} value={id}>
                {getExerciseName(exercises, id)}
              </option>
            ))}
          </select>
        </label>
        <label className="field inline-field">
          <span>Программа</span>
          <select value={programFilter} onChange={(event) => setProgramFilter(event.target.value)}>
            <option value="all">Все программы</option>
            <option value="manual">Без программы</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="history-list">
        {filteredSessions.length ? (
          filteredSessions.map((session) => (
            <article className="entity-card history-card" key={session.id}>
              <div className="entity-main">
                <div>
                  <h2>{session.title}</h2>
                  <p>
                    {formatDateTime(session.date)} · {getProgramName(programs, session.programId)}
                  </p>
                </div>
                <span className="status-pill">{Math.round(getSessionVolume(session)).toLocaleString('ru-RU')} кг</span>
              </div>

              <div className="history-exercises">
                {session.exercises.map((entry) => (
                  <div className="history-exercise" key={entry.id}>
                    <div>
                      <strong>{getExerciseName(exercises, entry.exerciseId)}</strong>
                      {entry.comment && <span>{entry.comment}</span>}
                    </div>
                    <div className="set-chips">
                      {entry.sets.map((set, index) => (
                        <span key={set.id}>
                          {index + 1}: {set.weight} кг x {set.reps}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {session.comment && <p className="description">{session.comment}</p>}

              <div className="card-actions">
                <button
                  className="ghost-button danger"
                  type="button"
                  onClick={() => {
                    if (window.confirm('Удалить тренировку из истории?')) {
                      deleteSession(session.id);
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
          <div className="panel empty-state">
            <Search size={22} />
            Тренировки не найдены.
          </div>
        )}
      </div>
    </section>
  );
}
