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

    const rotDelta = this.targetRotationY - this.rotationY;
    const rotVelocity = rotDelta * this.speed;
    this.rotationY += rotVelocity * delta;

    const camDelta = this.targetCameraYOffset - this.cameraYOffset;
    const camVelocity = camDelta * this.speed;
    this.cameraYOffset += camVelocity * delta;

    if (viewer.gltf) {
      viewer.gltf.rotation.y = this.rotationY;
    }

    viewer.camera.position.y =
      PepeTargetAnimation.defaultCameraPos[1] + this.cameraYOffset;
  }
}
