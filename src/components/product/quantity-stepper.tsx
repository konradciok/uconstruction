'use client'

import { useState, useEffect, useId } from 'react'
import clsx from 'clsx'
import styles from './quantity-stepper.module.css'

interface QuantityStepperProps {
  value: number
  min?: number
  max?: number
  onChange: (quantity: number) => void
  disabled?: boolean
  className?: string
  /**
   * Optional base id to ensure label/input/description are unique and linked.
   * If not provided, a stable unique id is generated.
   */
  id?: string
  /**
   * Optional suffix to compose the id when multiple steppers exist on a page.
   * Ignored if `id` is provided.
   */
  idSuffix?: string
}

export function QuantityStepper({ 
  value, 
  min = 1, 
  max = 99, 
  onChange, 
  disabled = false,
  className,
  id,
  idSuffix
}: QuantityStepperProps) {
  const [inputValue, setInputValue] = useState(value.toString())
  const [isEditing, setIsEditing] = useState(false)
  const reactGeneratedId = useId()

  // Build stable, unique ids for a11y associations
  const baseId = id ?? `quantity-${idSuffix ?? reactGeneratedId}`
  const inputId = `${baseId}-input`
  const constraintsId = `${baseId}-constraints`

  // Update input value when prop value changes
  useEffect(() => {
    if (!isEditing) {
      setInputValue(value.toString())
    }
  }, [value, isEditing])

  const handleDecrement = () => {
    if (disabled || value <= min) return
    const newValue = Math.max(min, value - 1)
    onChange(newValue)
  }

  const handleIncrement = () => {
    if (disabled || value >= max) return
    const newValue = Math.min(max, value + 1)
    onChange(newValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    // Only update if it's a valid number
    const numValue = parseInt(newValue, 10)
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue)
    }
  }

  const handleInputFocus = () => {
    setIsEditing(true)
  }

  const handleInputBlur = () => {
    setIsEditing(false)
    const numValue = parseInt(inputValue, 10)
    
    // Validate and correct the value
    if (isNaN(numValue) || numValue < min) {
      setInputValue(min.toString())
      onChange(min)
    } else if (numValue > max) {
      setInputValue(max.toString())
      onChange(max)
    } else {
      setInputValue(numValue.toString())
      onChange(numValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      handleIncrement()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      handleDecrement()
    } else if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
  }

  const canDecrement = !disabled && value > min
  const canIncrement = !disabled && value < max

  return (
    <div className={clsx(styles.container, className)}>
      <label htmlFor={inputId} className={styles.label}>
        Quantity
      </label>
      
      <div className={styles.stepper}>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={!canDecrement}
          className={clsx(styles.button, styles.decrementButton, {
            [styles.buttonDisabled]: !canDecrement
          })}
          aria-label="Decrease quantity"
        >
          <svg 
            className={styles.buttonIcon} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>

        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={clsx(styles.input, {
            [styles.inputDisabled]: disabled
          })}
          aria-label={`Quantity, current value ${value}`}
          aria-describedby={constraintsId}
        />

        <button
          type="button"
          onClick={handleIncrement}
          disabled={!canIncrement}
          className={clsx(styles.button, styles.incrementButton, {
            [styles.buttonDisabled]: !canIncrement
          })}
          aria-label="Increase quantity"
        >
          <svg 
            className={styles.buttonIcon} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      <div id={constraintsId} className={styles.constraints}>
        Min: {min}, Max: {max}
      </div>
    </div>
  )
}
