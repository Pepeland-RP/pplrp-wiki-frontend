import { ModelViewerProvider } from '@/components/ModelViewer/ModelViewerDialog';
import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <ModelViewerProvider>{children}</ModelViewerProvider>;
};

export default Layout;
