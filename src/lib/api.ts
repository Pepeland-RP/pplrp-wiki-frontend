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
    if (response.status === 401) deleteCookie('sessionId');
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

export const getMinecraftItems = async (): Promise<MinecraftItem[]> => {
  return (await axios.get(`${getApiUrl()}/admin/items`)).data;
};

const base64ToFile = (b64: string) => {
  const [, data] = b64.split(',');
  const bytes = atob(data);
  const arr = new Uint8Array(bytes.length);

  for (let i = 0; i < bytes.length; i++) {
    arr[i] = bytes.charCodeAt(i);
  }

  return new File([arr], 'image.png', { type: 'image/png' });
};

export const updateMinecraftItem = async (
  create: boolean,
  data: { name: string; str_id: string },
  asset_base64: string,
  id?: number,
) => {
  if (!create && !id) throw new Error('No id provided');
  const formData = new FormData();

  formData.append('file', base64ToFile(asset_base64));
  formData.append('name', data.name);
  formData.append('str_id', data.str_id);

  const url = create
    ? `${getApiUrl()}/admin/items`
    : `${getApiUrl()}/admin/items/${id}`;

  return await axios.request({
    url,
    method: create ? 'POST' : 'PUT',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
    validateStatus: () => true,
  });
};

export const deleteMinecraftItem = async (id: number) => {
  return await axios.delete(`${getApiUrl()}/admin/items/${id}`, {
    validateStatus: () => true,
  });
};

export const getFilters = async (): Promise<APIFiltersType> => {
  const response = await axios.get(`${getApiUrl()}/models/filters`);
  return response.data;
};
