'use client';

import { renderQueue } from '@/lib/RenderingQueue';
import { disposeGLTFScene } from '@/lib/three-utils';
import styles from '@/styles/Models/models.module.css';
import { useEffect, useRef, useState } from 'react';
import { Group, Object3DEventMap } from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { useModelViewerContext } from '../ModelViewer/ModelViewerDialog';
import { ModelIcon } from './ModelIcon';
import { getAssetUrl } from '@/lib/api';

export default function ModelCard(props: Model) {
  const { invoke } = useModelViewerContext();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false); // состояние ошибки
  const thumbnailRef = useRef<HTMLImageElement>(null);
  const gltfSceneRef = useRef<Group<Object3DEventMap> | null>(null);

  useEffect(() => {
    let isMounted = true;

    const renderThumbnail = async () => {
      // Проверяем, что ref для миниатюры доступен
      if (!thumbnailRef.current) {
        console.warn(`Thumbnail ref не доступен для модели "${props.name}"`);
        return;
      }
      // Проверяем, что у модели есть GLTF файл
      if (!props.gltf) {
        console.warn(
          `Модель "${props.name}" не имеет GLTF файла для рендеринга миниатюры`,
        );
        setError(true);
        setLoaded(false);
        return;
      }

      try {
        /**
         * Поясню, что происходит ниже
         * Сначала асинхронно подгружаем модельку из GLTF,
         * затем она добавляется в конец очереди где ждет рендеринга,
         * а потом уже устанавливается как `src` в thumbnail
         */
        const gltf = await new GLTFLoader().loadAsync(
          getAssetUrl(props.gltf.resource_id),
        );

        if (!isMounted) {
          // Component unmounted before loading completed, cleanup immediately
          disposeGLTFScene(gltf.scene);
          return;
        }
        // Store reference for cleanup
        gltfSceneRef.current = gltf.scene;

        // Рендерим миниатюру через очередь рендеринга
        const dataURL = await renderQueue.enqueue({
          object: gltf.scene,
          meta: props.gltf.meta,
        });

        if (isMounted && thumbnailRef.current) {
          thumbnailRef.current.src = dataURL;
          setLoaded(true);
        }
      } catch (e) {
        // Обрабатываем ошибки загрузки или рендеринга
        console.error('Ошибка при загрузке/рендеринге GLTF или enqueue: ', e);
        if (isMounted) {
          setError(true);
          setLoaded(true);
        }
      }
    };

    void renderThumbnail();

    return () => {
      isMounted = false;
      // Cleanup GLTF scene on unmount
      if (gltfSceneRef.current) {
        disposeGLTFScene(gltfSceneRef.current);
        gltfSceneRef.current = null;
      }
    };
  }, []);

  const icons = props.acceptable_items.map((el, i) => (
    <ModelIcon key={i} {...el} />
  ));

  return (
    <article className={styles.model_card}>
      <div
        className={`${styles.model_preview} ${
          error && styles.model_preview_error
        }`}
        onClick={() => {
          if (!props.gltf) {
            console.warn(
              `Модель "${props.name}" не имеет GLTF файла для просмотра`,
            );
            return;
          }
          invoke(props);
        }}
        style={{
          cursor: props.gltf ? 'pointer' : 'not-allowed',
          opacity: props.gltf ? 1 : 0.7,
        }}
      >
        <div className={styles.grid_background} />
        {props.season && (
          <div className={styles.model_badge}>{props.season.name}</div>
        )}
        <div className={styles.image_container}>
          {!error ? (
            <img
              ref={thumbnailRef}
              alt={props.name}
              width={300}
              height={300}
              className={`${styles.thumbnail} ${
                !loaded && styles.thumbnail_loading
              }`}
            />
          ) : (
            <span>Ошибка при загрузке модели</span>
          )}
        </div>
      </div>

      <div className={styles.model_info}>
        <div className={styles.model_details}>
          <h3 className={styles.model_name}>{props.name}</h3>
          <div className={styles.model_icons}>{icons}</div>
        </div>
      </div>
    </article>
  );
}
