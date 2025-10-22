'use client';

import ModelCard from '@/components/Models/ModelCard';
import styles from '@/styles/Models/models.module.css';

export default function ModelsPage() {
  return (
    <div className={styles.models_page}>
      <div className={styles.models_container}>
        <div className={styles.models_header}>
          <h1 className={styles.models_title}>Модели</h1>
        </div>

        <div className={styles.models_grid}>
          <ModelCard name="test" category="Новое" />
          <ModelCard name="test" category="Новое" />
          <ModelCard name="test" category="Новое" />
          <ModelCard name="test" category="Новое" />
          <ModelCard name="test" category="Новое" />
          <ModelCard name="test" category="Новое" />
        </div>
      </div>
    </div>
  );
}
