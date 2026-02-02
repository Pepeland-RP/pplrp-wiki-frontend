'use client';

import { ModelViewer } from '@/components/ModelViewer/ModelViewer';

type TaskDTO = {
  object_url: string;
  meta?: GLTFMeta | null;
};

type Task = {
  id: number;
  data: TaskDTO;
  resolve: (value: string) => void;
  reject: (err: unknown) => void;
  cancelled: boolean;
};

export class RenderingQueue {
  private queue: Task[] = [];
  private working: boolean = false;
  private taskIdCounter: number = 0;

  private renderer!: ModelViewer | null;
  private canvas!: HTMLCanvasElement;
  private disposed: boolean = false;
  private disposeTimer: NodeJS.Timeout | null = null;

  private gltfRacePromiseReject?: () => void;

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

  enqueue(task: TaskDTO): { result: Promise<string>; taskId: number } {
    const taskId = this.taskIdCounter++;
    const result = new Promise<string>((resolve, reject) => {
      this.queue.push({
        id: taskId,
        resolve,
        reject,
        data: task,
        cancelled: false,
      });
      this.process();
    });
    return { result, taskId };
  }

  cancel(taskId: number): boolean {
    const taskIndex = this.queue.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      const task = this.queue[taskIndex];
      task.cancelled = true;
      this.queue.splice(taskIndex, 1);
      this.renderer?.gltfLoaderAbort?.();
      this.gltfRacePromiseReject?.();
      this.gltfRacePromiseReject = undefined;

      if (this.renderer?.gltf) {
        this.renderer.scene.remove(this.renderer.gltf);
      }

      task.reject(new Error('Task cancelled'));
      return true;
    }
    return false;
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
      // Да, я знаю что обрыв промиса лоадинга таким образом не остановит загрузку,
      // но loadGltf не поддерживает контроллер абортов(((
      await Promise.race([
        new Promise((_, reject) => (this.gltfRacePromiseReject = reject)),
        this.renderer?.loadGLTF(task.data.object_url, true),
      ]);
      this.renderer?.applyMeta(task.data.meta ?? null);

      this.renderer?.setDoubleSided(
        task.data.meta?.render?.double_sided ?? true,
      );

      this.renderer?.render();
      const dataURL = this.canvas.toDataURL('image/webp');
      this.renderer!.scene.remove(this.renderer!.gltf!);

      task.resolve(dataURL);
    } catch (e) {
      task.reject(e);
    } finally {
      this.working = false;
      setTimeout(() => this.process(), 0);
    }
  }
}

const globalForRender = globalThis as unknown as {
  renderQueue?: RenderingQueue;
};
export const renderQueue =
  globalForRender.renderQueue ??
  (globalForRender.renderQueue = new RenderingQueue());
