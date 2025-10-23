const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function getAssetUrl(resourceId: string): string {
  return `${API_URL}/assets/${resourceId}`;
}

export function getApiUrl(): string {
  return API_URL;
}
