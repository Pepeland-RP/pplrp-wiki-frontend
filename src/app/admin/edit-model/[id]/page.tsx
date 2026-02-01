'use client';

import { ModelSettings } from '@/components/Admin/create/Model';
import { MoveBack } from '@/components/Admin/MoveBack';
import styles from '@/styles/Admin/create/page.module.css';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import SeasonSelector from '@/components/Admin/SeasonSelector';
import MinecraftItemsSelect from '@/components/Admin/create/MinecraftItemsSelect';
import {
  deleteModel,
  editModel,
  getFilters,
  getModelById,
} from '@/lib/api/models';

const Page = () => {
  const router = useRouter();
  const [season, setSeason] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [meta, setMeta] = useState<object | null>(null);
  const [items, setItems] = useState<number[]>([]);
  const [gltf, setGltf] = useState<File | null>(null);
  const [acceptable, setAcceptable] = useState<boolean>(false);
  const [name, setName] = useState<string>('');

  const params = useParams<{ id: string }>();
  const { data } = useSWR(
    `model-${params.id}`,
    async () => await getModelById(params.id),
  );

  const { data: filters, isLoading: filtersLoading } = useSWR(
    'filters',
    async () => getFilters(),
  );

  useEffect(() => {
    if (!data) return;

    setName(data.name);
    setSeason(data.season?.name ?? null);
    setCategories(data.category.map(i => i.name));
    setItems(data.acceptable_items.map(i => i.id));
    setMeta(data.gltf?.meta ?? {});
  }, [data]);

  const save = () => {
    if (!data || !gltf || !season || !name) return;

    editModel(
      data.id,
      gltf,
      name,
      season,
      items,
      categories,
      JSON.stringify(meta),
    )
      .then(() => router.push('/models'))
      .catch(e => alert(e.message));
  };

  const del = () => {
    if (!confirm('Удалить модель?')) return;
    deleteModel(data!.id.toString())
      .then(() => router.push('/models'))
      .catch(e => alert(e.message));
  };

  useEffect(() => {
    setAcceptable(!!gltf && name.length !== 0 && !!season);
  }, [gltf, name, season]);

  if (!data) return undefined;
  return (
    <main className={styles.container}>
      <h2>Редактирование модели</h2>
      <MoveBack />
      <div className={styles.container_container}>
        <div>
          <ModelSettings
            model={data}
            onChange={e => {
              setGltf(e.model);
              setMeta(e.meta);
            }}
          />
          <button
            className={`${styles.create_button} ${styles.delete_button}`}
            onClick={del}
          >
            Удалить модель
          </button>
        </div>
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
            defaultValue={data.season?.name ? [data.season!.name] : []}
            existedList={filters?.seasons.map(c => c.name) ?? []}
            onChange={e => setSeason(e.at(0)!)}
            loading={filtersLoading}
          />
          <i>Категории</i>
          <SeasonSelector
            defaultValue={data.category.map(i => i.name)}
            existedList={filters?.categories.map(c => c.name) ?? []}
            onChange={setCategories}
            loading={filtersLoading}
            isMulti
          />
          <i>Предметы и броня Minecraft</i>
          <MinecraftItemsSelect
            onChange={setItems}
            defaultValue={data.acceptable_items.map(i => i.id)}
          />

          <button
            className={styles.create_button}
            onClick={save}
            disabled={!acceptable}
          >
            Сохранить
          </button>
        </div>
      </div>
    </main>
  );
};

export default Page;
