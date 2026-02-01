'use client';

import { useState, useRef, useEffect } from 'react';
import { IconDownload, IconChevronDown } from '@tabler/icons-react';
import ModrinthLogo from '@/resources/modrinth.svg';
import styles from '@/styles/shared/DownloadDropdown.module.css';
import ReactCSSTransition from './CSSTransition';

interface DownloadOption {
  label: string;
  icon: React.ReactNode;
  href: string;
}

const options: DownloadOption[] = [
  {
    label: 'Modrinth',
    icon: <ModrinthLogo width={20} height={20} />,
    href: 'https://modrinth.com/resourcepack/pepelandrp',
  },
  {
    label: 'Зеркало',
    icon: <IconDownload size={20} />,
    href: 'https://pepeland.net/wiki/game/resourcepack',
  },
];

export default function DownloadDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <IconDownload className={styles.icon_download} />
        Скачать пак
        <IconChevronDown
          size={18}
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
        />
      </button>

      <ReactCSSTransition
        state={isOpen}
        timeout={200}
        classNames={{
          exitActive: styles.menu_exit_active,
        }}
      >
        <div className={styles.menu}>
          {options.map((option, index) => (
            <a
              key={index}
              href={option.href}
              className={styles.option}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
            >
              {option.icon}
              {option.label}
            </a>
          ))}
        </div>
      </ReactCSSTransition>
    </div>
  );
}
