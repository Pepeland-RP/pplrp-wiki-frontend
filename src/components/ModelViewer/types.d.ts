interface ModelViewerProps {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

interface ModelViewerDialogProps {
  invoke: (url: string) => void;
}
