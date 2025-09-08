'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './MultiSelectFilter.module.css';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface MultiSelectFilterProps {
  options: FilterOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  logic: 'AND' | 'OR';
  onLogicChange: (logic: 'AND' | 'OR') => void;
  placeholder?: string;
  className?: string;
  maxVisible?: number;
}

export default function MultiSelectFilter({
  options,
  selectedValues,
  onSelectionChange,
  logic,
  onLogicChange,
  placeholder = 'Select categories...',
  className = '',
  maxVisible = 3,
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleOption = (value: string) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    onSelectionChange(options.map((option) => option.value));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      return placeholder;
    }

    const selectedLabels = selectedValues
      .map((value) => options.find((option) => option.value === value)?.label)
      .filter(Boolean);

    if (selectedLabels.length <= maxVisible) {
      return selectedLabels.join(', ');
    }

    return `${selectedLabels.slice(0, maxVisible).join(', ')} +${selectedLabels.length - maxVisible} more`;
  };

  const selectedCount = selectedValues.length;
  const totalCount = options.length;

  return (
    <div className={`${styles.container} ${className}`} ref={dropdownRef}>
      <div className={styles.filterHeader}>
        <button
          type="button"
          className={`${styles.trigger} ${isOpen ? styles.open : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={`Filter by categories. ${selectedCount} of ${totalCount} selected.`}
        >
          <span className={styles.triggerText}>{getDisplayText()}</span>
          <svg
            className={styles.chevron}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </button>

        {selectedCount > 0 && (
          <motion.button
            type="button"
            className={styles.clearButton}
            onClick={handleClearAll}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Clear all filters"
          >
            Clear
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.dropdown}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Logic Toggle */}
            <div className={styles.logicToggle}>
              <span className={styles.logicLabel}>Logic:</span>
              <div className={styles.logicButtons}>
                <button
                  type="button"
                  className={`${styles.logicButton} ${logic === 'OR' ? styles.active : ''}`}
                  onClick={() => onLogicChange('OR')}
                  aria-label="Use OR logic (show items matching any selected category)"
                >
                  OR
                </button>
                <button
                  type="button"
                  className={`${styles.logicButton} ${logic === 'AND' ? styles.active : ''}`}
                  onClick={() => onLogicChange('AND')}
                  aria-label="Use AND logic (show items matching all selected categories)"
                >
                  AND
                </button>
              </div>
            </div>

            {/* Search */}
            <div className={styles.searchContainer}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search categories..."
                className={styles.searchInput}
                aria-label="Search categories"
              />
            </div>

            {/* Options */}
            <div className={styles.optionsContainer}>
              {filteredOptions.length === 0 ? (
                <div className={styles.noResults}>No categories found</div>
              ) : (
                <>
                  <button
                    type="button"
                    className={styles.selectAllButton}
                    onClick={handleSelectAll}
                  >
                    Select All ({totalCount})
                  </button>

                  {filteredOptions.map((option) => (
                    <label key={option.value} className={styles.option}>
                      <input
                        type="checkbox"
                        checked={selectedValues.includes(option.value)}
                        onChange={() => handleToggleOption(option.value)}
                        className={styles.checkbox}
                      />
                      <span className={styles.optionLabel}>
                        {option.label}
                        {option.count !== undefined && (
                          <span className={styles.count}>({option.count})</span>
                        )}
                      </span>
                    </label>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
