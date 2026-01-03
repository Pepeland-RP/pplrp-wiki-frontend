import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import { CookieProvider } from 'use-next-cookie';
import { headers } from 'next/headers';
import meta from '@/constants/meta.json';
import { merge } from 'lodash';

export const generateMetadata = async (): Promise<Metadata | undefined> => {
  const headersList = await headers();
  const path = headersList.get('X-Path')?.split('?')[0];
  const object = meta as { [key: string]: unknown };
  const base = meta.base;
  if (!path) return base;
  return merge({}, base, object[path]) as Metadata;
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 5.0,
  userScalable: true,
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CookieProvider>
      <html lang="ru">
        <body className={inter.className}>
          <Sidebar />
          <main className="appMain">{children}</main>
        </body>
      </html>
    </CookieProvider>
  );
}
