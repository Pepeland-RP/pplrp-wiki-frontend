"use client";

import { useState, useEffect } from 'react';
import { IconX, IconChevronLeft, IconChevronRight, IconZoomOut, IconZoomIn, IconArrowsMaximize } from '@tabler/icons-react';
import styles from '@/styles/PackMod/imagemodal.module.css';

interface ImageModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  allImages: string[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export default function ImageModal({ isOpen, imageSrc, onClose, allImages, currentIndex, onNavigate }: ImageModalProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const resetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 5));

  const zoomOut = () => {
    setZoomLevel(prev => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) setPosition({ x: 0, y: 0 });
      return newZoom;
    });
  };

  const nextImage = () => {
    if (currentIndex < allImages.length - 1) {
      onNavigate(currentIndex + 1);
      resetZoom();
    }
  };

  const prevImage = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
      resetZoom();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      resetZoom();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * -0.001;
      setZoomLevel(prev => Math.max(0.5, Math.min(5, prev + delta)));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
        case '_':
          zoomOut();
          break;
        case '0':
          resetZoom();
          break;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, currentIndex, allImages.length, onClose, onNavigate]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1 && zoomLevel > 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => setIsDragging(false);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />

      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.imageCounter}>
              {currentIndex + 1} / {allImages.length}
            </div>
            <div className={styles.zoomControls}>
              <button
                onClick={zoomOut}
                disabled={zoomLevel <= 1}
                className={styles.zoomButton}
                title="Уменьшить"
              >
                <IconZoomOut size={20} stroke={2} />
              </button>
              <span className={styles.zoomLevel}>
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={zoomIn}
                disabled={zoomLevel >= 5}
                className={styles.zoomButton}
                title="Увеличить"
              >
                <IconZoomIn size={20} stroke={2} />
              </button>
              <button
                onClick={resetZoom}
                disabled={zoomLevel === 1}
                className={styles.zoomButton}
                title="Сбросить"
              >
                <IconArrowsMaximize size={20} stroke={2} />
              </button>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeButton} title="Закрыть">
            <IconX size={24} stroke={2} />
          </button>
        </div>
      </div>

      {currentIndex > 0 && (
        <button
          onClick={prevImage}
          className={`${styles.navButton} ${styles.navButtonLeft}`}
          title="Предыдущее"
        >
          <IconChevronLeft size={28} stroke={2} />
        </button>
      )}

      {currentIndex < allImages.length - 1 && (
        <button
          onClick={nextImage}
          className={`${styles.navButton} ${styles.navButtonRight}`}
          title="Следующее"
        >
          <IconChevronRight size={28} stroke={2} />
        </button>
      )}

      <div
        className={`${styles.imageContainer} ${zoomLevel > 1 ? (isDragging ? styles.dragging : styles.zoomed) : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`${styles.imageWrapper} ${!isDragging ? styles.imageWrapperAnimated : ''}`}
          style={{
            transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`
          }}
        >
          <img
            key={imageSrc}
            src={imageSrc}
            alt="Увеличенное изображение"
            className={styles.image}
            draggable={false}
          />
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.indicators}>
          {allImages.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                onNavigate(index);
                resetZoom();
              }}
              className={`${styles.indicator} ${index === currentIndex ? styles.indicatorActive : ''}`}
              title={`Изображение ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
