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
import { InitialAnimation } from './animation';

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
  const [loaded, setLoaded] = useState<boolean>(false);
  const viewerRef = useRef<ModelViewer>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!expanded) {
      if (viewerRef.current) viewerRef.current.dispose();
      return;
    }

    // Подождем 50мс, чтобы канваз успел смонтироваться
    let observer: ResizeObserver;
    setTimeout(() => {
      viewerRef.current = new ModelViewer({
        canvas: canvasRef.current!,
        width: 400,
        height: 400,
      });

      viewerRef.current.loadGLTF(modelUrl).then(() => {
        viewerRef.current!.animation = new InitialAnimation();
        setLoaded(true);
      });

      observer = new ResizeObserver(entries => {
        const { width, height } = entries[0].contentRect;
        if (!viewerRef.current) return;
        viewerRef.current.setSize(width, height);
      });

      observer.observe(document.getElementById('viewer') as HTMLDivElement);
    }, 50);

    return () => {
      if (viewerRef.current) viewerRef.current.dispose();

      const el = document.getElementById('viewer');
      if (observer && el) observer.unobserve(el);
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
              <canvas
                ref={canvasRef}
                style={{ opacity: loaded ? 1 : 0 }}
                className={style.canvas}
              />
            </div>
            <button
              onClick={() => {
                setExpanded(false);
                setLoaded(false);
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
