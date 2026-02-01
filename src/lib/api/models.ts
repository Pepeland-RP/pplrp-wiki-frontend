import axios from 'axios';
import { getApiUrl } from './api';

export const getFilters = async (): Promise<APIFiltersType> => {
  const response = await axios.get(`${getApiUrl()}/models/filters`);
  return response.data;
};

export const getModelById = async (
  id: string,
): Promise<ModelResponse['data'][0]> => {
  const response = await axios.get(`${getApiUrl()}/models/${id}`);
  return response.data;
};

export const createModel = async (
  gltf: File,
  name: string,
  season: string,
  minecraftItem: number[],
  category: string[],
  modelMeta?: string,
) => {
  const formData = new FormData();

  formData.append('file', gltf);
  formData.append('name', name);
  formData.append('season', season);
  formData.append('minecraftItem', JSON.stringify(minecraftItem));
  formData.append('category', JSON.stringify(category));
  if (modelMeta) formData.append('gltfMeta', modelMeta);

  return await axios.request({
    url: `${getApiUrl()}/admin/models`,
    method: 'POST',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const editModel = async (
  id: number,
  gltf: File,
  name: string,
  season: string,
  minecraftItem: number[],
  category: string[],
  modelMeta?: string,
) => {
  const formData = new FormData();

  formData.append('file', gltf);
  formData.append('name', name);
  formData.append('season', season);
  formData.append('minecraftItem', JSON.stringify(minecraftItem));
  formData.append('category', JSON.stringify(category));
  if (modelMeta) formData.append('gltfMeta', modelMeta);

  return await axios.request({
    url: `${getApiUrl()}/admin/models/${id}`,
    method: 'PUT',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteModel = async (id: string) => {
  await axios.delete(`${getApiUrl()}/admin/models/${id}`);
};
