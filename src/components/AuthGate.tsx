import { PropsWithChildren, useEffect } from 'react';
import { LoginPage } from '../pages/LoginPage';
import { useTrainingStore } from '../store/trainingStore';

const activityEvents = ['pointerdown', 'keydown', 'touchstart', 'scroll'] as const;

export function AuthGate({ children }: PropsWithChildren) {
  const authSession = useTrainingStore((state) => state.authSession);
  const authStatus = useTrainingStore((state) => state.authStatus);
  const initializeAuth = useTrainingStore((state) => state.initializeAuth);
  const touchSession = useTrainingStore((state) => state.touchSession);

  useEffect(() => {
    void initializeAuth();

    const intervalId = window.setInterval(() => {
      void touchSession();
    }, 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, [initializeAuth, touchSession]);

  useEffect(() => {
    if (!authSession) {
      return undefined;
    }

    const onActivity = () => {
      void touchSession();
    };
    activityEvents.forEach((eventName) => window.addEventListener(eventName, onActivity, { passive: true }));
    document.addEventListener('visibilitychange', onActivity);

    return () => {
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, onActivity));
      document.removeEventListener('visibilitychange', onActivity);
    };
  }, [authSession, touchSession]);

  if (authStatus === 'checking') {
    return (
      <main className="login-screen">
        <section className="login-panel">
          <div className="empty-state">Проверяем сессию...</div>
        </section>
      </main>
    );
  }

  if (authStatus !== 'authenticated' || !authSession) {
    return <LoginPage />;
  }

  return children;
}
