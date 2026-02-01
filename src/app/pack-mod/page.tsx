"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ImageModal from '../../components/PackMod/ImageModal';
import CodeBlock from '../../components/PackMod/CodeSyntax';
import styles from '../../styles/PackMod/packmod.module.css';

interface Step {
  title: string;
  description: string[];
  images?: string[];
  code?: string;
}

const steps: Step[] = [
  {
    title: "Расположение файлов",
    description: [
      "Сперва файлы вашего предмета необходимо правильно расположить. Сначала в директории `assets/minecraft/models/item` нужно создать свою папку, в нашем случае будет папка `custom_totem`."
    ],
    images: ["1.png"],
  },
  {
    title: "Создание структуры папок",
    description: [
      "Для удобства организации нескольких предметов рекомендуется создать дополнительные подпапки внутри (например `totem_of_undying`)"
    ],
  },
  {
    title: "Перенос модели и текстуры",
    description: [
      "В папку `assets/minecraft/models/item/custom_totem/totem_of_undying` мы переносим модельку.",
      "И в папку `assets/minecraft/textures/item/custom_totem/totem_of_undying` переносим текстуру."
    ],
    images: ["2.png", "3.png"],
  },
  {
    title: "Корректировка пути текстуры",
    description: [
      "Теперь мы открываем файл модели в Notepad++ или стандартном блокноте и корректируем путь текстуры.",
      "Обязательно убедитесь в верном пути текстуры:"
    ],
    code: `{
    "format_version": "1.21.6",
  "credit": "Made with Blockbench",
  "textures": {
   "1": "item/custom_totem/totem_of_undying/pooshka",
   "particle": "item/custom_totem/totem_of_undying/pooshka"
  },
  "elements": [
   {
    "from": [6, 4, 6.5],
    "to": [10, 8, 10.5],
  ...
      }
    ]
}`,
    images: ["5.png"],
  },
  {
    title: "Поиск файла предмета",
    description: [
      "Теперь заходим в `assets/minecraft/items` и ищем нужный файл, в данном случае тотем бессмертия.",
      "Открываем файл и задаём своей модельке параметр custom_model_data, в нашем примере «пушка»"
    ],
    code: `{
  "when": "пушка",
  "model": {
   "type": "minecraft:model",
   "model": "minecraft:item/custom_totem/totem_of_undying/pooshka"
}`,
  },
  {
    title: "Создание нового файла",
    description: [
      "Если нужного файла нету, можно создать файл, который должен совпадать с id предмета.",
      "Простой пример заменяемого предмета."
    ],
    code: `{
  "model": {
    "type": "select",
    "property": "custom_model_data",
    "fallback": {
      "type": "minecraft:model",
      "model": "minecraft:block/black_stained_glass"
    },
    "cases": [
      {
        "when": "ball",
        "model": {
          "type": "minecraft:model",
          "model": "minecraft:item/pepeland/stained_glass/part_1/black/ball"
        }
      }
    ]
  }
}`,
    images: ["7.png"],
  },
  {
    title: "Итог",
    description: [
      "Проверяем предмет через команду `/custommodel [custom_model_data_предмета]`"
    ],
    images: ["9.png", "10.png"],
  }
];

const allImages: string[] = [];
steps.forEach(step => {
  if (step.images && step.images.length > 0) {
    step.images.forEach(img => allImages.push(`/guide/${img}`));
  }
});

export default function PackMod() {
  const [activeTocItem, setActiveTocItem] = useState(0);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]');
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollPosition + windowHeight >= documentHeight - 50) {
        setActiveTocItem(sections.length - 1);
        return;
      }

      let currentIndex = 0;
      sections.forEach((section, index) => {
        const sectionTop = (section as HTMLElement).offsetTop - 200;

        if (scrollPosition >= sectionTop) {
          currentIndex = index;
        }
      });

      setActiveTocItem(currentIndex);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const scrollToSection = (index: number) => {
    const section = document.querySelector(`[data-section="${index}"]`);
    if (section) {
      const offset = 100;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const renderText = (text: string) => {
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className={styles.code}>
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarContent}>
          <h3 className={styles.sidebarTitle}>Содержание</h3>
          <nav className={styles.sidebarNav}>
            {steps.map((step, index) => (
              <button
                key={index}
                onClick={() => scrollToSection(index)}
                className={`${styles.sidebarItem} ${activeTocItem === index ? styles.sidebarItemActive : ''}`}
              >
                <span className={styles.sidebarNumber}>{index + 1}</span>
                <span className={styles.sidebarText}>{step.title}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.content}>
          <header className={styles.header}>
            <h1 className={styles.mainTitle}>
              Гайд на добавление своих предметов в пак Пепеленда
            </h1>
            <p className={styles.mainDescription}>
              Итак, у вас есть моделька и текстура предмета, который вы хотите добавить в пак:
            </p>
          </header>

          <div className={styles.steps}>
            {steps.map((step, index) => (
              <section
                key={index}
                data-section={index}
                className={styles.step}
              >
                <div className={styles.stepContent}>
                  <h2 className={styles.stepTitle}>
                    <span className={styles.stepNumber}>{index + 1}</span>
                    {step.title}
                  </h2>

                  <div className={styles.stepDescription}>
                    {step.description.map((desc, i) => (
                      <p key={i}>{renderText(desc)}</p>
                    ))}
                  </div>

                  {step.code && (
                    <CodeBlock code={step.code} />
                  )}

                  {step.images && step.images.length > 0 && (
                    <div className={styles.images}>
                      {step.images.map((img, imgIndex) => {
                        const imageKey = `${index}-${imgIndex}`;
                        const imagePath = `/guide/${img}`;

                        return (
                          <div
                            key={imgIndex}
                            onClick={() => openModal(imagePath)}
                            className={styles.imageWrapper}
                          >
                            <Image
                              src={imagePath}
                              alt={`Шаг ${index + 1} - изображение ${imgIndex + 1}`}
                              width={1200}
                              height={800}
                              className={`${styles.image} ${imageLoaded[imageKey] ? styles.imageLoaded : ''}`}
                              quality={90}
                              onLoad={() => setImageLoaded(prev => ({ ...prev, [imageKey]: true }))}
                              loading="lazy"
                            />
                            <div className={styles.imageOverlay}>
                              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

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
}
