'use client';

import { login } from '@/lib/api';
import styles from '@/styles/Admin/Login.module.css';
import { useRef, useState } from 'react';

export const Login = () => {
  const loginRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(loginRef.current!.value, passwordRef.current!.value)
      .then(r => {
        if (!r.success) setError(r.message);
      })
      .catch(() => setError('Неожиданная ошибка'));
  };

  return (
    <div className={styles.container}>
      <h1>Войти</h1>
      <form className={styles.card} onSubmit={handleSubmit}>
        <label htmlFor="login">Логин</label>
        <input
          ref={loginRef}
          type="text"
          id="login"
          name="login"
          placeholder="Введите логин..."
          required
        />
        <label htmlFor="password">Пароль</label>
        <input
          ref={passwordRef}
          type="password"
          id="password"
          name="password"
          placeholder="Введите пароль..."
          required
        />
        {error && <span className={styles.error}>{error}</span>}
        <input type="submit" value="Войти" />
      </form>
    </div>
  );
};
