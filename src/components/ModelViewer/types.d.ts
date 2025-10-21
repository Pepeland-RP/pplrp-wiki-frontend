interface ModelViewerProps {
  gltf_path: string;
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

interface ModelViewerDialogProps {
  invoke: (url: string) => void;
}
