'use client';

import { ModelSettings } from '@/components/Admin/create/Model';
import { MoveBack } from '@/components/Admin/MoveBack';
import SeasonSelector from '@/components/Admin/SeasonSelector';
import { getFilters, getMinecraftItems } from '@/lib/api';
import styles from '@/styles/Admin/create/page.module.css';
import { InputActionMeta } from 'react-select';
import Select from 'react-select';
import useSWR from 'swr';

const Create = () => {
  const { data: filters, isLoading: filtersLoading } = useSWR(
    'filters',
    async () => getFilters(),
  );
  const { data: items, isLoading: itemsLoading } = useSWR('items', async () =>
    getMinecraftItems(),
  );

  return (
    <main className={styles.container}>
      <h2>Новая модель</h2>
      <MoveBack />
      <div style={{ display: 'flex', justifyContent: 'start' }}>
        <ModelSettings onChange={console.log} />
        <div>
          <SeasonSelector
            defaultValue={[]}
            existedList={filters?.categories.map(c => c.name) ?? []}
            onChange={console.log}
            loading={filtersLoading}
            isMulti
          />
          <SeasonSelector
            defaultValue={[]}
            existedList={filters?.seasons.map(c => c.name) ?? []}
            onChange={console.log}
            loading={filtersLoading}
          />
          <Select
            isSearchable
            isMulti
            options={items?.map(c => ({ value: c.name, label: c.name })) ?? []}
            className="react-select-container"
            classNamePrefix="react-select"
            instanceId="tag-search"
            placeholder="Выберите предметы..."
            onChange={console.log}
          />
        </div>
      </div>
    </main>
  );
};

export default Create;
