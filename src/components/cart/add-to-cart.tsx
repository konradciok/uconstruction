'use client'

import { useState } from 'react'
import { useCart } from './cart-context-backend'
import { TemplateProduct } from '@/lib/template-adapters'
import clsx from 'clsx'
import styles from './add-to-cart.module.css'

interface AddToCartProps {
  product: TemplateProduct
  variantId?: string
  quantity?: number
  className?: string
  children?: React.ReactNode
}

export function AddToCart({ 
  product, 
  variantId, 
  quantity = 1, 
  className = '',
  children 
}: AddToCartProps) {
  const { addItem, isLoading, error } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)

  const handleAddToCart = async () => {
    if (!product.variants || product.variants.length === 0) {
      alert('No variants available for this product')
      return
    }

    const selectedVariantId = variantId || product.variants[0].id
    const selectedVariant = product.variants.find(v => v.id === selectedVariantId)
    
    if (!selectedVariant) {
      alert('Selected variant not found')
      return
    }

    if (selectedVariant.availableForSale === false) {
      alert('This item is out of stock')
      return
    }

    setIsAdding(true)
    setShowError(false)

    try {
      await addItem(product, selectedVariantId, quantity)
      setShowSuccess(true)
      
      // Hide success message after 2 seconds
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('Error adding to cart:', error)
      setShowError(true)
      
      // Hide error message after 3 seconds
      setTimeout(() => setShowError(false), 3000)
    } finally {
      setIsAdding(false)
    }
  }

  const defaultContent = (
    <button
      onClick={handleAddToCart}
      disabled={isAdding || isLoading}
      className={clsx(styles.button, className, {
        [styles.error]: showError
      })}
    >
      {isAdding || isLoading ? (
        <span className={styles.loadingContent}>
          <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className={styles.spinnerCircle} cx="12" cy="12" r="10"></circle>
            <path className={styles.spinnerPath} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Adding...
        </span>
      ) : showSuccess ? (
        <span className={styles.successContent}>
          <svg className={styles.successIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Added to Cart!
        </span>
      ) : showError ? (
        <span className={styles.errorContent}>
          <svg className={styles.errorIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Try Again
        </span>
      ) : (
        'Add to Cart'
      )}
    </button>
  )

  return children ? (
    <div onClick={handleAddToCart} className={className}>
      {children}
    </div>
  ) : (
    defaultContent
  )
}
