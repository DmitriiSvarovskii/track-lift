import type { AppUser, AuthSession, TelegramAuthPayload, UserTrainingData } from '../types/domain';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

type AuthResponse = {
  user: AppUser;
  session: AuthSession;
};

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API error ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  me: () => apiRequest<AuthResponse>('/api/auth/me'),
  getTelegramNonce: () =>
    apiRequest<{ nonce: string }>('/api/auth/telegram/nonce', {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  loginWithTelegram: (payload: TelegramAuthPayload) =>
    apiRequest<AuthResponse>('/api/auth/telegram', {
      method: 'POST',
      body: JSON.stringify({
        idToken: payload.idToken,
        demoUser: payload.user,
      }),
    }),
  touchSession: () =>
    apiRequest<AuthResponse>('/api/auth/touch', {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  logout: () =>
    apiRequest<{ status: string }>('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  getTraining: () => apiRequest<UserTrainingData>('/api/training'),
  saveTraining: (data: UserTrainingData) =>
    apiRequest<UserTrainingData>('/api/training', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
