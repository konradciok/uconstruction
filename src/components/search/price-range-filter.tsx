'use client'

import { useState, useEffect } from 'react'
import clsx from 'clsx'
import styles from './price-range-filter.module.css'

interface PriceRangeFilterProps {
  minPrice: number
  maxPrice: number
  onPriceChange: (min: number, max: number) => void
  className?: string
}

export function PriceRangeFilter({
  minPrice,
  maxPrice,
  onPriceChange,
  className = ''
}: PriceRangeFilterProps) {
  const [localMinPrice, setLocalMinPrice] = useState(minPrice)
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice)

  useEffect(() => {
    setLocalMinPrice(minPrice)
    setLocalMaxPrice(maxPrice)
  }, [minPrice, maxPrice])

  const handleMinPriceChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    setLocalMinPrice(numValue)
    if (numValue <= localMaxPrice) {
      onPriceChange(numValue, localMaxPrice)
    }
  }

  const handleMaxPriceChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    setLocalMaxPrice(numValue)
    if (numValue >= localMinPrice) {
      onPriceChange(localMinPrice, numValue)
    }
  }

  const handleRangeChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    setLocalMinPrice(numValue)
    onPriceChange(numValue, localMaxPrice)
  }

  return (
    <div className={clsx(styles.container, className)}>
      <h3 className={styles.title}>Price Range</h3>
      
      {/* Range Slider */}
      <div className={styles.rangeSection}>
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={localMinPrice}
          onChange={(e) => handleRangeChange(e.target.value)}
          className={styles.rangeSlider}
        />
        <div className={styles.rangeLabels}>
          <span>${minPrice}</span>
          <span>${maxPrice}</span>
        </div>
      </div>

      {/* Price Inputs */}
      <div className={styles.inputsSection}>
        <div className={styles.inputGroup}>
          <label htmlFor="min-price" className={styles.inputLabel}>
            Min Price
          </label>
          <input
            id="min-price"
            type="number"
            min={minPrice}
            max={localMaxPrice}
            value={localMinPrice}
            onChange={(e) => handleMinPriceChange(e.target.value)}
            className={styles.priceInput}
            placeholder="Min"
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="max-price" className={styles.inputLabel}>
            Max Price
          </label>
          <input
            id="max-price"
            type="number"
            min={localMinPrice}
            max={maxPrice}
            value={localMaxPrice}
            onChange={(e) => handleMaxPriceChange(e.target.value)}
            className={styles.priceInput}
            placeholder="Max"
          />
        </div>
      </div>

      {/* Current Range Display */}
      <div className={styles.rangeDisplay}>
        Range: ${localMinPrice.toFixed(2)} - ${localMaxPrice.toFixed(2)}
      </div>
    </div>
  )
}
