interface ModelViewerProps {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  renderPaused?: boolean;
}

interface ModelViewerDialogProps {
  invoke: (url: string) => void;
  hide: () => void;
}
