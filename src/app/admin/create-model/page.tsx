'use client';

import { ModelSettings } from '@/components/Admin/create/Model';
import { MoveBack } from '@/components/Admin/MoveBack';
import styles from '@/styles/Admin/create/page.module.css';

const Create = () => {
  return (
    <main className={styles.container}>
      <h2>Новая модель</h2>
      <MoveBack />
      <div style={{ display: 'flex', justifyContent: 'start' }}>
        <ModelSettings onChange={console.log} />
      </div>
    </main>
  );
};

export default Create;
