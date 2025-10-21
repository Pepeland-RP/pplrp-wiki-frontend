'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import ReactCSSTransition from '@/components/shared/CSSTransition';
import style from '@/styles/ModelViewer/common.module.css';
import { ModelViewer } from './ModelViewer';

const ModelViewerContext = createContext<ModelViewerDialogProps | undefined>(
  undefined,
);

export const useModelViewerContext = () => {
  const context = useContext(ModelViewerContext);
  if (!context) throw new Error('Context not mounted!');
  return context;
};

export const ModelViewerProvider = ({ children }: { children: ReactNode }) => {
  const [modelUrl, setModelUrl] = useState<string>('');
  const [expanded, setExpanded] = useState<boolean>(false);
  const viewerRef = useRef<ModelViewer>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!expanded) {
      if (viewerRef.current) viewerRef.current.dispose();
      return;
    }

    // Подождем 50мс, чтобы канваз успел смонтироваться
    setTimeout(() => {
      viewerRef.current = new ModelViewer({
        canvas: canvasRef.current!,
        width: 400,
        height: 400,
        gltf_path: modelUrl,
      });

      // К сожалению, мой личный таролог покинул меня,
      // поэтому менять в принципе можно
      viewerRef.current.camera.position.set(-0.9, 0.74, 0.9);

      const resizeObserver = new ResizeObserver(entries => {
        const { width, height } = entries[0].contentRect;
        if (!viewerRef.current) return;
        viewerRef.current.setSize(width, height);
      });

      resizeObserver.observe(
        document.getElementById('viewer') as HTMLDivElement,
      );
    }, 50);

    return () => {
      if (viewerRef.current) viewerRef.current.dispose();
    };
  }, [expanded, modelUrl]);

  const invoke = (url: string) => {
    setModelUrl(url);
    setExpanded(true);
  };

  return (
    <ModelViewerContext.Provider value={{ invoke }}>
      <ReactCSSTransition
        state={expanded}
        timeout={300}
        classNames={{
          exitActive: style.background_exit_active,
        }}
      >
        <div className={style.background}>
          <div className={style.viewer}>
            <div className={style.render_container} id="viewer">
              <canvas ref={canvasRef} />
            </div>
            <button
              onClick={() => {
                setExpanded(false);
              }}
            >
              Жесточайше закрыть
            </button>
          </div>
        </div>
      </ReactCSSTransition>
      {children}
    </ModelViewerContext.Provider>
  );
};
