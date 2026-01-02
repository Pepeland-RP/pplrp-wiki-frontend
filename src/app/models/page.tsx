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
import { numbersTxt } from '@/lib/textUtils';
import { Paginator, PaginatorProps } from '@/components/Models/Paginator';
import Logo from '@/resources/ppl-only-logo.svg';

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
    totalCount,
    setSearch,
    setCategories,
    setSeasons,
    setTake,
    setTotalCount,
    setPage,
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  return (
    <div className={styles.models_page}>
      <div className={styles.models_container}>
        <div className={styles.models_header}>
          <h1 className={styles.models_title}>Модели</h1>
        </div>
        <Search onSearch={setSearch} />
        <Selectors
          total_count={totalCount}
          onChange={data => {
            setCategories(data.categories);
            setSeasons(data.seasons);
            setTake(data.take);
          }}
        />
        <div className={styles.count_page_container}>
          <p className={styles.models_count}>
            {numbersTxt(totalCount, ['Найдена', 'Найдено', 'Найдено'])}{' '}
            <span>{totalCount}</span>{' '}
            {numbersTxt(totalCount, ['модель', 'модели', 'моделей'])}
          </p>
          <p className={styles.models_count}>
            Страница <span>{page + 1}</span> из{' '}
            <span>{Math.ceil(totalCount / take)}</span>
          </p>
        </div>
        <Paginator
          onChange={setPage}
          total_count={totalCount}
          take={take}
          page={page}
        />
        {!showContent ? (
          <div
            className={
              `${styles.loading_background}` +
              `${hideLoader && styles.loading_background_exit}`
            }
          >
            <div className={styles.loading_viewer}>
              <Logo className={styles.loading_logo} />
            </div>
          </div>
        ) : (
          <div className={`${styles.models_grid} ${styles.show}`}>
            {data!.data.map(element => (
              <ModelCard key={element.id} {...element} />
            ))}
          </div>
        )}
        <BottomPaginator
          elements={data?.data}
          onChange={setPage}
          total_count={totalCount}
          take={take}
          page={page}
        />
      </div>
    </div>
  );
}

const BottomPaginator = (
  props: PaginatorProps & { elements: unknown[] | null | undefined },
) => {
  if (props.elements == null) return;
  if (props.elements.length === 0) return;
  if (props.total_count < props.take) return;

  return <Paginator {...props} />;
};
