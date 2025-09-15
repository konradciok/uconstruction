/**
 * AccordionGroup Component
 * 
 * Reusable accordion component with proper ARIA attributes, keyboard navigation,
 * and progressive enhancement for SEO and accessibility compliance.
 */

'use client'

import React, { useState, useCallback } from 'react'
import styles from './accordion-group.module.css'

export interface AccordionItem {
  id: string
  title: string
  content: React.ReactNode
  defaultOpen?: boolean
}

export interface AccordionGroupProps {
  items: AccordionItem[]
  allowMultiple?: boolean
  className?: string
  onToggle?: (itemId: string, isOpen: boolean) => void
}

export function AccordionGroup({ 
  items, 
  allowMultiple = false, 
  className = '',
  onToggle 
}: AccordionGroupProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(() => {
    // Initialize with defaultOpen items
    return new Set(items.filter(item => item.defaultOpen).map(item => item.id))
  })

  const toggleItem = useCallback((itemId: string) => {
    setOpenItems(prev => {
      const newOpenItems = new Set(prev)
      const isCurrentlyOpen = prev.has(itemId)
      
      if (isCurrentlyOpen) {
        newOpenItems.delete(itemId)
      } else {
        if (!allowMultiple) {
          // Close all other items if multiple not allowed
          newOpenItems.clear()
        }
        newOpenItems.add(itemId)
      }
      
      // Call analytics callback
      onToggle?.(itemId, !isCurrentlyOpen)
      
      return newOpenItems
    })
  }, [allowMultiple, onToggle])

  const handleKeyDown = useCallback((event: React.KeyboardEvent, itemId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleItem(itemId)
    }
  }, [toggleItem])

  return (
    <div className={`${styles.accordionGroup} ${className}`}>
      {items.map((item) => {
        const isOpen = openItems.has(item.id)
        const headingId = `accordion-heading-${item.id}`
        const contentId = `accordion-content-${item.id}`
        
        return (
          <div key={item.id} className={styles.accordionItem}>
            <h3 className={styles.accordionHeading} id={headingId}>
              <button
                type="button"
                className={`${styles.accordionTrigger} ${isOpen ? styles.accordionTriggerOpen : ''}`}
                aria-expanded={isOpen}
                aria-controls={contentId}
                onClick={() => toggleItem(item.id)}
                onKeyDown={(e) => handleKeyDown(e, item.id)}
              >
                <span className={styles.accordionTriggerText}>
                  {item.title}
                </span>
                <span 
                  className={styles.accordionIcon}
                  aria-hidden="true"
                >
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="none"
                    className={`${styles.accordionIconSvg} ${isOpen ? styles.accordionIconOpen : ''}`}
                  >
                    <path 
                      d="M4 6L8 10L12 6" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>
            </h3>
            
            <div
              id={contentId}
              role="region"
              aria-labelledby={headingId}
              className={`${styles.accordionContent} ${isOpen ? styles.accordionContentOpen : ''}`}
              hidden={!isOpen}
            >
              <div className={styles.accordionContentInner}>
                {item.content}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AccordionGroup
