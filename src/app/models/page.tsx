'use client';

import ModelCard from '@/components/Models/ModelCard';
import styles from '@/styles/Models/models.module.css';
import axios from 'axios';
import useSWR from 'swr';
import { useState, useEffect } from 'react';

const fetcher = async (): Promise<Model[]> => {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/models`);
  return response.data;
};

export default function ModelsPage() {
  const { data, isLoading } = useSWR('models', async () => fetcher());
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

      return () => clearTimeout(timer);
    }
  }, [data, isLoading]);

  return (
    <div className={styles.models_page}>
      <div className={styles.models_container}>
        <div className={styles.models_header}>
          <h1 className={styles.models_title}>Модели</h1>
        </div>

        {!showContent ? (
          <div
            className={`${styles.loading_background} ${hideLoader ? styles.loading_background_exit : ''}`}
          >
            <div className={styles.loading_viewer}>
              <img
                src="/logos/ppl-only-logo.svg" // ничего кроме той анимации которая щас на старом сайте не придумал. Можем потом что-то другое придумать.
                alt="Loading"
                className={styles.loading_logo}
              />
            </div>
          </div>
        ) : (
          <div className={`${styles.models_grid} ${styles.show}`}>
            {data!.map(element => (
              <ModelCard key={element.id} {...element} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
