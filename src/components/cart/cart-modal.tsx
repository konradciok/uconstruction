'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Image from 'next/image'
import { useCart } from './cart-context-backend'
import Link from 'next/link'
import styles from './cart-modal.module.css'

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const { cart, removeItem, updateQuantity, clearCart, isLoading, error, syncCart } = useCart()
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(itemId)
    } else {
      setIsUpdating(itemId)
      try {
        await updateQuantity(itemId, newQuantity)
      } finally {
        setIsUpdating(null)
      }
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    setIsUpdating(itemId)
    try {
      await removeItem(itemId)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleClearCart = async () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      await clearCart()
    }
  }

  const handleSyncCart = async () => {
    await syncCart()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={styles.overlay} />
        </Transition.Child>

        <div className={styles.modalContainer}>
          <div className={styles.modalContent}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={styles.modalPanel}>
                <div className={styles.modalHeader}>
                  <Dialog.Title
                    as="h3"
                    className={styles.modalTitle}
                  >
                    Shopping Cart ({cart.totalQuantity} items)
                  </Dialog.Title>
                  
                  {error && (
                    <div className={styles.errorMessage}>
                      <span>{error}</span>
                      <button onClick={handleSyncCart} className={styles.retryButton}>
                        Retry
                      </button>
                    </div>
                  )}
                </div>

                {cart.items.length === 0 ? (
                  <div className={styles.emptyContainer}>
                    <div className={styles.emptyIcon}>
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                    </div>
                    <p className={styles.emptyMessage}>Your cart is empty</p>
                    <button
                      onClick={onClose}
                      className={styles.continueShoppingButton}
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={styles.itemsContainer}>
                      {cart.items.map((item) => (
                        <div key={item.id} className={styles.cartItem}>
                          <div className={styles.itemImage}>
                            {item.product.media?.[0] ? (
                              <Image
                                src={item.product.media[0].url}
                                alt={item.product.media[0].altText || item.product.title}
                                width={60}
                                height={60}
                                className="rounded-lg object-cover"
                              />
                            ) : (
                              <div className={styles.itemImagePlaceholder}>
                                <span className={styles.itemImagePlaceholderIcon}>🖼️</span>
                              </div>
                            )}
                          </div>
                          
                          <div className={styles.itemDetails}>
                            <h4 className={styles.itemTitle}>
                              {item.product.title}
                            </h4>
                            <p className={styles.itemPrice}>
                              ${item.price.toFixed(2)}
                            </p>
                          </div>
                          
                          <div className={styles.quantityControls}>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={isUpdating === item.id || isLoading}
                              className={styles.quantityButton}
                            >
                              -
                            </button>
                            <span className={styles.quantityDisplay}>
                              {isUpdating === item.id ? (
                                <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className={styles.spinnerCircle} cx="12" cy="12" r="10"></circle>
                                  <path className={styles.spinnerPath} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                item.quantity
                              )}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={isUpdating === item.id || isLoading}
                              className={styles.quantityButton}
                            >
                              +
                            </button>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isUpdating === item.id || isLoading}
                            className={styles.removeButton}
                          >
                            {isUpdating === item.id ? (
                              <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className={styles.spinnerCircle} cx="12" cy="12" r="10"></circle>
                                <path className={styles.spinnerPath} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className={styles.summary}>
                      <div className={styles.summaryHeader}>
                        <span className={styles.totalAmount}>
                          Total: ${cart.totalAmount.toFixed(2)}
                        </span>
                        <button
                          onClick={handleClearCart}
                          disabled={isLoading}
                          className={styles.clearCartButton}
                        >
                          {isLoading ? 'Clearing...' : 'Clear Cart'}
                        </button>
                      </div>
                      
                      <div className={styles.actionButtons}>
                        <Link
                          href="/checkout"
                          className={styles.checkoutButton}
                          onClick={onClose}
                        >
                          Checkout
                        </Link>
                        <button
                          onClick={onClose}
                          className={styles.continueShoppingButtonSecondary}
                        >
                          Continue Shopping
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
