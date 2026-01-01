import { create } from 'zustand';

interface FilterState {
  page: number;
  take: number;
  search: string;
  seasons: number[];
  categories: number[];
  totalCount: number;

  setPage: (page: number) => void;
  setTake: (take: number) => void;
  setSearch: (search: string) => void;
  setCategories: (categories: number[]) => void;
  setSeasons: (seasons: number[]) => void;
  setTotalCount: (totalCount: number) => void;
}

export const useModelsStore = create<FilterState>(set => ({
  page: 0,
  take: 12,
  search: '',
  seasons: [],
  categories: [],
  totalCount: 0,

  setPage: page => set({ page }),
  setTake: take => set({ take }),
  setSearch: search => set({ search }),
  setCategories: categories => set({ categories }),
  setSeasons: seasons => set({ seasons }),
  setTotalCount: totalCount => set({ totalCount }),
}));
