'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Artwork } from '@/types/portfolio2';
import { ProductWithRelations } from '@/types/product';
import { ProductToArtworkTransformer } from '@/lib/product-to-artwork-transformer';
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
    
    const fetchArtworks = async () => {
      try {
        // Fetch products from the API
        const response = await fetch('/api/products?publishedOnly=true&take=100');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        const products: ProductWithRelations[] = data.data.products;
        
        if (!mounted) return;
        
        // Transform products to artworks
        const transformedArtworks = ProductToArtworkTransformer.transformProducts(products);
        
        // Mark all as uploaded since they're in the database
        const withFlags = transformedArtworks.map((a) => ({
          ...a,
          _isUploaded: true,
        }));
        
        setArtworks(withFlags);
      } catch (error) {
        console.error('Error fetching artworks:', error);
        if (mounted) {
          setArtworks([]);
        }
      }
    };
    
    fetchArtworks();
    
    const onUpdate = () => {
      fetchArtworks();
    };
    
    // Listen for product updates (custom event)
    window.addEventListener('product-update', onUpdate as EventListener);
    
    return () => {
      mounted = false;
      window.removeEventListener('product-update', onUpdate as EventListener);
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
      // Extract product ID from artwork ID (remove 'product-' prefix)
      const productId = art.id.replace('product-', '');
      
      // Update product via API
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: art.title,
          bodyHtml: `<p>${art.medium || 'Digital Art'} - ${art.dimensions}</p>`,
          productType: art.medium || 'Digital Art',
          tags: art.tags || [],
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      
      if (typeof window !== 'undefined') {
        alert('Item updated successfully.');
        // Dispatch update event
        window.dispatchEvent(new CustomEvent('product-update'));
      }
    } catch (error) {
      console.error('Error updating artwork:', error);
      if (typeof window !== 'undefined') {
        alert('Failed to update item. Please try again.');
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
      // Extract product ID from artwork ID (remove 'product-' prefix)
      const productId = id.replace('product-', '');
      
      // Delete product via API
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      // Remove from local state
      setArtworks((prev) => prev.filter((a) => a.id !== id));
      
      // Dispatch update event
      window.dispatchEvent(new CustomEvent('product-update'));
    } catch (error) {
      console.error('Error deleting artwork:', error);
      if (typeof window !== 'undefined') {
        alert('Failed to delete item. Please try again.');
      }
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
