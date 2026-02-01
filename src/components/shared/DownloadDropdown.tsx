'use client';

import { useState, useRef, useEffect } from 'react';
import { IconDownload, IconChevronDown } from '@tabler/icons-react';
import ModrinthLogo from '@/resources/modrinth.svg';
import styles from '@/styles/shared/DownloadDropdown.module.css';

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
          return () =>
               document.removeEventListener('mousedown', handleClickOutside);
     }, []);

     return (
          <div className={styles.dropdown} ref={dropdownRef}>
               <button
                    className={styles.trigger}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
               >
                    <IconDownload size={20} />
                    Скачать пак
                    <IconChevronDown
                         size={18}
                         className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                    />
               </button>

               {isOpen && (
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
               )}
          </div>
     );
}
