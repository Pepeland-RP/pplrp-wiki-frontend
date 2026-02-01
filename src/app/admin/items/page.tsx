'use client';

import { MinecraftItemCard } from '@/components/Admin/items/MinecraftItemCard';
import { MoveBack } from '@/components/Admin/MoveBack';
import { getMinecraftItems } from '@/lib/api/admin';
import styles from '@/styles/Admin/items/page.module.css';
import useSWR from 'swr';

const Items = () => {
  const { data } = useSWR('minecraftItems', getMinecraftItems);

  if (!data) return;
  return (
    <main className={styles.main}>
      <h2>Предметы Minecraft</h2>
      <MoveBack />
      <div className={styles.container}>
        <MinecraftItemCard key="create" create />
        {data.map(data => (
          <MinecraftItemCard key={data.id} data={data} />
        ))}
      </div>
    </main>
  );
};

export default Items;
