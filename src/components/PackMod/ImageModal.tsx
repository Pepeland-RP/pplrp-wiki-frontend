"use client";

import { useState, useEffect } from 'react';
import { IconX, IconChevronLeft, IconChevronRight, IconZoomOut, IconZoomIn, IconArrowsMaximize } from '@tabler/icons-react';

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
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(8px)'
        }}
        onClick={onClose}
      />

      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.8), transparent)',
        padding: '20px 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem', fontWeight: 500 }}>
              {currentIndex + 1} / {allImages.length}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: '8px', padding: '4px' }}>
              <button
                onClick={zoomOut}
                disabled={zoomLevel <= 1}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  cursor: zoomLevel <= 1 ? 'not-allowed' : 'pointer',
                  opacity: zoomLevel <= 1 ? 0.3 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 150ms'
                }}
                title="Уменьшить"
              >
                <IconZoomOut size={20} stroke={2} />
              </button>
              <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem', fontFamily: 'monospace', minWidth: '50px', textAlign: 'center' }}>
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={zoomIn}
                disabled={zoomLevel >= 5}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  cursor: zoomLevel >= 5 ? 'not-allowed' : 'pointer',
                  opacity: zoomLevel >= 5 ? 0.3 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 150ms'
                }}
                title="Увеличить"
              >
                <IconZoomIn size={20} stroke={2} />
              </button>
              <button
                onClick={resetZoom}
                disabled={zoomLevel === 1}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  cursor: zoomLevel === 1 ? 'not-allowed' : 'pointer',
                  opacity: zoomLevel === 1 ? 0.3 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 150ms'
                }}
                title="Сбросить"
              >
                <IconArrowsMaximize size={20} stroke={2} />
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(0, 0, 0, 0.5)',
              color: 'rgba(255, 255, 255, 0.9)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 150ms'
            }}
            title="Закрыть"
          >
            <IconX size={24} stroke={2} />
          </button>
        </div>
      </div>

      {currentIndex > 0 && (
        <button
          onClick={prevImage}
          style={{
            position: 'absolute',
            left: '24px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20,
            padding: '12px 16px',
            borderRadius: '8px',
            border: 'none',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            color: 'rgba(255, 255, 255, 0.9)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'background 150ms'
          }}
          title="Предыдущее"
        >
          <IconChevronLeft size={28} stroke={2} />
        </button>
      )}

      {currentIndex < allImages.length - 1 && (
        <button
          onClick={nextImage}
          style={{
            position: 'absolute',
            right: '24px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20,
            padding: '12px 16px',
            borderRadius: '8px',
            border: 'none',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            color: 'rgba(255, 255, 255, 0.9)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'background 150ms'
          }}
          title="Следующее"
        >
          <IconChevronRight size={28} stroke={2} />
        </button>
      )}

      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '100px 80px 80px',
          cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          style={{
            transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease',
            maxWidth: '100%',
            maxHeight: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            key={imageSrc}
            src={imageSrc}
            alt="Увеличенное изображение"
            style={{
              maxWidth: '90vw',
              maxHeight: '80vh',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              borderRadius: '8px',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
            draggable={false}
          />
        </div>
      </div>

      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)',
        padding: '20px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {allImages.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                onNavigate(index);
                resetZoom();
              }}
              style={{
                width: index === currentIndex ? '32px' : '8px',
                height: '8px',
                borderRadius: '4px',
                border: 'none',
                background: index === currentIndex ? '#fff' : 'rgba(255, 255, 255, 0.3)',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 200ms'
              }}
              title={`Изображение ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
