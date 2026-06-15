import { BarChart3, ClipboardList, Dumbbell, History, ListChecks, UserRound } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { NavLink } from 'react-router-dom';
import { useTrainingStore } from '../store/trainingStore';

const navItems = [
  { to: '/', label: 'Тренировка', icon: ClipboardList },
  { to: '/dashboard', label: 'Дашборд', icon: BarChart3 },
  { to: '/exercises', label: 'Упражнения', icon: Dumbbell },
  { to: '/programs', label: 'Программы', icon: ListChecks },
  { to: '/history', label: 'История', icon: History },
  { to: '/profile', label: 'Профиль', icon: UserRound },
];

export function Shell({ children }: PropsWithChildren) {
  const user = useTrainingStore((state) => state.getCurrentUser());

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">TL</span>
          <div>
            <strong>Track Lift</strong>
            <span>журнал прогресса</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Основная навигация">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className="nav-link">
              <Icon size={20} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {user && (
          <NavLink to="/profile" className="sidebar-profile">
            <span className="mini-avatar">
              {user.avatarUrl ? <img src={user.avatarUrl} alt={user.displayName} /> : user.displayName.slice(0, 1)}
            </span>
            <span>
              <strong>{user.displayName}</strong>
              {user.username && <small>@{user.username}</small>}
            </span>
          </NavLink>
        )}
      </aside>

      <main className="content">{children}</main>

      <nav className="mobile-nav" aria-label="Мобильная навигация">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className="mobile-nav-link">
            <Icon size={21} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
