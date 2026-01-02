'use client';

import ModelCard from '@/components/Models/ModelCard';
import styles from '@/styles/Models/models.module.css';
import axios from 'axios';
import useSWR from 'swr';
import { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/api';
import Search from '@/components/Models/Search';
import Selectors from '@/components/Models/Selectors';
import { useModelsStore } from '@/lib/store';

const fetcher = async (
  params: Record<string, string>,
): Promise<ModelResponse> => {
  const response = await axios.get(`${getApiUrl()}/models`, { params });
  return response.data;
};

export default function ModelsPage() {
  const {
    search,
    seasons,
    page,
    categories,
    take,
    setSearch,
    setCategories,
    setSeasons,
    setTake,
    setTotalCount,
  } = useModelsStore();

  const { data, isLoading } = useSWR(
    `models-${search}-${seasons}-${page}-${take}-${categories}-${page}`,
    async () =>
      fetcher({
        search,
        seasons: seasons.join(','),
        categories: categories.join(','),
        page: page.toString(),
        take: take.toString(),
      }),
    { keepPreviousData: true },
  );
  const [showContent, setShowContent] = useState(false);
  const [hideLoader, setHideLoader] = useState(false);

  useEffect(() => {
    if (data && !isLoading) {
      // анимация исчезновения лого после загрузки контента
      setHideLoader(true);

      // после анимации показываем контент
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 300);

      setTotalCount(data.total_count);
      return () => clearTimeout(timer);
    }
  }, [data, isLoading]);

  return (
    <div className={styles.models_page}>
      <div className={styles.models_container}>
        <div className={styles.models_header}>
          <h1 className={styles.models_title}>Модели</h1>
        </div>
        <Search onSearch={setSearch} />
        <Selectors
          total_count={data?.total_count ?? 0}
          onChange={data => {
            setCategories(data.categories);
            setSeasons(data.seasons);
            setTake(data.take);
          }}
        />
        {!showContent ? (
          <div
            className={`${styles.loading_background} ${
              hideLoader ? styles.loading_background_exit : ''
            }`}
          >
            <div className={styles.loading_viewer}>
              <img
                src="/logos/ppl-only-logo.svg"
                alt="Loading"
                className={styles.loading_logo}
              />
            </div>
          </div>
        ) : (
          <div className={`${styles.models_grid} ${styles.show}`}>
            {data!.data.map(element => (
              <ModelCard key={element.id} {...element} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
