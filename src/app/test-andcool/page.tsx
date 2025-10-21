'use client';

import { useModelViewerContext } from '@/components/ModelViewer/ModelViewerDialog';

const Page = () => {
  const { invoke } = useModelViewerContext();
  return (
    <button
      onClick={() => {
        invoke('/api/assets/643d7263-88cb-4e04-ab30-f9abdf510173');
      }}
    >
      Жесточайше открыть
    </button>
  );
};

export default Page;
