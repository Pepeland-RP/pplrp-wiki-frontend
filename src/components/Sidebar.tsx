'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconHexagons,
  IconBulb,
  IconPackage,
  IconDots,
  IconHome,
} from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from '@/styles/Sidebar.module.css';
import PplLogo from '@/resources/ppl-only-logo.svg';
import ModrinthLogo from '@/resources/modrinth.svg';
import BoostyLogo from '@/resources/boosty.svg';

interface NavItem {
  href: string;
  icon: React.ComponentType<{ size?: number; stroke?: number }>;
  label: string;
}

const mainNavItems: NavItem[] = [
  { href: '/', icon: IconHome, label: 'Главная' },
  { href: '/models', icon: IconHexagons, label: 'Модели' },
  { href: '/suggest', icon: IconBulb, label: 'Предложения' },
  { href: '/pack-mod', icon: IconPackage, label: 'Модификация пака' },
];

const externalLinks = [
  {
    href: 'https://modrinth.com/resourcepack/pepelandrp',
    label: 'Modrinth',
    icon: ModrinthLogo,
    size: 20,
  },
  {
    href: 'https://boosty.to/pepelandresourcepack',
    label: 'Boosty',
    icon: BoostyLogo,
    size: 24,
  },
];

function useIsMobile(bp = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp}px)`);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [bp]);

  return isMobile;
}

export default function Sidebar() {
  const pathname = usePathname();
  const isMobile = useIsMobile(768);

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuWrapRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [menuPos, setMenuPos] = useState<{
    left: number;
    bottom: number;
  } | null>(null);

  const canHover = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  useEffect(() => {
    if (!isMenuOpen) return;

    const onDown = (event: MouseEvent) => {
      const t = event.target as Node;
      const inWrap = menuWrapRef.current?.contains(t);
      const inMobileDropdown = (t as HTMLElement | null)?.closest?.(
        `.${styles.dropdownMobile}`,
      );
      if (!inWrap && !inMobileDropdown) setIsMenuOpen(false);
    };

    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [isMenuOpen, styles.dropdownMobile]);

  useEffect(() => {
    if (!isMobile || !isMenuOpen) return;

    const update = () => {
      const r = menuBtnRef.current?.getBoundingClientRect();
      if (!r) return;
      const left = r.left + r.width / 2;
      const bottom = window.innerHeight - r.top + 8;
      setMenuPos({ left, bottom });
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [isMobile, isMenuOpen]);

  const mobileDropdown =
    mounted && isMobile && isMenuOpen && menuPos
      ? createPortal(
          <div
            className={styles.dropdownMobile}
            style={{ left: menuPos.left, bottom: menuPos.bottom }}
          >
            {externalLinks.map(link => {
              const IconComponent = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.dropdownLink}
                >
                  <div className={styles.dropdownIcon}>
                    <IconComponent
                      width={link.size}
                      height={link.size}
                      style={{ fill: 'currentColor' }}
                    />
                  </div>
                  <span>{link.label}</span>
                </a>
              );
            })}
          </div>,
          document.body,
        )
      : null;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <PplLogo width={32} height={32} />
      </div>

      <nav className={styles.bottomNav}>
        <div className={styles.bottomNavInner}>
          <div className={styles.mainItems}>
            {mainNavItems.map(item => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const hovered = hoveredItem === item.href;

              return (
                <div key={item.href} className={styles.navItemWrapper}>
                  <Link
                    href={item.href}
                    className={`${styles.navButton} ${
                      active ? styles.active : ''
                    }`}
                    onMouseEnter={
                      canHover ? () => setHoveredItem(item.href) : undefined
                    }
                    onMouseLeave={
                      canHover ? () => setHoveredItem(null) : undefined
                    }
                  >
                    <Icon size={24} stroke={1.5} />
                    <span className={styles.navLabel}>{item.label}</span>
                  </Link>

                  {canHover && hovered && !isMobile && (
                    <div
                      className={`${styles.staticTooltip} ${styles.staticTooltipEnter}`}
                    >
                      {item.label}
                      <div className={styles.pointer} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div
            className={`${styles.navItemWrapper} ${styles.menuItem} ${styles.menuCompact}`}
            ref={menuWrapRef}
          >
            <button
              ref={menuBtnRef}
              type="button"
              className={`${styles.navButton} ${styles.menuButton} ${
                isMenuOpen ? styles.active : ''
              }`}
              onClick={() => setIsMenuOpen(v => !v)}
              onMouseEnter={canHover ? () => setHoveredItem('menu') : undefined}
              onMouseLeave={canHover ? () => setHoveredItem(null) : undefined}
              aria-label="Меню"
            >
              <IconDots size={24} stroke={1.5} />
            </button>

            {canHover && hoveredItem === 'menu' && !isMobile && (
              <div
                className={`${styles.staticTooltip} ${styles.staticTooltipEnter}`}
              >
                Меню
                <div className={styles.pointer} />
              </div>
            )}

            {!isMobile && isMenuOpen && (
              <div className={styles.dropdown}>
                {externalLinks.map(link => {
                  const IconComponent = link.icon;
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.dropdownLink}
                    >
                      <div className={styles.dropdownIcon}>
                        <IconComponent
                          width={link.size}
                          height={link.size}
                          style={{ fill: 'currentColor' }}
                        />
                      </div>
                      <span>{link.label}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </nav>

      {mobileDropdown}
    </aside>
  );
}
