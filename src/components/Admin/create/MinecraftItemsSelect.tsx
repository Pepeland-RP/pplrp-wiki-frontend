import { getAssetUrl, getMinecraftItems } from '@/lib/api';
import Select from 'react-select';
import useSWR from 'swr';
import styles from '@/styles/Admin/create/page.module.css';
import { JSX, useEffect, useState } from 'react';

interface MinecraftItemsSelectProps {
  defaultValue?: number[]; // minecraft items id
  onChange?: (val: number[]) => void;
}

interface Value {
  value: string;
  label: JSX.Element;
}

const MinecraftItemsSelect = (props: MinecraftItemsSelectProps) => {
  const [value, setValue] = useState<Value[]>([]);
  const { data: items, isLoading: itemsLoading } = useSWR('items', async () =>
    getMinecraftItems(),
  );

  const genOption = (c: MinecraftItem) => {
    return {
      value: `${c.name}&${c.id}`,
      label: (
        <span className={styles.minecraftItem}>
          <img
            src={getAssetUrl(c.resource_id)}
            alt={c.name}
            width={16}
            height={16}
          />
          {c.name}
        </span>
      ),
    };
  };

  useEffect(() => {
    if (!items || props.defaultValue === undefined) return;
    setValue(
      items.filter(i => props.defaultValue?.includes(i.id)).map(genOption),
    );
  }, [items]);

  return (
    <Select
      isSearchable
      isMulti
      options={items?.map(genOption) ?? []}
      value={value}
      className="react-select-container"
      classNamePrefix="react-select"
      instanceId="tag-search"
      placeholder="Выберите предметы..."
      onChange={e => {
        props.onChange?.(e.map(i => parseInt(i.value.split('&').at(1)!)));
        setValue(e as Value[]);
      }}
      isLoading={itemsLoading}
    />
  );
};

export default MinecraftItemsSelect;
