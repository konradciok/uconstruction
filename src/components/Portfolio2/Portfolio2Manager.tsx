'use client';

import React, { useState, useEffect } from 'react';
import { Portfolio2Manager as Manager } from '@/lib/portfolio2-manager';
import styles from './Portfolio2Manager.module.css';

interface Portfolio2ManagerProps {
  onRefresh?: () => void;
}

export default function Portfolio2Manager({ onRefresh }: Portfolio2ManagerProps) {
  const [stats, setStats] = useState({ total: 0, uploaded: 0, static: 0 });
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => {
    // Update stats on mount
    setStats(Manager.getPortfolioStats());

    // Listen for portfolio updates
    const handlePortfolioUpdate = () => {
      setStats(Manager.getPortfolioStats());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('portfolio2-update', handlePortfolioUpdate);
      
      return () => {
        window.removeEventListener('portfolio2-update', handlePortfolioUpdate);
      };
    }
  }, []);

  const handleExportData = () => {
    Manager.exportPortfolioData();
  };

  const handleClearUploaded = () => {
    if (showConfirmClear) {
      Manager.clearUploadedArtworks();
      setStats(Manager.getPortfolioStats());
      setShowConfirmClear(false);
      onRefresh?.();
    } else {
      setShowConfirmClear(true);
    }
  };

  const handleCancelClear = () => {
    setShowConfirmClear(false);
  };

  if (stats.uploaded === 0) {
    return null; // Don't show manager if no uploaded artworks
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Portfolio Management</h3>
        <p>Manage uploaded artworks</p>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{stats.uploaded}</span>
          <span className={styles.statLabel}>Uploaded Works</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{stats.total}</span>
          <span className={styles.statLabel}>Total Works</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          onClick={handleExportData}
          className={styles.exportButton}
          title="Export uploaded artworks data"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export Data
        </button>

        <button
          onClick={handleClearUploaded}
          className={styles.clearButton}
          title="Remove all uploaded artworks"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3,6 5,6 21,6" />
            <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
          </svg>
          {showConfirmClear ? 'Confirm Clear' : 'Clear Uploaded'}
        </button>
      </div>

      {showConfirmClear && (
        <div className={styles.confirmDialog}>
          <p>Are you sure you want to remove all uploaded artworks? This action cannot be undone.</p>
          <div className={styles.confirmActions}>
            <button onClick={handleCancelClear} className={styles.cancelButton}>
              Cancel
            </button>
            <button onClick={handleClearUploaded} className={styles.confirmButton}>
              Yes, Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
