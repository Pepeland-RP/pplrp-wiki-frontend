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
  DoubleSide,
  EquirectangularReflectionMapping,
  FloatType,
  FrontSide,
  GridHelper,
  Group,
  Mesh,
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
import { applyMinecraftShaderToGLTF } from '@/lib/shaders/apply-minecraft-shader';
import { AsyncImage } from '@/lib/AsyncImage';

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

  renderPaused: boolean = false;

  renderPass!: RenderPass;
  fxaaPass!: ShaderPass;
  composer!: EffectComposer;

  grid!: GridHelper;

  private frameId: number | undefined;
  progress: number = 0;
  private clock: Clock;
  private renderTarget?: WebGLRenderTarget;

  private skyScene: Scene | null = null;
  private skyCamera: PerspectiveCamera | null = null;
  private backgroundTexture: Texture | null = null;
  private doubleSided: boolean = false;

  animation?: ModelAnimation;

  constructor(props: ModelViewerProps) {
    this.clock = new Clock();

    this.canvas = props.canvas;
    this.canvas.width = props.width;
    this.canvas.height = props.height;
    this.renderPaused = props.renderPaused === true;
    this.doubleSided = props.renderDoubleSide ?? false;

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
    this.renderer.setPixelRatio(1);
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

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableRotate = true;
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

    this.grid = new GridHelper(1, 16, '#ffffff', '#aaaaaa');
    this.scene.add(this.grid);

    this.render = this.render.bind(this);
  }

  setGltf(object: Group<Object3DEventMap>, center: boolean = true) {
    if (this.object) {
      disposeGLTFScene(this.object);
      this.scene.remove(this.object);
    }

    this.object = object;
    applyMinecraftShaderToGLTF(this.object);

    if (center) this.centerModel();
    this.setDoubleSided(this.doubleSided);
    this.scene.add(this.object);
  }

  centerModel() {
    if (!this.object) return;
    this.object.updateWorldMatrix(true, true);

    const box = new Box3().setFromObject(this.object);
    const size = new Vector3();
    const center = new Vector3();
    box.getSize(size);
    box.getCenter(center);

    this.object.position.sub(center);
    this.grid.position.y = -size.y / 2;

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
    this.camera.zoom = 1;

    const isoDistance = 10;
    this.camera.position.set(-isoDistance, isoDistance / 1.5, -isoDistance);

    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();

    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  applyMeta(meta: NonNullable<Model['gltf']>['meta']) {
    if (meta?.render?.controls_target) {
      this.controls.target.set(...meta?.render?.controls_target);
    }

    if (meta?.render?.camera_position) {
      this!.camera.position.set(...meta?.render?.camera_position);
    }

    if (meta?.render?.camera_zoom) {
      this.camera.zoom = meta?.render?.camera_zoom;
      this.camera.updateProjectionMatrix();
    }

    this.controls.update();
  }

  gltfLoaderAbort?: () => GLTFLoader;

  async loadGLTF(path: string, should_center?: boolean) {
    try {
      const loader = new GLTFLoader();
      this.gltfLoaderAbort = loader.abort;

      this.gltf = (await loader.loadAsync(path)).scene;
      this.setGltf(this.gltf, should_center);
    } catch (e) {
      throw e;
    } finally {
      this.gltfLoaderAbort = undefined;
    }
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

  setDoubleSided(state: boolean) {
    if (!this.object) return;
    this.doubleSided = state;

    this.object.traverse(child => {
      if (child instanceof Mesh) {
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];

        materials.forEach(mat => {
          if (state) {
            const box = new Box3().setFromObject(child);
            const size = new Vector3();
            box.getSize(size);
            const minSize = Math.min(size.x, size.y, size.z);

            mat.side = minSize > 0.5 ? DoubleSide : FrontSide;
          } else {
            mat.side = FrontSide;
          }
        });
      }

      return child;
    });
  }
}
