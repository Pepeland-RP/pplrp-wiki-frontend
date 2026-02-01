import styles from '@/styles/Models/models.module.css';
import { StaticTooltip } from '../shared/Tooltip';
import { getAssetUrl } from '@/lib/api/api';

export const ModelIcon = (props: Model['acceptable_items'][0]) => {
  return (
    <StaticTooltip title={props.name}>
      <img
        src={getAssetUrl(props.texture_id)}
        alt={props.name}
        className={styles.model_icon}
      />
    </StaticTooltip>
  );
};
