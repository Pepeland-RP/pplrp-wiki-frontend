'use client';

import { useEffect, useRef, useState } from 'react';
import Select from 'react-select';
import useSWR from 'swr';
import styles from '@/styles/Models/Selectors.module.css';
import { getFilters } from '@/lib/api';

type PropsData = {
  seasons: number[];
  categories: number[];
  take: number;
};

type SelectType = { value: number; label: string }[];

const take_params = Array.from({ length: 8 }).map((_, i) => ({
  value: (i + 1) * 12,
  label: `Показать ${(i + 1) * 12}`,
}));

interface SelectorsProps {
  onChange: (data: PropsData) => void;
  total_count: number;
}

const Selectors = ({ onChange, total_count }: SelectorsProps) => {
  const { data, isLoading } = useSWR('filters', async () => getFilters());
  const [seasons, setSeasons] = useState<SelectType>([]);
  const [categories, setCategories] = useState<SelectType>([]);

  const propsData = useRef<PropsData>({
    categories: [],
    seasons: [],
    take: 24,
  });

  useEffect(() => {
    if (!data) return;
    setSeasons(
      data.seasons.map(season => ({ value: season.id, label: season.name })),
    );
    setCategories(
      data.categories.map(category => ({
        value: category.id,
        label: category.name,
      })),
    );
  }, [data]);

  return (
    <div className={styles.container}>
      <Select
        options={seasons}
        className={`react-select-container ${styles.select}`}
        classNamePrefix="react-select"
        isSearchable
        instanceId="select-1"
        isLoading={isLoading}
        placeholder="Сезоны"
        onChange={e => {
          propsData.current = {
            ...propsData.current,
            seasons: e.map(i => i.value),
          };
          onChange(propsData.current);
        }}
        isMulti
        isClearable
      />
      <Select
        options={categories}
        className={`react-select-container ${styles.select}`}
        classNamePrefix="react-select"
        isSearchable
        instanceId="select-2"
        isLoading={isLoading}
        placeholder="Категории"
        onChange={e => {
          propsData.current = {
            ...propsData.current,
            categories: e.map(i => i.value),
          };
          onChange(propsData.current);
        }}
        isClearable
        isMulti
      />
      <Select
        options={[
          ...take_params,
          { value: total_count, label: 'Показать все' },
        ]}
        defaultValue={take_params[1]}
        className={`react-select-container ${styles.select}`}
        classNamePrefix="react-select"
        isSearchable={false}
        instanceId="select-3"
        onChange={e => {
          propsData.current = {
            ...propsData.current,
            take: e!.value,
          };
          onChange(propsData.current);
        }}
      />
    </div>
  );
};

export default Selectors;
