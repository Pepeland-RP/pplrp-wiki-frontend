import axios from 'axios';
import { base64ToFile, getApiUrl } from './api';

export const createSuggestion = async (
  nickname: string,
  content: string,
  images: string[],
  links: string[],
) => {
  const formData = new FormData();

  formData.append('nickname', nickname);
  formData.append('content', content);
  for (const image of images) {
    formData.append('file', base64ToFile(image));
  }
  formData.append('links', JSON.stringify(links));

  return await axios.request({
    url: `${getApiUrl()}/suggestions`,
    method: 'POST',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export interface SuggestionType {
  id: number;
  nickname: string;
  content: string;
  created_at: string;
  images: {
    id: number;
    resource_id: string;
  }[];
  links: string[];
}

export const getAllSuggestions = async (): Promise<SuggestionType[]> => {
  return (await axios.get(`${getApiUrl()}/suggestions`)).data;
};

export const deleteSuggestion = async (id: number) => {
  await axios.delete(`${getApiUrl()}/suggestions/${id}`);
};
