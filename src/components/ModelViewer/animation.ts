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

  constructor(target?: [number, number, number]) {
    super();
    if (target) {
      this.target_pos = target;
      this.initial_pos = [target[0] - 0.2, target[1] + 0.4, target[2] + 0.5];
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
