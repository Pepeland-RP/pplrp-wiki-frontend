'use client';

import ModelCard from '@/components/Models/ModelCard';
import styles from '@/styles/Models/models.module.css';
import axios from 'axios';
import useSWR from 'swr';

const fetcher = async (): Promise<Model[]> => {
  const response = await axios.get('/api/models');
  return response.data;
};

export default function ModelsPage() {
  const { data, isLoading } = useSWR('models', async () => fetcher());

  // TODO: Do normal loading placeholder
  if (!data || isLoading) return;

  const elements = data.map((element, i) => <ModelCard key={i} {...element} />);
  return (
    <div className={styles.models_page}>
      <div className={styles.models_container}>
        <div className={styles.models_header}>
          <h1 className={styles.models_title}>Модели</h1>
        </div>

        <div className={styles.models_grid}>{elements}</div>
      </div>
    </div>
  );
}
