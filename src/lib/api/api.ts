const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function getAssetUrl(resourceId: string): string {
  return `${API_URL}/assets/${resourceId}`;
}

export function getApiUrl(): string {
  return API_URL;
}

export const base64ToFile = (b64: string) => {
  const [, data] = b64.split(',');
  const bytes = atob(data);
  const arr = new Uint8Array(bytes.length);

  for (let i = 0; i < bytes.length; i++) {
    arr[i] = bytes.charCodeAt(i);
  }

  return new File([arr], 'image.png', { type: 'image/png' });
};
