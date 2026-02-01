'use client';

import { redirect, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useNextCookie } from 'use-next-cookie';
import { Login } from './Login';
import { checkMe } from '@/lib/api/admin';

export const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const sessionId = useNextCookie('sessionId', 1000);
  const pathname_relative = usePathname().replace('/admin', '');

  useEffect(() => {
    if (!sessionId) return;
    checkMe();
  }, [sessionId]);

  if (!sessionId && pathname_relative === '') return <Login />;
  if (!sessionId) redirect('/admin');
  return <div style={{ padding: '2rem', paddingTop: '1rem' }}>{children}</div>;
};
