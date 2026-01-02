'use client';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {
  EffectComposer,
  OrbitControls,
  RenderPass,
  ShaderPass,
} from 'three/examples/jsm/Addons.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import {
  Box3,
  Clock,
  DepthTexture,
  EquirectangularReflectionMapping,
  FloatType,
  GridHelper,
  Group,
  Object3DEventMap,
  OrthographicCamera,
  PerspectiveCamera,
  Scene,
  Texture,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { ModelAnimation } from './animation';
import { disposeGLTFScene } from '@/lib/three-utils';
import {
  applyMinecraftShaderToGLTF,
  type MinecraftLightingConfig,
} from '@/lib/shaders/apply-minecraft-shader';

const AsyncImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

export class ModelViewer {
  gltf: Group<Object3DEventMap> | null = null;

  /** Scene object */
  scene!: Scene;

  /** Three js renderer object */
  renderer!: WebGLRenderer;

  /** Camera!!! */
  camera!: OrthographicCamera;

  /** Render canvas ref */
  canvas!: HTMLCanvasElement;

  /** GLTF object with Minecraft shader applied */
  object!: Group<Object3DEventMap>;
  controls!: OrbitControls;

  /** Minecraft lighting configuration */
  minecraftLightingConfig: MinecraftLightingConfig;

  renderPaused: boolean = false;

  renderPass!: RenderPass;
  fxaaPass!: ShaderPass;
  composer!: EffectComposer;

  grid!: GridHelper;

  private frameId: number | undefined;
  private progress: number = 0;
  private clock: Clock;
  private renderTarget?: WebGLRenderTarget;

  private skyScene: Scene | null = null;
  private skyCamera: PerspectiveCamera | null = null;
  private backgroundTexture: Texture | null = null;

  animation?: ModelAnimation;

  constructor(props: ModelViewerProps) {
    this.clock = new Clock();

    this.canvas = props.canvas;
    this.canvas.width = props.width;
    this.canvas.height = props.height;
    this.renderPaused = props.renderPaused === true;

    this.scene = new Scene();
    const aspect = props.width / props.height;
    const frustumSize = 1;

    this.camera = new OrthographicCamera(
      (-frustumSize * aspect) / 2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      -frustumSize / 2,
      -2000,
      2000,
    );

    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(props.width, props.height);
    this.scene.add(this.camera);

    if (props.panoramaUrl) {
      this.skyScene = new Scene();
      this.skyCamera = new PerspectiveCamera(
        75,
        this.canvas.width / this.canvas.height,
        0.1,
        10,
      );
      this.skyCamera.position.set(0, 0, 0);

      if (props.panoramaUrl) {
        if (this.backgroundTexture != null) {
          this.backgroundTexture.dispose();
        }

        AsyncImage(props.panoramaUrl).then(image => {
          this.backgroundTexture = new Texture();
          this.backgroundTexture.image = image;
          this.backgroundTexture.mapping = EquirectangularReflectionMapping;
          this.backgroundTexture.needsUpdate = true;
          this.skyScene!.background = this.backgroundTexture;
        });
      }
    }

    this.minecraftLightingConfig = {
      textureSide: props.renderDoubleSide ? 2 : 0,
    };

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    if (this.renderer.capabilities.isWebGL2) {
      this.renderTarget = new WebGLRenderTarget(
        this.canvas.width,
        this.canvas.height,
        {
          depthTexture: new DepthTexture(
            this.canvas.width,
            this.canvas.height,
            FloatType,
          ),
        },
      );
    }

    // Some composer things
    this.composer = new EffectComposer(this.renderer, this.renderTarget);
    this.renderPass = new RenderPass(this.scene, this.camera);
    if (this.skyScene && this.skyCamera) {
      const rr = new RenderPass(this.skyScene, this.skyCamera);
      this.composer.addPass(rr);
      this.renderPass.clear = false;
    }

    this.fxaaPass = new ShaderPass(FXAAShader);
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.fxaaPass);

