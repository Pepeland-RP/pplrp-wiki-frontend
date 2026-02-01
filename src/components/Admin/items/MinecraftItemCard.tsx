'use client';

import { AsyncReader } from '@/lib/AsyncImage';
import { useEffect, useRef, useState } from 'react';
import styles from '@/styles/Admin/items/MinecraftItemCard.module.css';
import { IconDeviceFloppy, IconEdit, IconTrash } from '@tabler/icons-react';
import { mutate } from 'swr';
import { AxiosResponse } from 'axios';
import { getAssetUrl } from '@/lib/api/api';
import { deleteMinecraftItem, updateMinecraftItem } from '@/lib/api/admin';

export const MinecraftItemCard = ({
  data,
  create = false,
}: {
  data?: MinecraftItem;
  create?: boolean;
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState<string>(data?.name ?? '');
  const [internalName, setInternalName] = useState<string>(data?.str_id ?? '');
  const [dirty, setDirty] = useState<boolean>(create ?? false);

  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!data) return;
    (async () => {
      const blob = await fetch(getAssetUrl(data.resource_id)).then(res =>
        res.blob(),
      );
      setImage(await AsyncReader(blob));
    })();
  }, []);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setImage(await AsyncReader(files[0]));
      setDirty(true);
    }
    e.target.value = '';
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const responseValidator = (r: AxiosResponse<any, any, any>) => {
    if (![200, 201].includes(r.status)) {
      alert(r.data.message ?? 'Неизвестная ошибка :(');
    } else {
      setDirty(false);
      mutate('minecraftItems');
      if (create) handleClearStates();
    }
  };

  const handleItemSave = () => {
    if (!image) {
      alert('Сохранение без изображения невозможно!');
      return;
    }

    updateMinecraftItem(
      !!create,
      { name, str_id: internalName },
      image,
      data?.id,
    ).then(responseValidator);
  };

  const handleDeleteItem = () => {
    if (create || !confirm('Удалить?')) return;

    deleteMinecraftItem(data!.id).then(responseValidator);
  };

  const handleClearStates = () => {
    setName('');
    setInternalName('');
    setImage(null);
  };

  return (
    <div className={styles.container_container}>
      <div className={styles.header}>
        <h3>{create ? 'Создать' : `Item #${data!.id}`}</h3>
        <div className={styles.buttons_container}>
          <button disabled={!dirty || !image} onClick={handleItemSave}>
            <IconDeviceFloppy width={18} height={18} />
          </button>
          {!create && (
            <button onClick={handleDeleteItem}>
              <IconTrash width={18} height={18} />
            </button>
          )}
        </div>
      </div>
      <div className={styles.container}>
        <div
          className={styles.image_container}
          onClick={() => {
            imageInputRef.current?.click();
          }}
        >
          {image ? (
            <img
              src={image}
              alt={data?.str_id ?? ''}
              className={styles.image}
            />
          ) : (
            <div className={styles.image_placeholder} />
          )}
          <IconEdit className={styles.edit} width={16} height={16} />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/png"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
        </div>
        <div className={styles.inputs_container}>
          <input
            type="text"
            placeholder="Название"
            value={name}
            onChange={e => {
              setName(e.target.value);
              setDirty(true);
            }}
          />
          <input
            type="text"
            placeholder="Minecraft ID (carved_pumpkin)"
            value={internalName}
            onChange={e => {
              setInternalName(e.target.value);
              setDirty(true);
            }}
          />
        </div>
      </div>
    </div>
  );
};
