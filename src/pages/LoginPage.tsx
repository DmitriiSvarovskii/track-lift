import { LogIn } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTrainingStore } from '../store/trainingStore';

const TELEGRAM_SCRIPT_ID = 'telegram-login-sdk';

const loadTelegramSdk = () =>
  new Promise<void>((resolve, reject) => {
    if (window.Telegram?.Login) {
      resolve();
      return;
    }

    const existing = document.getElementById(TELEGRAM_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Telegram SDK failed to load')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = TELEGRAM_SCRIPT_ID;
    script.src = 'https://telegram.org/js/telegram-login.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Telegram SDK failed to load'));
    document.head.appendChild(script);
  });

export function LoginPage() {
  const loginWithTelegram = useTrainingStore((state) => state.loginWithTelegram);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const clientId = useMemo(() => Number(import.meta.env.VITE_TELEGRAM_CLIENT_ID), []);
  const hasClientId = Number.isFinite(clientId) && clientId > 0;

  useEffect(() => {
    if (!hasClientId) {
      return;
    }

    loadTelegramSdk().catch(() => setError('Не удалось загрузить Telegram Login SDK.'));
  }, [hasClientId]);

  const signIn = async () => {
    setError('');

    if (!hasClientId) {
      setError('Укажите VITE_TELEGRAM_CLIENT_ID в .env.local после настройки бота в BotFather.');
      return;
    }

    setIsLoading(true);

    try {
      await loadTelegramSdk();
      window.Telegram?.Login?.auth({ client_id: clientId, request_access: ['write'], lang: 'ru' }, (payload) => {
        setIsLoading(false);

        if (payload.error || !payload.user) {
          setError(payload.error || 'Telegram не вернул данные пользователя.');
          return;
        }

        loginWithTelegram({
          idToken: payload.id_token,
          user: payload.user,
        });
      });
    } catch {
      setIsLoading(false);
      setError('Не удалось открыть Telegram авторизацию.');
    }
  };

  const demoSignIn = () => {
    loginWithTelegram({
      user: {
        id: 'demo-telegram-user',
        name: 'Demo Athlete',
        username: 'demo_athlete',
        picture: '',
      },
    });
  };

  return (
    <main className="login-screen">
      <section className="login-panel">
        <div className="brand login-brand">
          <span className="brand-mark">TL</span>
          <div>
            <strong>Track Lift</strong>
            <span>учет тренировок</span>
          </div>
        </div>

        <div className="login-copy">
          <p className="eyebrow">Вход</p>
          <h1>Авторизация через Telegram</h1>
          <p>
            Данные упражнений, программ и тренировок будут храниться отдельно для каждого Telegram-профиля.
          </p>
        </div>

        <button className="primary-button login-button" type="button" onClick={signIn} disabled={isLoading}>
          <LogIn size={19} />
          {isLoading ? 'Открываем Telegram' : 'Войти через Telegram'}
        </button>

        {!hasClientId && (
          <button className="secondary-button login-button" type="button" onClick={demoSignIn}>
            Демо-вход
          </button>
        )}

        {error && <p className="form-error">{error}</p>}

        <p className="login-note">
          Для production понадобится backend-проверка ID token: подпись Telegram, `iss`, `aud` и срок действия.
        </p>
      </section>
    </main>
  );
}
