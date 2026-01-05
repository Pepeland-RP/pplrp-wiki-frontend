'use client';

import { ModelViewer } from '@/components/ModelViewer/ModelViewer';

type TaskDTO = {
  object_url: string;
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
      renderDoubleSide: true,
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
      await this.renderer?.loadGLTF(task.data.object_url, true);
      this.renderer?.applyMeta(task.data.meta ?? null);

      this.renderer?.setDoubleSided(
        task.data.meta?.render?.double_sided ?? true,
      );

      this.renderer?.render();
      const dataURL = this.canvas.toDataURL();
      this.renderer!.scene.remove(this.renderer!.gltf!);

      task.resolve(dataURL);
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
