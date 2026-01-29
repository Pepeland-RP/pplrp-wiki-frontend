'use client';

import { useNextCookie } from 'use-next-cookie';
import styles from '@/styles/Admin/page.module.css';
import Link from 'next/link';
import {
  IconEdit,
  IconLayoutGridAdd,
  IconLogout,
  IconSword,
} from '@tabler/icons-react';
import { deleteCookie } from 'cookies-next';

const decodeJWT = (jwt: string) => {
  const fr = jwt.split('.').at(1);
  if (!fr) return null;
  return JSON.parse(atob(fr));
};

const Admin = () => {
  const sessionId = useNextCookie('sessionId', 1000);

  const login = sessionId ? decodeJWT(sessionId)?.user?.login : 'error';
  return (
    <div className={styles.container}>
      <h2>
        Добро пожаловать, <b>{login}</b>
      </h2>
      <p>
        <i>
          Для изменения уже существующих моделей, перейдите в{' '}
          <Link href="/models">публичный каталог</Link> и нажмите на кнопку{' '}
          <IconEdit /> соответствующей модели.{' '}
        </i>
      </p>
      <Link href="/admin/create-model" className={styles.links}>
        <IconLayoutGridAdd />
        Создать новую модель
      </Link>
      <Link href="/admin/items" className={styles.links}>
        <IconSword />
        Управление Minecraft предметами
      </Link>

      <button
        className={styles.links}
        onClick={() => deleteCookie('sessionId')}
      >
        <IconLogout />
        Выйти
      </button>
    </div>
  );
};

export default Admin;
