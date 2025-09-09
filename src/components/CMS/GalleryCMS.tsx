'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Artwork } from '@/types/portfolio2';
import { Portfolio2Manager } from '@/lib/portfolio2-manager';
import styles from './GalleryCMS.module.css';

interface EditableArtwork extends Artwork {
  _isUploaded?: boolean;
}

export default function GalleryCMS() {
  const [artworks, setArtworks] = useState<EditableArtwork[]>([]);
  const [filter, setFilter] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      Portfolio2Manager.getAllArtworks(),
      Promise.resolve(Portfolio2Manager.listUploadedArtworks()),
    ]).then(([list, uploaded]) => {
      if (!mounted) return;
      const uploadedIds = new Set(uploaded.map((a: Artwork) => a.id));
      const withFlags = (list as EditableArtwork[]).map((a) => ({
        ...a,
        _isUploaded: uploadedIds.has(a.id),
      }));
      setArtworks(withFlags);
    });
    const onUpdate = () => {
      Promise.all([
        Portfolio2Manager.getAllArtworks(),
        Promise.resolve(Portfolio2Manager.listUploadedArtworks()),
      ]).then(([list, uploaded]) => {
        const uploadedIds = new Set(uploaded.map((a: Artwork) => a.id));
        const withFlags = (list as EditableArtwork[]).map((a) => ({
          ...a,
          _isUploaded: uploadedIds.has(a.id),
        }));
        setArtworks(withFlags);
      });
    };
    window.addEventListener('portfolio2-update', onUpdate as EventListener);
    return () => {
      mounted = false;
      window.removeEventListener(
        'portfolio2-update',
        onUpdate as EventListener
      );
    };
  }, []);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return artworks;
    return artworks.filter((a) =>
      [a.title, a.dimensions, a.medium, a.alt, ...(a.tags ?? [])]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q))
    );
  }, [artworks, filter]);

  const updateArtwork = (id: string, updates: Partial<Artwork>) => {
    setArtworks((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  };

  const saveArtwork = async (art: Artwork) => {
    setSaving(true);
    try {
      await Portfolio2Manager.updateArtwork(art.id, art);
      if (typeof window !== 'undefined') {
        alert('Item updated successfully.');
      }
    } finally {
      setSaving(false);
    }
  };

  const removeArtwork = async (id: string) => {
    if (typeof window !== 'undefined') {
      const confirmed = confirm(
        'Do you really want to delete this item from the gallery?'
      );
      if (!confirmed) return;
    }
    setSaving(true);
    try {
      await Portfolio2Manager.removeArtwork(id);
      setArtworks((prev) => prev.filter((a) => a.id !== id));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Gallery CMS</h1>
        <p>Manage uploaded artworks. Edit title, size, medium, tags, alt.</p>
        <div className={styles.actions}>
          <a href="/upload" className={styles.linkButton}>
            Upload more
          </a>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input
          type="text"
          placeholder="Search by title, tag, or medium..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={styles.search}
        />
      </div>

      <div className={styles.grid}>
        {filtered.map((art) => (
          <div key={art.id} className={styles.card}>
            <div className={styles.thumb}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={art.thumbnail.jpg} alt={art.alt ?? art.title} />
            </div>
            <div className={styles.fields}>
              <label>
                <span>Title</span>
                <input
                  type="text"
                  value={art.title}
                  onChange={(e) =>
                    updateArtwork(art.id, { title: e.target.value })
                  }
                />
              </label>
              <label>
                <span>Size</span>
                <input
                  type="text"
                  value={art.dimensions}
                  onChange={(e) =>
                    updateArtwork(art.id, { dimensions: e.target.value })
                  }
                />
              </label>
              <label>
                <span>Medium</span>
                <input
                  type="text"
                  value={art.medium ?? ''}
                  onChange={(e) =>
                    updateArtwork(art.id, { medium: e.target.value })
                  }
                />
              </label>
              <label>
                <span>Tags</span>
                <input
                  type="text"
                  value={(art.tags ?? []).join(', ')}
                  onChange={(e) =>
                    updateArtwork(art.id, {
                      tags: e.target.value
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </label>
              <label>
                <span>Alt text</span>
                <input
                  type="text"
                  value={art.alt ?? ''}
                  onChange={(e) =>
                    updateArtwork(art.id, { alt: e.target.value })
                  }
                />
              </label>
            </div>
            <div className={styles.cardActions}>
              <button
                disabled={saving}
                onClick={() => saveArtwork(art)}
                className={styles.save}
              >
                Save
              </button>
              <button
                disabled={saving || !art._isUploaded}
                title={
                  art._isUploaded
                    ? 'Delete uploaded artwork'
                    : 'Only uploaded artworks can be deleted here'
                }
                onClick={() => removeArtwork(art.id)}
                className={styles.delete}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
