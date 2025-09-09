'use client';

import React, { useEffect, useState } from 'react';
import { UploadFormData } from '@/types/upload';
import styles from './UploadForm.module.css';

interface UploadFormProps {
  onSubmit: (formData: UploadFormData) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export default function UploadForm({
  onSubmit,
  disabled = false,
  isLoading = false,
}: UploadFormProps) {
  const [formData, setFormData] = useState<UploadFormData>({
    title: '',
    dimensions: '56 × 76 cm',
    medium: 'Watercolor',
    alt: '',
  });

  const [errors, setErrors] = useState<Partial<UploadFormData>>({});

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as Partial<UploadFormData>;
      setFormData((prev) => ({
        title: detail.title ?? prev.title,
        dimensions: detail.dimensions ?? prev.dimensions,
        medium: detail.medium ?? prev.medium,
        alt: prev.alt,
        tags: detail.tags ?? prev.tags,
      }));
    };
    window.addEventListener('upload-defaults', handler as EventListener);
    return () =>
      window.removeEventListener('upload-defaults', handler as EventListener);
  }, []);

  const handleInputChange = (field: keyof UploadFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTagsChange = (value: string) => {
    const tags = value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    setFormData((prev) => ({ ...prev, tags }));

    // Clear error when user starts typing
    if (errors.tags) {
      setErrors((prev) => ({ ...prev, tags: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UploadFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.dimensions.trim()) {
      newErrors.dimensions = 'Dimensions are required';
    }

    if (!formData.medium.trim()) {
      newErrors.medium = 'Medium is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (validateForm()) {
        onSubmit(formData);
      }
    }
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.formHeader}>
        <h3>Image Information</h3>
        <p>Provide details for all uploaded images</p>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`${styles.input} ${errors.title ? styles.error : ''}`}
            placeholder="e.g., Cisza poranka"
            disabled={disabled}
            required
          />
          {errors.title && (
            <span className={styles.errorMessage}>{errors.title}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="dimensions" className={styles.label}>
            Dimensions *
          </label>
          <input
            id="dimensions"
            type="text"
            value={formData.dimensions}
            onChange={(e) => handleInputChange('dimensions', e.target.value)}
            className={`${styles.input} ${errors.dimensions ? styles.error : ''}`}
            placeholder="e.g., 60 × 75 cm, olej na płótnie"
            disabled={disabled}
            required
          />
          {errors.dimensions && (
            <span className={styles.errorMessage}>{errors.dimensions}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="medium" className={styles.label}>
            Medium *
          </label>
          <input
            id="medium"
            type="text"
            value={formData.medium}
            onChange={(e) => handleInputChange('medium', e.target.value)}
            className={`${styles.input} ${errors.medium ? styles.error : ''}`}
            placeholder="e.g., olej na płótnie, akryl, akwarela"
            disabled={disabled}
            required
          />
          {errors.medium && (
            <span className={styles.errorMessage}>{errors.medium}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="alt" className={styles.label}>
            Alt Text
          </label>
          <input
            id="alt"
            type="text"
            value={formData.alt}
            onChange={(e) => handleInputChange('alt', e.target.value)}
            className={styles.input}
            placeholder="e.g., Obraz olejny przedstawiający pejzaż"
            disabled={disabled}
          />
          <span className={styles.helpText}>
            Optional. Used for accessibility. If empty, title will be used.
          </span>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="tags" className={styles.label}>
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            type="text"
            value={(formData.tags ?? []).join(', ')}
            onChange={(e) => handleTagsChange(e.target.value)}
            className={styles.input}
            placeholder="e.g., Obsidian, Series A"
            disabled={disabled}
          />
        </div>
      </div>

      <div className={styles.formActions}>
        <button
          type="submit"
          className={`${styles.submitButton} ${isLoading ? styles.loading : ''}`}
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <>
              <div className={styles.spinner}></div>
              Processing Images...
            </>
          ) : (
            'Process & Upload Images'
          )}
        </button>

        <div className={styles.shortcut}>
          Press <kbd>⌘</kbd> + <kbd>Enter</kbd> to submit
        </div>
      </div>
    </form>
  );
}
