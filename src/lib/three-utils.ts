'use client';

import { Group, Material, Mesh, Object3D, Object3DEventMap } from 'three';

export function disposeGLTFScene(scene: Group<Object3DEventMap>) {
  scene.traverse((child: Object3D) => {
    if ((child as Mesh).geometry) {
      (child as Mesh).geometry.dispose();
    }
    if ((child as Mesh).material) {
      const material = (child as Mesh).material;
      if (Array.isArray(material)) {
        material.forEach((mat: Material) => {
          disposeMaterial(mat);
        });
      } else {
        disposeMaterial(material);
      }
    }
  });
}

export function disposeMaterial(material: Material) {
  // TypeScript doesn't know about all material properties, so we use type assertion
  const mat = material as Material & {
    map?: { dispose: () => void };
    lightMap?: { dispose: () => void };
    bumpMap?: { dispose: () => void };
    normalMap?: { dispose: () => void };
    specularMap?: { dispose: () => void };
    envMap?: { dispose: () => void };
    alphaMap?: { dispose: () => void };
    aoMap?: { dispose: () => void };
    displacementMap?: { dispose: () => void };
    emissiveMap?: { dispose: () => void };
    gradientMap?: { dispose: () => void };
    metalnessMap?: { dispose: () => void };
    roughnessMap?: { dispose: () => void };
  };

  if (mat.map) mat.map.dispose();
  if (mat.lightMap) mat.lightMap.dispose();
  if (mat.bumpMap) mat.bumpMap.dispose();
  if (mat.normalMap) mat.normalMap.dispose();
  if (mat.specularMap) mat.specularMap.dispose();
  if (mat.envMap) mat.envMap.dispose();
  if (mat.alphaMap) mat.alphaMap.dispose();
  if (mat.aoMap) mat.aoMap.dispose();
  if (mat.displacementMap) mat.displacementMap.dispose();
  if (mat.emissiveMap) mat.emissiveMap.dispose();
  if (mat.gradientMap) mat.gradientMap.dispose();
  if (mat.metalnessMap) mat.metalnessMap.dispose();
  if (mat.roughnessMap) mat.roughnessMap.dispose();
  material.dispose();
}
