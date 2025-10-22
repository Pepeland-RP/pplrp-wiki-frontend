'use client';

import { renderQueue } from '@/lib/RenderingQueue';
import styles from '@/styles/Models/models.module.css';
import { useEffect, useRef, useState } from 'react';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { useModelViewerContext } from '../ModelViewer/ModelViewerDialog';

export default function ModelCard(props: Model) {
  const { invoke } = useModelViewerContext();
  const [loaded, setLoaded] = useState<boolean>(false);
  const thumbnailRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const renderThumbnail = async () => {
      // TODO: Make proper handling of this)
      if (!thumbnailRef.current || !props.gltf) return;

      /**
       * Поясню, что происходит ниже
       * Сначала асинхронно подгружаем модельку из GLTF,
       * затем она добавляется в конец очереди где ждет рендеринга,
       * а потом уже устанавливается как `src` в thumbnail
       */
      const gltf = await new GLTFLoader().loadAsync(
        `/api/assets/${props.gltf.resource_id}`,
      );

      // TODO: Этот промис может выкинуть эксцепшн, надо его схэндлить как-то (показать вместо картинки ошибку)
      thumbnailRef.current.src = await renderQueue.enqueue({
        object: gltf.scene,
        meta: props.gltf.meta,
      });
      setLoaded(true);
    };

    renderThumbnail();
  }, []);

  return (
    <article className={styles.model_card}>
      <div
        className={styles.model_preview}
        onClick={() => {
          // TODO: Make proper handling of this)
          if (!props.gltf) return;
          invoke({
            resource_id: props.gltf.resource_id,
            meta: props.gltf.meta,
          });
        }}
      >
        <div className={styles.grid_background} />
        {props.season && (
          <div className={styles.model_badge}>{props.season.name}</div>
        )}
        <div className={styles.image_container}>
          <img
            ref={thumbnailRef}
            width={300}
            height={300}
            className={`${styles.thumbnail} ${
              !loaded && styles.thumbnail_loading
            }`}
          />
        </div>
      </div>

      <div className={styles.model_info}>
        <div className={styles.model_details}>
          <h3 className={styles.model_name}>{props.name}</h3>
          <div className={styles.model_icons}>
            <div className={styles.model_icon_placeholder}></div>
            <div className={styles.model_icon_placeholder}></div>
            <div className={styles.model_icon_placeholder}></div>
          </div>
        </div>
      </div>
    </article>
  );
}
/* просто тестовые плейсхолдеры без бека. я пукнул. */
