'use client';

import { useNextCookie } from 'use-next-cookie';

/** Это все для теста */
const decodeJWT = (jwt: string) => {
  const fr = jwt.split('.').at(1);
  if (!fr) return null;
  return JSON.parse(atob(fr));
};

const Admin = () => {
  const sessionId = useNextCookie('sessionId', 1000);

  const login = sessionId ? decodeJWT(sessionId).user.login : 'error';
  return <p>Добро пожаловать, {login}</p>;
};

export default Admin;
