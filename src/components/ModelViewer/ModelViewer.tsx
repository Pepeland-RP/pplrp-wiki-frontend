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
  AmbientLight,
  Box3,
  Clock,
  DepthTexture,
  FloatType,
  GridHelper,
  Group,
  Object3DEventMap,
  PerspectiveCamera,
  PointLight,
  Scene,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { ModelAnimation } from './animation';

export class ModelViewer {
  /** Scene object */
  scene!: Scene;

  /** Three js renderer object */
  renderer!: WebGLRenderer;

  /** Camera!!! */
  camera!: PerspectiveCamera;

  /** Render canvas ref */
  canvas!: HTMLCanvasElement;

  /** And... let be light! */
  cameraLight!: PointLight;

  /** Hmm... Can lights be without sun? */
  ambientLight!: AmbientLight;

  object!: Group<Object3DEventMap>;
  controls!: OrbitControls;

  renderPaused: boolean = false;

  renderPass!: RenderPass;
  fxaaPass!: ShaderPass;
  composer!: EffectComposer;

  grid!: GridHelper;

  private frameId: number | undefined;
  private progress: number = 0;
  private clock: Clock;

  animation?: ModelAnimation;

  constructor(props: ModelViewerProps) {
    this.clock = new Clock();

    this.canvas = props.canvas;
    this.canvas.width = props.width;
    this.canvas.height = props.height;

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

    this.cameraLight = new PointLight('#ffffff', 0.6);
    this.camera.add(this.cameraLight);
    this.scene.add(this.camera);

    this.ambientLight = new AmbientLight('#ffffff', 3);
    this.scene.add(this.ambientLight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = true;
    this.controls.enablePan = false;
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    let renderTarget;
    if (this.renderer.capabilities.isWebGL2) {
      renderTarget = new WebGLRenderTarget(
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
    this.composer = new EffectComposer(this.renderer, renderTarget);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.fxaaPass = new ShaderPass(FXAAShader);
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.fxaaPass);

    this.grid = new GridHelper(1, 10, '#ffffff', '#aaaaaa');
    this.scene.add(this.grid);

    this.render = this.render.bind(this);
  }

  setGltf(object: Group<Object3DEventMap>, update: boolean = true) {
    this.object = object;

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
    this.renderer.dispose();
    this.cameraLight.dispose();
    this.ambientLight.dispose();
    this.controls.dispose();
    this.grid.dispose();
    this.composer.dispose();
    this.renderPass.dispose?.();
    this.fxaaPass.dispose?.();
    this.renderer.forceContextLoss?.();
    if (this.frameId) cancelAnimationFrame(this.frameId);
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
