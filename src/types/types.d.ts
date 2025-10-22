interface ModelViewerProps {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  renderPaused?: boolean;
}

interface ModelViewerDialogProps {
  invoke: (data: GLTFData) => void;
  hide: () => void;
}

interface Model {
  id: number;
  name: string;
  season: {
    name: string;
    icon: string | null;
  } | null;
  acceptable_items: {
    name: string;
    texture_id: string;
  }[];
  gltf: GLTFData | null;
}

interface GLTFData {
  resource_id: string;
  meta: GLTFMeta | null;
}

/**
 * По задумке, meta должна содержать инфу о том, как и куда рендерить модель
 * А задаваться она будет из админки через интерактивный редактор
 */
interface GLTFMeta {
  render?: {
    camera_position?: [number, number, number];
    controls_target?: [number, number, number];
  };
}
