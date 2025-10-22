'use client';

import { ModelViewer } from '@/components/ModelViewer/ModelViewer';
import { Group, Object3DEventMap } from 'three';

type TaskDTO = {
  object: Group<Object3DEventMap>;
  meta?: GLTFMeta | null;
};

type Task = {
  data: TaskDTO;
  resolve: (value: string) => void;
  reject: (err: unknown) => void;
};

export class RenderingQueue {
  private queue: Task[] = [];
  private working: boolean = false;

  private renderer!: ModelViewer | null;
  private canvas!: HTMLCanvasElement;
  private disposed: boolean = false;
  private disposeTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.init();
  }

  init() {
    if (typeof document === 'undefined') return;
    this.canvas = document.createElement('canvas');
    this.renderer = new ModelViewer({
      canvas: this.canvas,
      width: 400,
      height: 400,
      renderPaused: true,
    });

    this.renderer.scene.remove(this.renderer.grid);
    this.renderer.camera.position.set(-0.85, 0.7, -0.85);

    // Жесточайше прогреваем буфер
    this.renderer.composer.render();
    this.disposed = false;
  }

  async enqueue(task: TaskDTO): Promise<string> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        resolve,
        reject,
        data: task,
      });
      this.process();
    });
  }

  private async process() {
    if (this.working) return;
    const task = this.queue.shift();
    if (!task) {
      if (this.disposeTimer) clearTimeout(this.disposeTimer);
      this.disposeTimer = setTimeout(() => {
        if (this.queue.length === 0 && !this.working) {
          this.renderer!.dispose();
          this.disposed = true;
          this.disposeTimer = null;
          this.renderer = null;

          console.log('Renderer disposed');
        }
      }, 5000);
      return;
    }

    if (this.disposed) {
      this.init();
    }

    if (this.disposeTimer) {
      clearTimeout(this.disposeTimer);
      this.disposeTimer = null;
    }

    this.working = true;

    try {
      let should_center = true;
      if (task.data.meta?.render?.camera_position) {
        this.renderer!.camera.position.set(
          ...task.data.meta.render.camera_position,
        );
      }

      if (task.data.meta?.render?.controls_target) {
        should_center = false;
        this.renderer!.controls.target.set(
          ...task.data.meta.render.controls_target,
        );
      }

      this.renderer!.controls.update();

      // Пробуем рендерить
      this.renderer!.setGltf(task.data.object, should_center);
      task.resolve(this.canvas.toDataURL());
    } catch (e) {
      task.reject(e);
    } finally {
      this.working = false;
      queueMicrotask(() => this.process());
    }
  }
}

const globalForRender = globalThis as unknown as {
  renderQueue?: RenderingQueue;
};
export const renderQueue =
  globalForRender.renderQueue ??
  (globalForRender.renderQueue = new RenderingQueue());
