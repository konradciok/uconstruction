/**
 * Search Component - Template Implementation
 * 
 * Search input with autocomplete functionality
 * integrated with the main site's design system.
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/hooks/useDebounce'
import { useProductSearch } from '@/hooks/useTemplateProducts'
import { TemplateProduct } from '@/lib/template-adapters'
import styles from './search.module.css'

export function Search() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebounce(query, 300)
  const { searchResults, loading, search } = useProductSearch()

  // Search when query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      search(debouncedQuery)
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [debouncedQuery, search])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setSelectedIndex(-1)
  }

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || searchResults.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleProductSelect(searchResults[selectedIndex])
        } else if (query.trim()) {
          handleSearchSubmit()
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Handle product selection
  const handleProductSelect = (product: TemplateProduct) => {
    router.push(`/product/${product.handle}`)
    setQuery('')
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  // Handle search submit
  const handleSearchSubmit = () => {
    if (query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query)}`)
      setQuery('')
      setIsOpen(false)
    }
  }

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchInputContainer}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setIsOpen(true)}
          className={styles.searchInput}
        />
        <button
          type="button"
          onClick={handleSearchSubmit}
          className={styles.searchButton}
          aria-label="Search"
        >
          <SearchIcon />
        </button>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query.trim() || searchResults.length > 0) && (
        <div className={styles.resultsContainer}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner} />
              <span className={styles.loadingText}>Searching...</span>
            </div>
          ) : searchResults.length > 0 ? (
            <ul className={styles.resultsList}>
              {searchResults.map((product, index) => (
                <li key={product.id}>
                  <button
                    onClick={() => handleProductSelect(product)}
                    className={`${styles.resultItem} ${
                      index === selectedIndex ? styles.resultItemSelected : ''
                    }`}
                  >
                    <div className={styles.resultImage}>
                      <Image
                        src={product.featuredImage.url}
                        alt={product.title}
                        width={50}
                        height={50}
                        className={styles.resultImageImg}
                      />
                    </div>
                    <div className={styles.resultContent}>
                      <div className={styles.resultTitle}>
                        {product.title}
                      </div>
                      <div className={styles.resultPrice}>
                        ${product.priceRange.minVariantPrice.amount}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.trim() ? (
            <div className={styles.noResults}>
              <span className={styles.noResultsText}>
                No products found for &quot;{query}&quot;
              </span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

function SearchIcon() {
  return (
    <svg
      className={styles.searchIcon}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  )
}
