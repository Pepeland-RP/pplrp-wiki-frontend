'use client';

import { renderQueue } from '@/lib/RenderingQueue';
import styles from '@/styles/Models/models.module.css';
import { useEffect, useRef, useState } from 'react';
import { useModelViewerContext } from '../ModelViewer/ModelViewerDialog';
import { ModelIcon } from './ModelIcon';
import { getAssetUrl } from '@/lib/api';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { idbGet, idbSet } from '@/lib/idb';

export default function ModelCard(props: Model) {
  const { invoke } = useModelViewerContext();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const thumbnailRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let isMounted = true;

    const renderThumbnail = async () => {
      if (!thumbnailRef.current) {
        console.warn(`Thumbnail ref не доступен для модели "${props.name}"`);
        return;
      }
      const cache = await idbGet('renders', `v1-model-${props.gltf?.resource_id}`);
      if (cache) {
        thumbnailRef.current.src = cache;
        setLoaded(true);
        return;
      }

      if (!props.gltf) {
        console.warn(
          `Модель "${props.name}" не имеет GLTF файла для рендеринга миниатюры`,
        );
        setError(true);
        setLoaded(false);
        return;
      }

      try {
        const dataURL = await renderQueue.enqueue({
          object_url: getAssetUrl(props.gltf.resource_id),
          meta: props.gltf.meta,
        });

        if (isMounted && thumbnailRef.current) {
          thumbnailRef.current.src = dataURL;
          void idbSet('renders', `v1-model-${props.gltf?.resource_id}`, dataURL);
          setLoaded(true);
        }
      } catch (e) {
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
    };
  }, []);

  const handleCopyName = async () => {
    try {
      await navigator.clipboard.writeText(props.name);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Ошибка копирования:', err);
    }
  };

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
          <div className={styles.model_name_row}>
            <h3 className={styles.model_name}>{props.name}</h3>
            <button
              className={styles.copy_button}
              onClick={handleCopyName}
              title="Скопировать"
              aria-label="Скопировать модель"
            >
              {copied ? (
                <IconCheck size={18} stroke={2} />
              ) : (
                <IconCopy size={18} stroke={2} />
              )}
            </button>
          </div>
          <div className={styles.model_icons}>{icons}</div>
        </div>
      </div>
    </article>
  );
}
