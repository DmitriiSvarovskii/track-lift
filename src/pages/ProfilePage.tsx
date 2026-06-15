import { LogOut, UserRound } from 'lucide-react';
import { useTrainingStore } from '../store/trainingStore';
import { formatDateTime } from '../utils/format';

export function ProfilePage() {
  const user = useTrainingStore((state) => state.getCurrentUser());
  const authSession = useTrainingStore((state) => state.authSession);
  const logout = useTrainingStore((state) => state.logout);

  if (!user) {
    return null;
  }

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Аккаунт</p>
          <h1>Профиль</h1>
        </div>
      </header>

      <article className="panel profile-panel">
        <div className="profile-avatar">
          {user.avatarUrl ? <img src={user.avatarUrl} alt={user.displayName} /> : <UserRound size={42} />}
        </div>
        <div className="profile-info">
          <h2>{user.displayName}</h2>
          {user.username && <p>@{user.username}</p>}
          <dl>
            <div>
              <dt>Telegram ID</dt>
              <dd>{user.telegramId}</dd>
            </div>
            <div>
              <dt>Последняя активность</dt>
              <dd>{authSession ? formatDateTime(authSession.lastActivityAt) : '-'}</dd>
            </div>
            <div>
              <dt>Сессия до</dt>
              <dd>{authSession ? formatDateTime(authSession.expiresAt) : '-'}</dd>
            </div>
          </dl>
        </div>
        <button className="ghost-button danger profile-logout" type="button" onClick={logout}>
          <LogOut size={18} />
          Выйти
        </button>
      </article>
    </section>
  );
}
