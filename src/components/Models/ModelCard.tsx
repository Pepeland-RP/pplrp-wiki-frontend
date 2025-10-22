'use client';

import { renderQueue } from '@/lib/RenderingQueue';
import styles from '@/styles/Models/models.module.css';
import { useEffect, useRef, useState } from 'react';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { useModelViewerContext } from '../ModelViewer/ModelViewerDialog';

interface ModelCardProps {
  name?: string;
  category?: string;
}

export default function ModelCard({
  name = 'test',
  category = 'Новое',
}: ModelCardProps) {
  const { invoke } = useModelViewerContext();
  const [loaded, setLoaded] = useState<boolean>(false);
  const thumbnailRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const renderThumbnail = async () => {
      if (!thumbnailRef.current) return;
      const gltf = await new GLTFLoader().loadAsync('/api/assets/pump');
      thumbnailRef.current.src = await renderQueue.enqueue({
        object: gltf.scene,
        meta: null,
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
          invoke({
            resource_id: 'pump',
            meta: null,
          });
        }}
      >
        <div className={styles.grid_background} />
        <div className={styles.model_badge}>{category}</div>
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
          <h3 className={styles.model_name}>{name}</h3>
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
