import styles from '@/styles/Models/models.module.css';
import { StaticTooltip } from '../shared/Tooltip';
import Image from 'next/image';
import { getAssetUrl } from '@/lib/api';

export const ModelIcon = (props: Model['acceptable_items'][0]) => {
  return (
    <StaticTooltip
      title={props.name}
      tooltip_styles={{ minWidth: 'max-content' }}
    >
      <Image
        src={getAssetUrl(props.texture_id)}
        alt={props.name}
        width={32}
        height={32}
        className={styles.model_icon}
      />
    </StaticTooltip>
  );
};
