'use client';

import { ModelViewer } from '@/components/ModelViewer/ModelViewer';
import { getAssetUrl } from '@/lib/api';
import { useEffect, useRef, useState } from 'react';
import styles from '@/styles/Admin/create/Model.module.css';

interface ModelSettingsProps {
  model?: Model;
  onChange: (props: { model: File; meta: object }) => void;
}

export const ModelSettings = (props: ModelSettingsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<ModelViewer>(null);
  const observerRef = useRef<ResizeObserver>(null);

  const [model, setModel] = useState<File | null>(null);
  const [doubleSide, setDoubleSide] = useState<boolean>(
    props.model?.gltf?.meta?.render?.double_sided ?? true,
  );
  const [meta, setMeta] = useState<object>({});

  const setModelFileFromUrl = async (url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();

    const file = new File([blob], 'model.glb', {
      type: blob.type || 'model/gltf-binary',
    });
    setModel(file);
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    viewerRef.current = new ModelViewer({
      canvas: canvasRef.current,
      height: 300,
      width: 300,
      renderDoubleSide: doubleSide,
    });

    if (props.model) {
      setModelFileFromUrl(getAssetUrl(props.model.gltf!.resource_id));
      viewerRef.current
        .loadGLTF(getAssetUrl(props.model.gltf!.resource_id))
        .then(() => {
          viewerRef.current?.applyMeta(props.model?.gltf?.meta ?? null);
        });
    }
    viewerRef.current?.render();

    viewerRef.current.controls.addEventListener('change', () => {
      setMeta({
        camera_position: viewerRef.current!.camera.position.toArray(),
        controls_target: viewerRef.current!.controls.target.toArray(),
        camera_zoom: viewerRef.current?.camera.zoom,
      });
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
  }, []);

  useEffect(() => {
    if (!viewerRef.current) return;

    viewerRef.current.setDoubleSided(doubleSide);
    if (model)
      props.onChange({
        model,
        meta: { render: { ...meta, ...{ double_sided: doubleSide } } },
      });
  }, [doubleSide, meta, model]);

  const handleModelSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files;
      if (files && viewerRef.current) {
        const file = files[0];
        if (file.name.split('.').reverse()[0] !== 'gltf') return;
        setModel(file);
        viewerRef.current.loadGLTF(URL.createObjectURL(file));
      }
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.render_container} id="viewer">
        <canvas ref={canvasRef} />
      </div>
      <span>
        <i>
          Текущее положение модели
          <br /> будет использовано в каталоге.
        </i>
      </span>
      <div className={styles.buttons_cont}>
        <button
          className={styles.button}
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          Выберите .gltf
        </button>
        <button
          onClick={() => viewerRef.current?.centerModel()}
          className={styles.button}
        >
          Центрировать модель
        </button>
      </div>
      <input
        id="fileInput"
        type="file"
        accept="model/gltf-binary"
        onChange={handleModelSelect}
        style={{ display: 'none' }}
      />
      <div>
        <input
          type="checkbox"
          id="double-side"
          checked={doubleSide}
          onChange={e => setDoubleSide(e.target.checked)}
        />
        <label htmlFor="double-side">Отображать текстуры с обеих сторон</label>
      </div>
    </div>
  );
};
