import { Activity, Award, CalendarDays, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTrainingStore } from '../store/trainingStore';
import { formatDate, formatDateTime } from '../utils/format';
import {
  getExerciseName,
  getExerciseProgress,
  getPersonalRecords,
  getProgramName,
  getSessionVolume,
  getSessionVolumePoints,
  getWorkoutCount,
} from '../utils/metrics';

const tooltipDate = (payload?: { payload?: { date?: string } }[]) => {
  const date = payload?.[0]?.payload?.date;
  return date ? formatDate(date) : '';
};

export function DashboardPage() {
  const { exercises, programs, sessions } = useTrainingStore();
  const firstExerciseWithData = useMemo(
    () => sessions.flatMap((session) => session.exercises.map((exercise) => exercise.exerciseId))[0],
    [sessions],
  );
  const [selectedExerciseId, setSelectedExerciseId] = useState(firstExerciseWithData ?? exercises[0]?.id ?? '');

  const progress = getExerciseProgress(sessions, selectedExerciseId);
  const volumes = getSessionVolumePoints(sessions).slice(-12);
  const records = getPersonalRecords(sessions, exercises).slice(0, 5);
  const maxWeight = progress.reduce((max, point) => Math.max(max, point.maxWeight), 0);
  const totalVolume = sessions.reduce((sum, session) => sum + getSessionVolume(session), 0);
  const recentSessions = sessions.slice(0, 5);

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Главная</p>
          <h1>Дашборд прогресса</h1>
        </div>
        <select
          className="select compact-select"
          value={selectedExerciseId}
          onChange={(event) => setSelectedExerciseId(event.target.value)}
          aria-label="Упражнение для анализа"
        >
          {exercises.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.name}
            </option>
          ))}
        </select>
      </header>

      <div className="metric-grid">
        <article className="metric-card">
          <TrendingUp size={20} />
          <span>Максимум</span>
          <strong>{maxWeight ? `${maxWeight} кг` : 'Нет данных'}</strong>
        </article>
        <article className="metric-card">
          <Activity size={20} />
          <span>Объем всего</span>
          <strong>{Math.round(totalVolume).toLocaleString('ru-RU')} кг</strong>
        </article>
        <article className="metric-card">
          <CalendarDays size={20} />
          <span>За 7 дней</span>
          <strong>{getWorkoutCount(sessions, 7)}</strong>
        </article>
        <article className="metric-card">
          <CalendarDays size={20} />
          <span>За 30 дней</span>
          <strong>{getWorkoutCount(sessions, 30)}</strong>
        </article>
      </div>

      <div className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel-heading">
            <h2>Рабочий вес</h2>
            <span>{getExerciseName(exercises, selectedExerciseId)}</span>
          </div>
          {progress.length ? (
            <ResponsiveContainer width="100%" height={290}>
              <LineChart data={progress}>
                <CartesianGrid stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={36} />
                <Tooltip
                  formatter={(value) => [`${value} кг`, 'Вес']}
                  labelFormatter={(_, payload) => tooltipDate(payload)}
                />
                <Line type="monotone" dataKey="maxWeight" stroke="#111827" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">Сохраните тренировку, чтобы увидеть динамику веса.</div>
          )}
        </article>

        <article className="panel chart-panel">
          <div className="panel-heading">
            <h2>Объем тренировок</h2>
            <span>последние записи</span>
          </div>
          {volumes.length ? (
            <ResponsiveContainer width="100%" height={290}>
              <BarChart data={volumes}>
                <CartesianGrid stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={48} />
                <Tooltip
                  formatter={(value) => [`${value} кг`, 'Объем']}
                  labelFormatter={(_, payload) => tooltipDate(payload)}
                />
                <Bar dataKey="volume" fill="#374151" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">Объем появится после первой сохраненной тренировки.</div>
          )}
        </article>
      </div>

      <div className="split-grid">
        <article className="panel">
          <div className="panel-heading">
            <h2>Последние тренировки</h2>
          </div>
          <div className="stack-list">
            {recentSessions.length ? (
              recentSessions.map((session) => (
                <div className="list-row" key={session.id}>
                  <div>
                    <strong>{session.title}</strong>
                    <span>{getProgramName(programs, session.programId)}</span>
                  </div>
                  <time>{formatDateTime(session.date)}</time>
                </div>
              ))
            ) : (
              <div className="empty-state">История пока пустая.</div>
            )}
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <h2>Личные рекорды</h2>
            <Award size={20} />
          </div>
          <div className="stack-list">
            {records.length ? (
              records.map((record) => (
                <div className="list-row" key={record.exerciseId}>
                  <div>
                    <strong>{record.exerciseName}</strong>
                    <span>{formatDate(record.date)}</span>
                  </div>
                  <b>{record.weight} кг</b>
                </div>
              ))
            ) : (
              <div className="empty-state">Рекорды появятся после записей с весом.</div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
