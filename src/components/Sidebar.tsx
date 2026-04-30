'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconHexagons,
  IconBulb,
  IconPackage,
  IconHome,
  IconSettings,
} from '@tabler/icons-react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import styles from '@/styles/Sidebar.module.css';
import PplLogo from '@/resources/ppl-only-logo.svg';
import BoostyLogo from '@/resources/boosty.svg';
import { useNextCookie } from 'use-next-cookie';
import ReactCSSTransition from '@/components/shared/CSSTransition';

interface NavItem {
  href: string;
  icon: React.ComponentType<{ size?: number; stroke?: number }>;
  label: string;
  admin_only?: boolean;
}

const mainNavItems: NavItem[] = [
  { href: '/', icon: IconHome, label: 'Главная' },
  { href: '/models', icon: IconHexagons, label: 'Модели' },
  { href: '/suggest', icon: IconBulb, label: 'Предложения' },
  {
    href: '/pack-mod',
    icon: IconPackage,
    label: 'Модификация пака',
  },
  {
    href: '/admin',
    icon: IconSettings,
    label: 'Админ-панель',
    admin_only: true,
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
  const logged_in = !!useNextCookie('sessionId', 1000);
  const pathname = usePathname();
  const isMobile = useIsMobile(768);

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const canHover = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

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
              if (item.admin_only && !logged_in) return;

              return (
                <Fragment key={item.href}>
                  <div className={styles.navItemWrapper}>
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

                    {canHover && !isMobile && (
                      <ReactCSSTransition
                        state={hovered}
                        timeout={200}
                        classNames={{
                          exitActive: styles.staticTooltipExitActive,
                        }}
                      >
                        <div className={styles.staticTooltip}>
                          {item.label}
                          <div className={styles.pointer} />
                        </div>
                      </ReactCSSTransition>
                    )}
                  </div>

                  {item.href === '/pack-mod' && (
                    <div
                      key="boosty-sidebar-link"
                      className={styles.navItemWrapper}
                    >
                      <a
                        href="https://boosty.to/pepelandresourcepack"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.navButton}
                        onMouseEnter={
                          canHover
                            ? () =>
                                setHoveredItem(
                                  'https://boosty.to/pepelandresourcepack',
                                )
                            : undefined
                        }
                        onMouseLeave={
                          canHover ? () => setHoveredItem(null) : undefined
                        }
                      >
                        <BoostyLogo
                          width={28}
                          height={28}
                          className={styles.boostyIcon}
                        />
                        <span className={styles.navLabel}>Boosty</span>
                      </a>

                      {canHover && !isMobile && (
                        <ReactCSSTransition
                          state={
                            hoveredItem ===
                            'https://boosty.to/pepelandresourcepack'
                          }
                          timeout={200}
                          classNames={{
                            exitActive: styles.staticTooltipExitActive,
                          }}
                        >
                          <div className={styles.staticTooltip}>
                            Boosty
                            <div className={styles.pointer} />
                          </div>
                        </ReactCSSTransition>
                      )}
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>
      </nav>
    </aside>
  );
}
