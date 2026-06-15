import { LogIn } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { useTrainingStore } from '../store/trainingStore';

const TELEGRAM_SCRIPT_ID = 'telegram-login-sdk';
const TELEGRAM_SCRIPT_URL = import.meta.env.VITE_TELEGRAM_LOGIN_SCRIPT_URL || 'https://telegram.org/js/telegram-login.js';

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
    script.src = TELEGRAM_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Telegram SDK failed to load'));
    document.head.appendChild(script);
  });

export function LoginPage() {
  const loginWithTelegram = useTrainingStore((state) => state.loginWithTelegram);
  const [isLoading, setIsLoading] = useState(false);
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [nonce, setNonce] = useState('');
  const [error, setError] = useState('');
  const clientId = useMemo(() => Number(import.meta.env.VITE_TELEGRAM_CLIENT_ID), []);
  const hasClientId = Number.isFinite(clientId) && clientId > 0;

  useEffect(() => {
    if (!hasClientId) {
      return;
    }

    let isMounted = true;

    Promise.all([loadTelegramSdk(), api.getTelegramNonce()])
      .then(([, nonceResponse]) => {
        if (!isMounted) {
          return;
        }
        setNonce(nonceResponse.nonce);
        setIsSdkReady(true);
      })
      .catch(() => {
        if (isMounted) {
          setError('Не удалось подготовить Telegram авторизацию.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [hasClientId]);

  const signIn = () => {
    setError('');

    if (!hasClientId) {
      setError('Укажите VITE_TELEGRAM_CLIENT_ID в .env.local после настройки бота в BotFather.');
      return;
    }

    if (!isSdkReady || !nonce || !window.Telegram?.Login) {
      setError('Telegram авторизация еще загружается. Попробуйте еще раз через пару секунд.');
      return;
    }

    setIsLoading(true);
    window.Telegram.Login.auth(
      {
        client_id: clientId,
        request_access: ['write'],
        lang: 'ru',
        nonce,
        redirect_uri: `${window.location.origin}/auth`,
      },
      async (payload) => {
        setIsLoading(true);

        if (payload.error || !payload.user) {
          setIsLoading(false);
          setError(payload.error === 'popup_closed' ? 'Окно Telegram было закрыто до завершения входа.' : payload.error || 'Telegram не вернул данные пользователя.');
          return;
        }

        if (!payload.id_token) {
          setIsLoading(false);
          setError('Telegram не вернул id_token.');
          return;
        }

        try {
          await loginWithTelegram({
            idToken: payload.id_token,
            user: payload.user,
          });
        } catch {
          setError('Backend не принял Telegram авторизацию.');
        } finally {
          setIsLoading(false);
        }
      },
    );
  };

  const demoSignIn = async () => {
    setError('');
    setIsLoading(true);

    try {
      await loginWithTelegram({
        user: {
          id: 'demo-telegram-user',
          name: 'Demo Athlete',
          username: 'demo_athlete',
          picture: '',
        },
      });
    } catch {
      setError('Демо-вход выключен на backend.');
    } finally {
      setIsLoading(false);
    }
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
          <h1>Вход через Telegram</h1>
        </div>

        <button className="primary-button login-button" type="button" onClick={signIn} disabled={isLoading || (hasClientId && !isSdkReady)}>
          <LogIn size={19} />
          {isLoading ? 'Открываем Telegram' : isSdkReady || !hasClientId ? 'Войти через Telegram' : 'Готовим Telegram'}
        </button>

        {!hasClientId && (
          <button className="secondary-button login-button" type="button" onClick={demoSignIn}>
            Демо-вход
          </button>
        )}

        {error && <p className="form-error">{error}</p>}

      </section>
    </main>
  );
}
