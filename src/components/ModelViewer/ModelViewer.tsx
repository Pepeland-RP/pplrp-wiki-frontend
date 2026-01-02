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
  /** Scene object */
  scene!: Scene;

  /** Three js renderer object */
  renderer!: WebGLRenderer;

  /** Camera!!! */
  camera!: PerspectiveCamera;

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
  private backgroundTexture: Texture | null = null;

  animation?: ModelAnimation;

  constructor(props: ModelViewerProps) {
    this.clock = new Clock();

    this.canvas = props.canvas;
    this.canvas.width = props.width;
    this.canvas.height = props.height;

    if (props.panoramaUrl) {
      if (this.backgroundTexture != null) {
        this.backgroundTexture.dispose();
      }

      AsyncImage(props.panoramaUrl).then(image => {
        this.backgroundTexture = new Texture();
        this.backgroundTexture.image = image;
        this.backgroundTexture.mapping = EquirectangularReflectionMapping;
        this.backgroundTexture.needsUpdate = true;
        this.scene.background = this.backgroundTexture;
      });
    }

    this.renderPaused = props.renderPaused === true;

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
      70,
      props.width / props.height,
      0.1,
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

    // Initialize Minecraft lighting configuration
    // All lighting is now handled by shaders, not Three.js lights
    this.minecraftLightingConfig = {
      // Default Minecraft lighting setup will be applied to models
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

    const box = new Box3().setFromObject(this.object);
    const size = new Vector3();
    const center = new Vector3();
    box.getSize(size);
    box.getCenter(center);

    this.object.position.x -= center.x;
    this.object.position.y -= box.min.y;
    this.object.position.z -= center.z;

    if (update) {
      this.controls.target.y = center.y;
    }

    this.scene.add(this.object);
    this.render();
  }

  async loadGLTF(path: string) {
    const gltf = await new GLTFLoader().loadAsync(path);
    this.setGltf(gltf.scene);
  }

  render() {
    //console.log(this.camera.position, this.controls.target);
    this.progress += this.clock.getDelta();
    if (this.animation) this.animation.animate(this, this.progress);

    this.controls.update();
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
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);

    this.composer.setSize(w, h);
    const pixelRatio = this.renderer.getPixelRatio();
    this.composer.setPixelRatio(pixelRatio);
    this.fxaaPass.material.uniforms['resolution'].value.x =
      1 / (w * pixelRatio);
    this.fxaaPass.material.uniforms['resolution'].value.y =
      1 / (h * pixelRatio);
  }
}
