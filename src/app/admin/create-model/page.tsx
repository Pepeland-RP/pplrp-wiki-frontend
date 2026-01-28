'use client';

import MinecraftItemsSelect from '@/components/Admin/create/MinecraftItemsSelect';
import { ModelSettings } from '@/components/Admin/create/Model';
import { MoveBack } from '@/components/Admin/MoveBack';
import SeasonSelector from '@/components/Admin/SeasonSelector';
import { createModel, getFilters } from '@/lib/api';
import styles from '@/styles/Admin/create/page.module.css';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import useSWR from 'swr';

const Create = () => {
  const router = useRouter();
  const [season, setSeason] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [meta, setMeta] = useState<object | null>(null);
  const [items, setItems] = useState<number[]>([]);
  const [gltf, setGltf] = useState<File | null>(null);

  const [name, setName] = useState<string>('');

  const { data: filters, isLoading: filtersLoading } = useSWR(
    'filters',
    async () => getFilters(),
  );

  const create = () => {
    if (!gltf || !name || !season) return;
    createModel(gltf, name, season, items, categories, JSON.stringify(meta))
      .then(() => router.push('/admin'))
      .catch(e => alert(e.message));
  };

  return (
    <main className={styles.container}>
      <h2>Новая модель</h2>
      <MoveBack />
      <div className={styles.container_container}>
        <ModelSettings
          onChange={e => {
            setGltf(e.model);
            setMeta(e.meta);
          }}
        />
        <div className={styles.right_container}>
          <i>Название модели</i>
          <input
            type="text"
            maxLength={50}
            value={name}
            onChange={e => setName(e.target.value)}
            className={styles.name_input}
            placeholder="Название модели..."
          />
          <i>Сезон</i>
          <SeasonSelector
            defaultValue={[]}
            existedList={filters?.seasons.map(c => c.name) ?? []}
            onChange={e => setSeason(e.at(0)!)}
            loading={filtersLoading}
          />
          <i>Категории</i>
          <SeasonSelector
            defaultValue={[]}
            existedList={filters?.categories.map(c => c.name) ?? []}
            onChange={setCategories}
            loading={filtersLoading}
            isMulti
          />
          <i>Предметы и броня Minecraft</i>
          <MinecraftItemsSelect onChange={setItems} />

          <button onClick={create} className={styles.create_button}>
            Создать
          </button>
        </div>
      </div>
    </main>
  );
};

export default Create;
