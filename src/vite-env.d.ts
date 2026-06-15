/// <reference types="vite/client" />

type TelegramLoginCallback = (payload: {
  id_token?: string;
  user?: {
    id?: number | string;
    sub?: number | string;
    name?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    preferred_username?: string;
    photo_url?: string;
    picture?: string;
  };
  error?: string;
}) => void;

interface Window {
  Telegram?: {
    Login?: {
      auth: (options: { client_id: number; request_access?: string[]; lang?: string; nonce?: string; redirect_uri?: string }, callback: TelegramLoginCallback) => void;
      init: (options: { client_id: number; request_access?: string[]; lang?: string; nonce?: string; redirect_uri?: string }, callback: TelegramLoginCallback) => void;
      open: (callback?: TelegramLoginCallback) => void;
    };
  };
}
