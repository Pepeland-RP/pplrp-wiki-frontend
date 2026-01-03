interface ModelViewerProps {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  renderPaused?: boolean;
  panoramaUrl?: string;
  renderDoubleSide?: boolean;
}

interface ModelViewerDialogProps {
  invoke: (data: Model) => void;
  hide: () => void;
}

interface ModelResponse {
  data: Model[];
  total_count: number;
}

interface Model {
  id: number;
  name: string;
  /** Сезон это то, что отображается сверху карточки (постоянные, хэллоуин) */
  season: {
    name: string;
    icon: string | null;
  } | null;
  /** Категория это костюм, тотем и тд */
  category: { name: string }[];
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
    double_sided?: boolean;
  };
}

interface AdminUserType {
  user_id: number;
  login: string;
  permissions_mask: number;
}
