'use client';

import { MoveBack } from '@/components/Admin/MoveBack';
import { getAssetUrl } from '@/lib/api/api';
import { getAllSuggestions, SuggestionType } from '@/lib/api/suggestions';
import { formatDateHuman } from '@/lib/time';
import Link from 'next/link';
import useSWR from 'swr';

import styles from '@/styles/Admin/suggestions/page.module.css';
import { IconPackage } from '@tabler/icons-react';

const Suggestion = ({ suggestion }: { suggestion: SuggestionType }) => {
  return (
    <div className={styles.suggestion}>
      <h3 className={styles.header}>
        <IconPackage />
        Предложение от {formatDateHuman(new Date(suggestion.created_at), true)}
      </h3>
      <p className={styles.content}>{suggestion.content}</p>

      {/* TODO: Манук, сделай сюда свои превьюшки для картинок крутые */}
      {suggestion.images.length !== 0 && (
        <div>
          <hr />
          <h3 className={styles.pinned_sth}>Прикрепленные изображения</h3>
          <div className={styles.images}>
            {suggestion.images.map((image, i) => (
              <img
                key={i}
                src={getAssetUrl(image.resource_id)}
                alt={i.toString()}
              />
            ))}
          </div>
        </div>
      )}

      {suggestion.links.length !== 0 && (
        <div>
          <hr />
          <h3 className={styles.pinned_sth}>Прикрепленные ссылки</h3>
          <div className={styles.links}>
            {suggestion.links.map((link, i) => (
              <Link href={link} key={i}>
                {link}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Suggestions = () => {
  const { data } = useSWR('suggestions', getAllSuggestions);

  if (!data) return;
  return (
    <main className={styles.main}>
      <h2>Список предложений</h2>
      <MoveBack />
      <div className={styles.cont}>
        {data.map((s, i) => (
          <Suggestion key={i} suggestion={s} />
        ))}
      </div>
    </main>
  );
};

export default Suggestions;
