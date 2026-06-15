import { PropsWithChildren, useEffect } from 'react';
import { LoginPage } from '../pages/LoginPage';
import { useTrainingStore } from '../store/trainingStore';

const activityEvents = ['pointerdown', 'keydown', 'touchstart', 'scroll'] as const;

export function AuthGate({ children }: PropsWithChildren) {
  const authSession = useTrainingStore((state) => state.authSession);
  const currentUserId = useTrainingStore((state) => state.currentUserId);
  const validateSession = useTrainingStore((state) => state.validateSession);
  const touchSession = useTrainingStore((state) => state.touchSession);

  useEffect(() => {
    validateSession();

    const intervalId = window.setInterval(validateSession, 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, [validateSession]);

  useEffect(() => {
    if (!authSession) {
      return undefined;
    }

    const onActivity = () => touchSession();
    activityEvents.forEach((eventName) => window.addEventListener(eventName, onActivity, { passive: true }));
    document.addEventListener('visibilitychange', onActivity);

    return () => {
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, onActivity));
      document.removeEventListener('visibilitychange', onActivity);
    };
  }, [authSession, touchSession]);

  if (!authSession || !currentUserId) {
    return <LoginPage />;
  }

  return children;
}
