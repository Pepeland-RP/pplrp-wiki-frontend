import axios from 'axios';
import { deleteCookie } from 'cookies-next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function getAssetUrl(resourceId: string): string {
  return `${API_URL}/assets/${resourceId}`;
}

export function getApiUrl(): string {
  return API_URL;
}

export async function checkMe(): Promise<AdminUserType | null> {
  const response = await axios.get(`${getApiUrl()}/auth/me`, {
    validateStatus: () => true,
  });
  if (response.status !== 200) {
    deleteCookie('sessionId');
    return null;
  }
  return response.data;
}

export async function login(login: string, password: string) {
  const response = await axios.post(
    `${getApiUrl()}/auth`,
    { login, password },
    {
      validateStatus: () => true,
    },
  );

  if (response.status !== 201)
    return { success: false, message: response.data.message };
  return { success: true, message: '' };
}
