'use client';

import { ModelViewer } from '@/components/ModelViewer/ModelViewer';
import { useEffect, useRef, useState } from 'react';
import styles from '@/styles/page.module.css';
import { IconHexagons, IconX } from '@tabler/icons-react';
import Link from 'next/link';
import { PepeTargetAnimation } from '@/lib/root/pepeTargetAnimation';
import DownloadDropdown from '@/components/shared/DownloadDropdown';

const offset_scale_x = 0.02;
const offset_scale_y = 0.5;

export default function Home() {
     const canvasRef = useRef<HTMLCanvasElement>(null);
     const viewerRef = useRef<ModelViewer>(null);
     const observerRef = useRef<ResizeObserver>(null);
     const animationRef = useRef<PepeTargetAnimation>(null);

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
          viewerRef.current.camera.position.set(
               ...PepeTargetAnimation.defaultCameraPos,
          );
          viewerRef.current.controls.update();
          viewerRef.current.render();

          animationRef.current = new PepeTargetAnimation();
          viewerRef.current.animation = animationRef.current;
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
          if (!animationRef.current) return;
          const offset_x = evt.clientX / window.innerWidth - 0.5;
          const offset_y = evt.clientY / window.innerHeight - 0.5;

          animationRef.current.setMouseOffset(
               offset_x,
               offset_y,
               offset_scale_x,
               offset_scale_y,
          );
     };

     return (
          <main>
               <div className={styles.container} onMouseMove={mouseMoveEvent}>
                    <canvas
                         ref={canvasRef}
                         className={`${styles.pepe_render} ${!loaded && styles.loading}`}
                    />
                    <div
                         className={`${styles.texts_container} ${!loaded && styles.loading}`}
                    >
                         <h1>Pepeland Pack</h1>
                         <p className={styles.description}>
                              Ресурспак с уникальными моделями и костюмами для
                              вашего идеального образа на сервере PepeLand
                         </p>
                         <div className={styles.links_container}>
                              <DownloadDropdown />
                              <Link href="/models">
                                   <IconHexagons />
                                   Каталог моделей
                              </Link>
                         </div>
                    </div>
               </div>
               <p className={styles.created_by}>
                    site created by{' '}
                    <Link href="https://manukq.systems">Manukq</Link>{' '}
                    <IconX size={12} />{' '}
                    <Link href="https://andcool.ru">AndcoolSystems</Link>
               </p>
          </main>
     );
}