    this.grid = new GridHelper(1, 10, '#ffffff', '#aaaaaa');
    this.scene.add(this.grid);

    this.render = this.render.bind(this);
  }

  setGltf(object: Group<Object3DEventMap>, update: boolean = true) {
    if (this.object) {
      disposeGLTFScene(this.object);
      this.scene.remove(this.object);
    }

    this.object = object;
    applyMinecraftShaderToGLTF(this.object, this.minecraftLightingConfig);
    this.object.updateWorldMatrix(true, true);

    const box = new Box3().setFromObject(this.object);
    const size = new Vector3();
    const center = new Vector3();
    box.getSize(size);
    box.getCenter(center);

    this.object.position.sub(center);
    this.grid.position.y -= size.y / 2;

    const maxDim = Math.max(size.x, size.y, size.z);
    const padding = 1.7;

    const aspect = this.canvas.width / this.canvas.height;
    const frustumSize = maxDim * padding;

    this.camera.left = (-frustumSize * aspect) / 2;
    this.camera.right = (frustumSize * aspect) / 2;
    this.camera.top = frustumSize / 2;
    this.camera.bottom = -frustumSize / 2;

    this.camera.near = -1000;
    this.camera.far = 1000;

    const isoDistance = 10;
    this.camera.position.set(-isoDistance, isoDistance / 1.5, -isoDistance);

    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();

    if (update) {
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    }

    this.scene.add(this.object);
    this.render();
  }

  async loadGLTF(path: string, should_center?: boolean) {
    this.gltf = (await new GLTFLoader().loadAsync(path)).scene;
    this.setGltf(this.gltf, should_center);
  }

  render() {
    this.progress += this.clock.getDelta();
    if (this.animation) this.animation.animate(this, this.progress);

    this.controls.update();
    if (this.skyCamera) {
      this.skyCamera.position.copy(this.camera.position);
      this.skyCamera.lookAt(this.controls.target);
    }

    this.renderer.autoClear = false;
    this.renderer.clear();
    this.renderer.clearDepth();

    this.composer.render();
    if (!this.renderPaused) {
      this.frameId = requestAnimationFrame(this.render);
    }
  }

  /** Proper dispose all components */
  dispose() {
    if (this.frameId) cancelAnimationFrame(this.frameId);

    if (this.object) {
      disposeGLTFScene(this.object);
      this.scene.remove(this.object);
    }

    this.scene.remove(this.camera);
    this.scene.remove(this.grid);

    this.grid.dispose();

    this.controls.dispose();

    this.renderPass.dispose?.();
    this.fxaaPass.dispose?.();
    this.composer.dispose();

    if (this.renderTarget) {
      if (this.renderTarget.depthTexture) {
        this.renderTarget.depthTexture.dispose();
      }
      this.renderTarget.dispose();
    }

    this.renderer.dispose();
    this.renderer.forceContextLoss?.();
  }

  /** Sets render size */
  setSize(w: number, h: number) {
    const aspect = w / h;

    if (this.skyCamera) {
      this.skyCamera.aspect = aspect;
      this.skyCamera.updateProjectionMatrix();
    }

    const frustumHeight = this.camera.top - this.camera.bottom;
    const frustumWidth = frustumHeight * aspect;

    this.camera.left = -frustumWidth / 2;
    this.camera.right = frustumWidth / 2;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(w, h);

    this.composer.setSize(w, h);
    const pixelRatio = this.renderer.getPixelRatio();
    this.composer.setPixelRatio(pixelRatio);

    this.fxaaPass.material.uniforms.resolution.value.set(
      1 / (w * pixelRatio),
      1 / (h * pixelRatio),
    );
  }

  set renderDoubleSided(state: boolean) {
    this.minecraftLightingConfig = {
      textureSide: state ? 2 : 0,
    };
  }
}
