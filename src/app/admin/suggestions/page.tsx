'use client';

import { useState } from 'react';
import { MoveBack } from '@/components/Admin/MoveBack';
import { getAssetUrl } from '@/lib/api/api';
import {
  deleteSuggestion,
  getAllSuggestions,
  SuggestionType,
} from '@/lib/api/suggestions';
import { formatDateHuman } from '@/lib/time';
import Link from 'next/link';
import useSWR, { mutate } from 'swr';
import Image from 'next/image';
import ImageModal from '@/components/PackMod/ImageModal';

import styles from '@/styles/Admin/suggestions/page.module.css';
import { IconBulb, IconTrash } from '@tabler/icons-react';

const Suggestion = ({ suggestion }: { suggestion: SuggestionType }) => {
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});

  const allImages = suggestion.images.map(img => getAssetUrl(img.resource_id));

  const openModal = (imagePath: string) => {
    const index = allImages.indexOf(imagePath);
    if (index !== -1) {
      setCurrentImageIndex(index);
      setModalImage(imagePath);
    }
  };

  const closeModal = () => {
    setModalImage(null);
  };

  const handleNavigate = (index: number) => {
    setCurrentImageIndex(index);
    setModalImage(allImages[index]);
  };

  const deleteSugg = () => {
    if (!confirm('Удалить?')) return;
    deleteSuggestion(suggestion.id)
      .then(() => mutate('suggestions'))
      .catch(err => alert(err.message));
  };

  return (
    <div className={styles.suggestion}>
      <h3 className={styles.header}>
        <span className={styles.header_inner}>
          <IconBulb />
          Предложение от{' '}
          {formatDateHuman(new Date(suggestion.created_at), true)}
        </span>
        <IconTrash className={styles.delete_btn} onClick={deleteSugg} />
      </h3>
      <p className={styles.author}>
        <b>Автор</b>: {suggestion.nickname}
      </p>
      <p className={styles.content}>{suggestion.content}</p>

      {suggestion.images.length !== 0 && (
        <div>
          <hr />
          <h3 className={styles.pinned_sth}>Прикрепленные изображения</h3>
          <div className={styles.images}>
            {suggestion.images.map((image, i) => {
              const imageKey = `image-${i}`;
              const imagePath = getAssetUrl(image.resource_id);

              return (
                <div
                  key={i}
                  onClick={() => openModal(imagePath)}
                  className={styles.imageWrapper}
                >
                  <Image
                    src={imagePath}
                    alt={`Изображение ${i + 1}`}
                    width={400}
                    height={300}
                    className={`${styles.image} ${imageLoaded[imageKey] ? styles.imageLoaded : ''}`}
                    quality={90}
                    onLoad={() =>
                      setImageLoaded(prev => ({ ...prev, [imageKey]: true }))
                    }
                  />
                  <div className={styles.imageOverlay}>
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </div>
                </div>
              );
            })}
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

      <ImageModal
        isOpen={!!modalImage}
        imageSrc={modalImage || ''}
        onClose={closeModal}
        allImages={allImages}
        currentIndex={currentImageIndex}
        onNavigate={handleNavigate}
      />
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
        {data.length === 0 && <span>Похоже, тут ничего нет</span>}
        {data.map((s, i) => (
          <Suggestion key={i} suggestion={s} />
        ))}
      </div>
    </main>
  );
};

export default Suggestions;
