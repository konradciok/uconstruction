'use client'

import React, { useState, useCallback } from 'react'
import { FilterDropdown } from './filter-dropdown'
import { PriceRangeFilter } from './price-range-filter'
import { ProductCategory, ProductTag } from '@/types/product'
import clsx from 'clsx'
import styles from './search-filters.module.css'

interface SearchFiltersProps {
  categories: ProductCategory[]
  tags: ProductTag[]
  onFiltersChange: (filters: {
    categories: string[]
    tags: string[]
    priceRange: { min: number; max: number }
    searchQuery: string
  }) => void
  className?: string
}

export function SearchFilters({
  categories,
  tags,
  onFiltersChange,
  className = ''
}: SearchFiltersProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })
  const [searchQuery, setSearchQuery] = useState('')

  const handleFiltersChange = useCallback(() => {
    onFiltersChange({
      categories: selectedCategories,
      tags: selectedTags,
      priceRange,
      searchQuery
    })
  }, [selectedCategories, selectedTags, priceRange, searchQuery, onFiltersChange])

  // Update filters when any filter changes
  React.useEffect(() => {
    handleFiltersChange()
  }, [selectedCategories, selectedTags, priceRange, searchQuery, handleFiltersChange])

  const clearAllFilters = () => {
    setSelectedCategories([])
    setSelectedTags([])
    setPriceRange({ min: 0, max: 1000 })
    setSearchQuery('')
  }

  const hasActiveFilters = selectedCategories.length > 0 || 
                          selectedTags.length > 0 || 
                          priceRange.min > 0 || 
                          priceRange.max < 1000 ||
                          searchQuery.length > 0

  const categoryOptions = categories.map(category => ({
    value: category.id.toString(),
    label: category.name,
    count: category.productCount || 0
  }))

  const tagOptions = tags.map(tag => ({
    value: tag.id.toString(),
    label: tag.name,
    count: tag.productCount || 0
  }))

  return (
    <div className={clsx(styles.container, className)}>
      <div className={styles.header}>
        <h2 className={styles.title}>Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className={styles.clearAllButton}
          >
            Clear All
          </button>
        )}
      </div>

      <div className={styles.content}>
        {/* Search Query */}
        <div className={styles.searchSection}>
          <label htmlFor="search" className={styles.searchLabel}>
            Search
          </label>
          <input
            id="search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className={styles.searchInput}
          />
        </div>

        {/* Price Range */}
        <PriceRangeFilter
          minPrice={0}
          maxPrice={1000}
          onPriceChange={(min, max) => setPriceRange({ min, max })}
        />

        {/* Categories */}
        {categoryOptions.length > 0 && (
          <FilterDropdown
            label="Categories"
            options={categoryOptions}
            selectedValues={selectedCategories}
            onSelectionChange={setSelectedCategories}
          />
        )}

        {/* Tags */}
        {tagOptions.length > 0 && (
          <FilterDropdown
            label="Tags"
            options={tagOptions}
            selectedValues={selectedTags}
            onSelectionChange={setSelectedTags}
          />
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className={styles.activeFiltersSection}>
            <h3 className={styles.activeFiltersTitle}>Active Filters:</h3>
            <div className={styles.activeFiltersList}>
              {selectedCategories.map(categoryId => {
                const category = categories.find(c => c.id.toString() === categoryId)
                return category ? (
                  <span
                    key={categoryId}
                    className={clsx(styles.filterTag, styles.filterTagCategory)}
                  >
                    {category.name}
                    <button
                      onClick={() => setSelectedCategories(prev => prev.filter(id => id !== categoryId))}
                      className={clsx(styles.removeButton, styles.removeButtonCategory)}
                    >
                      ×
                    </button>
                  </span>
                ) : null
              })}
              {selectedTags.map(tagId => {
                const tag = tags.find(t => t.id.toString() === tagId)
                return tag ? (
                  <span
                    key={tagId}
                    className={clsx(styles.filterTag, styles.filterTagTag)}
                  >
                    {tag.name}
                    <button
                      onClick={() => setSelectedTags(prev => prev.filter(id => id !== tagId))}
                      className={clsx(styles.removeButton, styles.removeButtonTag)}
                    >
                      ×
                    </button>
                  </span>
                ) : null
              })}
              {(priceRange.min > 0 || priceRange.max < 1000) && (
                <span className={clsx(styles.filterTag, styles.filterTagPrice)}>
                  ${priceRange.min} - ${priceRange.max}
                  <button
                    onClick={() => setPriceRange({ min: 0, max: 1000 })}
                    className={clsx(styles.removeButton, styles.removeButtonPrice)}
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
