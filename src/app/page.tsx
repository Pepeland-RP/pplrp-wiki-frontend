'use client';

import { ModelViewer } from '@/components/ModelViewer/ModelViewer';
import { useEffect, useRef, useState } from 'react';
import styles from '@/styles/page.module.css';
import { IconDownload, IconHexagons, IconX } from '@tabler/icons-react';
import Link from 'next/link';

const default_camera_pos: [number, number, number] = [-7.27, 2.57, -13.6];
const offset_scale_x = 0.02;
const offset_scale_y = 0.5;

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<ModelViewer>(null);
  const observerRef = useRef<ResizeObserver>(null);

  const [loaded, setLoaded] = useState<boolean>(false);

  const init = async () => {
    if (!canvasRef.current) return;
    if (viewerRef.current) return;

    viewerRef.current = new ModelViewer({
      canvas: canvasRef.current,
      width: 800,
      height: 800,
    });

    viewerRef.current.scene.remove(viewerRef.current.grid);
    viewerRef.current.controls.enableRotate = false;
    viewerRef.current.controls.enableZoom = false;
    viewerRef.current.controls.enablePan = false;

    await viewerRef.current.loadGLTF('/static/ppl.gltf', true);
    viewerRef.current.camera.position.set(...default_camera_pos);
    viewerRef.current.controls.update();
    viewerRef.current.render();

    observerRef.current = new ResizeObserver(e => {
      const target = e[0];
      if (!target) return;
      viewerRef.current?.setSize(
        target.contentRect.width,
        target.contentRect.height,
      );
    });
    observerRef.current.observe(canvasRef.current);

    setLoaded(true);
  };

  useEffect(() => {
    void init();

    return () => {
      if (canvasRef.current && observerRef.current)
        observerRef.current.unobserve(canvasRef.current);
      if (viewerRef.current) {
        viewerRef.current.dispose();
        viewerRef.current = null;
      }
    };
  }, []);

  const mouseMoveEvent = (evt: React.MouseEvent<HTMLDivElement>) => {
    if (!viewerRef.current || !viewerRef.current.gltf) return;
    const offset_percent_x = evt.clientX / window.innerWidth - 0.5;
    const offset_percent_y = evt.clientY / window.innerHeight - 0.5;

    viewerRef.current.gltf.rotation.y = offset_percent_x * offset_scale_x;
    viewerRef.current.camera.position.y =
      default_camera_pos[1] + offset_percent_y * offset_scale_y;
  };

  return (
    <main>
      <div className={styles.container} onMouseMove={mouseMoveEvent}>
        <canvas
          ref={canvasRef}
          className={`${styles.pepe_render} ${!loaded && styles.loading}`}
        />
        <div className={`${styles.texts_container} ${!loaded && styles.loading}`}>
          <h1>Pepeland RP</h1>
          <p className={styles.description}>
            Ресурспак с уникальными моделями и костюмами для вашего идеального
            образа на сервере PepeLand
          </p>
          <div className={styles.links_container}>
            <Link href="https://modrinth.com/resourcepack/pepelandrp">
              <IconDownload />
              Скачать пак
            </Link>

            <Link href="/models">
              <IconHexagons />
              Каталог моделей
            </Link>
          </div>
        </div>
      </div>
      <p className={styles.created_by}>
        site created by <Link href="https://manukq.systems">Manukq</Link>{' '}
        <IconX size={12} />{' '}
        <Link href="https://andcool.ru">AndcoolSystems</Link>
      </p>
    </main>
  );
}
