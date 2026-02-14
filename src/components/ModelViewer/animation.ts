import { ModelViewer } from './ModelViewer';
type Vector3Array = [number, number, number];

export abstract class ModelAnimation {
  abstract animate(viewer: ModelViewer, progress: number): void;
}

export class InitialAnimation extends ModelAnimation {
  // К сожалению, мой личный таролог покинул меня,
  // поэтому менять в принципе можно
  initial_pos = [-1, 1.1, -0.5];
  target_pos = [-0.85, 0.7, -0.95];
  length = 1;

  constructor(target?: Vector3Array) {
    super();
    if (target) {
      this.target_pos = target;
      this.initial_pos = [target[0] - 8, target[1] + 8, target[2]];
    }
  }

  easeOutCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3);
  }

  animate(viewer: ModelViewer, progress: number) {
    if (progress > this.length) return;
    const pr = progress / this.length;
    const easedProgress = this.easeOutCubic(pr);

    viewer.camera.position.set(
      ...(this.initial_pos.map(
        (x, i) => x + (this.target_pos[i] - x) * easedProgress,
      ) as Vector3Array),
    );
  }
}

export class ExitAnimation extends ModelAnimation {
  initial_pos!: Vector3Array;
  target_pos!: Vector3Array;
  length = 2;

  initial_progress?: number;

  constructor(initial_pos: Vector3Array, target?: Vector3Array) {
    super();
    const target_scale = initial_pos.map(i => Math.abs(i));
    this.initial_pos = initial_pos;
    this.target_pos = target ?? [
      initial_pos[0] - 2 * target_scale[0],
      initial_pos[1] + 2 * target_scale[1],
      initial_pos[2],
    ];
  }

  easeOutCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3);
  }

  animate(viewer: ModelViewer, progress: number) {
    if (this.initial_progress === undefined) this.initial_progress = progress;
    const norm_progress = progress - this.initial_progress;
    if (norm_progress > this.length) return;

    const pr = norm_progress / this.length;
    const easedProgress = this.easeOutCubic(pr);

    viewer.camera.position.set(
      ...(this.initial_pos.map(
        (x, i) => x + (this.target_pos[i] - x) * easedProgress,
      ) as Vector3Array),
    );
  }
}
