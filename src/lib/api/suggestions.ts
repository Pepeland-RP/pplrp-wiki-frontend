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
