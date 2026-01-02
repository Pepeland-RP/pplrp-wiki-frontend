'use client';

import { useState } from 'react';
import { IconPlus, IconX, IconUpload } from '@tabler/icons-react';
import styles from '@/styles/Suggest/Suggest.module.css';

export default function SuggestPage() {
  const [nickname, setNickname] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>(['']);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      processFiles(files);
    }
  };

  const processFiles = (files: FileList) => {
    setUploadError('');
    const newImages: string[] = [];
    const invalidFiles: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > 25 * 1024 * 1024) {
        invalidFiles.push(file.name);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result as string);
        if (newImages.length + invalidFiles.length === files.length) {
          if (invalidFiles.length > 0) {
            setUploadError(`Файлы превышают максимальный размер 25MB: ${invalidFiles.join(', ')}`);
          }
          if (newImages.length > 0) {
            setImages([...images, ...newImages]);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    if (invalidFiles.length === files.length) {
      setUploadError(`Файлы превышают максимальный размер 25MB`);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddLink = () => {
    setLinks([...links, '']);
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ nickname, suggestion, images, links });
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Предложить идею</h1>
          <p className={styles.subtitle}>
            Опишите модельку, которую хотели бы видеть в ресурспаке
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Ваш ник</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="CyCeKu"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Ваше предложение</label>
              <textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="Опишите костюм, который хотели бы видеть в ресурспаке. Желательно приложить референсы или детальное описание..."
                className={styles.textarea}
                rows={6}
                required
              />
            </div>

            <div className={styles.formGroup}>

              <div className={styles.attachments}>
                <div className={styles.imagesSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>Изображения</span>
                  </div>

                  <div
                    className={`${styles.dropzone} ${isDragging ? styles.dragActive : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('fileInput')?.click()}
                  >
                    <input
                      id="fileInput"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className={styles.fileInput}
                    />
                    <IconUpload size={32} stroke={1.5} className={styles.uploadIcon} />
                    <p className={styles.dropzoneText}>
                      Drop image here or click to upload
                    </p>
                    <p className={styles.dropzoneSubtext}>Max size: 25MB</p>
                  </div>

                  {uploadError && (
                    <p className={styles.errorMessage}>{uploadError}</p>
                  )}

                  {images.length > 0 && (
                    <div className={styles.imageGrid}>
                      {images.map((image, index) => (
                        <div key={index} className={styles.imagePreview}>
                          <img src={image} alt={`Preview ${index + 1}`} />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className={styles.removeButton}
                          >
                            <IconX size={16} stroke={2} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.linksSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>Ссылки</span>
                    <button
                      type="button"
                      onClick={handleAddLink}
                      className={styles.addButton}
                    >
                      <IconPlus size={16} stroke={2} />
                    </button>
                  </div>
                  <div className={styles.linksList}>
                    {links.map((link, index) => (
                      <div key={index} className={styles.linkInput}>
                        <input
                          type="url"
                          value={link}
                          onChange={(e) => handleLinkChange(index, e.target.value)}
                          placeholder="https://example.com"
                          className={styles.input}
                        />
                        {links.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLink(index)}
                            className={styles.removeLinkButton}
                          >
                            <IconX size={20} stroke={2} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className={styles.submitButton}>
              Отправить предложение
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
