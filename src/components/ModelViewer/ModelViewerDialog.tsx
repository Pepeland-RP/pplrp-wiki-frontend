'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import ReactCSSTransition from '@/components/shared/CSSTransition';
import style from '@/styles/ModelViewer/common.module.css';
import { ModelViewer } from './ModelViewer';
import { ExitAnimation, InitialAnimation } from './animation';
import { IconEye, IconX } from '@tabler/icons-react';
import { disableScroll, enableScroll } from '@/lib/scroll';
import { getAssetUrl } from '@/lib/api/api';

const ModelViewerContext = createContext<ModelViewerDialogProps | undefined>(
  undefined,
);

export const useModelViewerContext = () => {
  const context = useContext(ModelViewerContext);
  if (!context) throw new Error('Context not mounted!');
  return context;
};

export const ModelViewerProvider = ({ children }: { children: ReactNode }) => {
  const [modelData, setModelData] = useState<Model | null>(null);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const viewerRef = useRef<ModelViewer>(null);
  const observerRef = useRef<ResizeObserver>(null);

  useEffect(() => {
    return () => {
      // Cleanup viewer
      if (viewerRef.current) {
        viewerRef.current.dispose();
        viewerRef.current = null;
      }
      // Cleanup observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  const invoke = (props: Model) => {
    setModelData(props);
    setExpanded(true);
    disableScroll();
  };

  const close = () => {
    if (viewerRef.current) {
      viewerRef.current.animation = new ExitAnimation(
        viewerRef.current.camera.position.toArray(),
      );
    }

    setExpanded(false);
    setLoaded(false);
    enableScroll();
  };

  const callbackRef = useCallback(
    (element: HTMLCanvasElement | null) => {
      if (element && modelData) {
        // Cleanup previous viewer if exists
        if (viewerRef.current) {
          viewerRef.current.dispose();
          viewerRef.current = null;
        }

        // Cleanup previous observer if exists
        if (observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }

        viewerRef.current = new ModelViewer({
          canvas: element,
          width: 400,
          height: 400,
          panoramaUrl: '/static/panorama_image.png',
          renderDoubleSide: modelData.gltf?.meta?.render?.double_sided ?? true,
        });

        viewerRef.current
          .loadGLTF(getAssetUrl(modelData.gltf!.resource_id))
          .then(() => {
            viewerRef.current?.applyMeta(modelData.gltf?.meta ?? null);
            viewerRef.current!.animation = new InitialAnimation(
              modelData.gltf?.meta?.render?.camera_position,
            );
            setLoaded(true);

            viewerRef.current?.render();
          });

        const viewerElement = document.getElementById('viewer');
        if (viewerElement) {
          observerRef.current = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            if (!viewerRef.current) return;
            viewerRef.current.setSize(width, height);
          });

          observerRef.current.observe(viewerElement);
        }
      } else {
        // Cleanup when element or modelData is null
        if (observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }
        if (viewerRef.current) {
          viewerRef.current.dispose();
          viewerRef.current = null;
        }
      }
    },
    [modelData],
  );

  return (
    <ModelViewerContext.Provider value={{ invoke, hide: close }}>
      <ReactCSSTransition
        state={expanded}
        timeout={300}
        classNames={{
          exitActive: style.background_exit_active,
        }}
      >
        <div
          className={style.background}
          onClick={e => {
            if (e.target !== e.currentTarget) return;
            close();
          }}
        >
          <div className={style.viewer}>
            <div className={style.header}>
              <h3>
                <IconEye />
                Предпросмотр
              </h3>
              <button onClick={close}>
                <IconX />
              </button>
            </div>
            <div
              className={style.render_container_container}
              onMouseDown={() => {
                if (viewerRef.current) viewerRef.current.animation = undefined;
              }}
              onTouchStart={() => {
                if (viewerRef.current) viewerRef.current.animation = undefined;
              }}
            >
              <div className={style.render_container} id="viewer">
                <canvas
                  ref={callbackRef}
                  style={{ opacity: loaded ? 1 : 0 }}
                  className={style.canvas}
                />
              </div>
            </div>
          </div>
        </div>
      </ReactCSSTransition>
      {children}
    </ModelViewerContext.Provider>
  );
};
