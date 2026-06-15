import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthGate } from './components/AuthGate';
import { Shell } from './components/Shell';
import { DashboardPage } from './pages/DashboardPage';
import { ExercisesPage } from './pages/ExercisesPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProgramsPage } from './pages/ProgramsPage';
import { WorkoutPage } from './pages/WorkoutPage';

export default function App() {
  return (
    <AuthGate>
      <Shell>
        <Routes>
          <Route path="/" element={<WorkoutPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Shell>
    </AuthGate>
  );
}
