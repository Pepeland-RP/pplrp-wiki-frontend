import { ModelAnimation } from '@/components/ModelViewer/animation';
import { ModelViewer } from '@/components/ModelViewer/ModelViewer';

export class PepeTargetAnimation extends ModelAnimation {
  static defaultCameraPos: [number, number, number] = [-7.27, 2.57, -13.6];
  private lastTime = 0;

  private rotationY = 0;
  private cameraYOffset = 0;

  private targetRotationY = 0;
  private targetCameraYOffset = 0;

  private speed = 8;

  setMouseOffset(
    offsetX: number,
    offsetY: number,
    scaleX: number,
    scaleY: number,
  ) {
    this.targetRotationY = offsetX * scaleX;
    this.targetCameraYOffset = offsetY * scaleY;
  }

  animate(viewer: ModelViewer, elapsed: number) {
    const delta = elapsed - this.lastTime;
    this.lastTime = elapsed;

    // Считаем, что более 500мс между кадрами - это много
    if (delta > 0.5) return;

    const rotDelta = this.targetRotationY - this.rotationY;
    const rotVelocity = rotDelta * this.speed;
    const rotDeltaSpeed = rotVelocity * delta;
    this.rotationY += Math.abs(rotDeltaSpeed) >= 0.000001 ? rotDeltaSpeed : 0;

    const camDelta = this.targetCameraYOffset - this.cameraYOffset;
    const camVelocity = camDelta * this.speed;
    const camDeltaVelocity = camVelocity * delta;
    this.cameraYOffset +=
      Math.abs(camDeltaVelocity) >= 0.000001 ? camDeltaVelocity : 0;

    if (viewer.gltf) {
      viewer.gltf.rotation.y = this.rotationY;
    }

    viewer.camera.position.y =
      PepeTargetAnimation.defaultCameraPos[1] + this.cameraYOffset;
  }
}
