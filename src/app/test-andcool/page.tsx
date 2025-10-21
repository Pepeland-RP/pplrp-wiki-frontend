'use client';

import { useModelViewerContext } from '@/components/ModelViewer/ModelViewerDialog';

const Page = () => {
  const { invoke } = useModelViewerContext();
  return (
    <button
      onClick={() => {
        invoke('/api/assets/pump');
      }}
    >
      Жесточайше открыть
    </button>
  );
};

export default Page;
