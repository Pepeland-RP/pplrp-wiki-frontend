'use client';

import { ModelViewer } from '@/components/ModelViewer/ModelViewer';
import { Group, Object3DEventMap } from 'three';

type TaskDTO = {
  object: Group<Object3DEventMap>;
};

type Task = {
  data: TaskDTO;
  resolve: (value: string) => void;
  reject: (err: unknown) => void;
};

export class RenderingQueue {
  private queue: Task[] = [];
  private working: boolean = false;

  private renderer!: ModelViewer;
  private canvas!: HTMLCanvasElement;

  constructor() {
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
    if (!task) return;

    this.working = true;

    try {
      // Пробуем рендерить
      this.renderer.setGltf(task.data.object);
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
