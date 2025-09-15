/**
 * ProductContent Component
 * 
 * Organizes product information into accordion sections for better scannability
 * and progressive disclosure. Replaces the linear ProductDescription component.
 */

import React from 'react'
import DOMPurify from 'isomorphic-dompurify'
import { AccordionGroup, type AccordionItem } from './accordion-group'
import { TemplateProduct } from '@/lib/template-adapters'
import styles from './product-content.module.css'

interface ProductContentProps {
  product: TemplateProduct
  onAccordionToggle?: (itemId: string, isOpen: boolean) => void
}

export function ProductContent({ product, onAccordionToggle }: ProductContentProps) {
  // Build accordion items based on available product data
  const accordionItems: AccordionItem[] = []

  // Description Accordion
  if (product.description) {
    accordionItems.push({
      id: 'description',
      title: 'Description',
      defaultOpen: false, // Closed by default as per spec
      content: (
        <div 
          className={styles.descriptionContent}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }}
        />
      )
    })
  }

  // Technical Details Accordion
  accordionItems.push({
    id: 'technical-details',
    title: 'Technical Details',
    defaultOpen: false,
    content: (
      <div className={styles.technicalDetails}>
        <ul className="featuresList">
          <li className="featureItem">
            <span className="featureIcon">✓</span>
            Museum-quality giclée printing on archival paper
          </li>
          <li className="featureItem">
            <span className="featureIcon">✓</span>
            Fade-resistant pigment inks for lasting color
          </li>
          <li className="featureItem">
            <span className="featureIcon">✓</span>
            Acid-free, cotton-fiber paper (310gsm)
          </li>
          <li className="featureItem">
            <span className="featureIcon">✓</span>
            Certificate of authenticity included
          </li>
          <li className="featureItem">
            <span className="featureIcon">✓</span>
            Ready for framing with 2mm white border
          </li>
        </ul>
        
        <div className={styles.technicalSpecs}>
          <h4>Specifications</h4>
          <ul>
            <li><strong>Paper:</strong> Hahnemühle Photo Rag</li>
            <li><strong>Weight:</strong> 310gsm</li>
            <li><strong>Finish:</strong> Matte, textured surface</li>
            <li><strong>Color Profile:</strong> Adobe RGB</li>
            <li><strong>Archival Rating:</strong> 100+ years</li>
          </ul>
        </div>
      </div>
    )
  })

  // Shipping & Returns Accordion
  accordionItems.push({
    id: 'shipping-returns',
    title: 'Shipping & Returns',
    defaultOpen: false,
    content: (
      <div className={styles.shippingReturns}>
        <div className={styles.shippingSection}>
          <h4>Shipping Information</h4>
          <ul>
            <li><strong>Processing Time:</strong> 1-2 business days</li>
            <li><strong>Shipping Time:</strong> 3-5 business days (standard)</li>
            <li><strong>Express Shipping:</strong> 1-2 business days available</li>
            <li><strong>Free Shipping:</strong> Orders over $50</li>
            <li><strong>International:</strong> Available to most countries</li>
          </ul>
          
          <p>All prints are carefully packaged in protective tubes or flat mailers to ensure they arrive in perfect condition.</p>
        </div>
        
        <div className={styles.returnsSection}>
          <h4>Returns & Exchanges</h4>
          <ul>
            <li><strong>Return Window:</strong> 30 days from delivery</li>
            <li><strong>Condition:</strong> Items must be in original condition</li>
            <li><strong>Return Shipping:</strong> Free return labels provided</li>
            <li><strong>Refund Processing:</strong> 3-5 business days</li>
            <li><strong>Exchanges:</strong> Available for size or damage issues</li>
          </ul>
          
          <p>We stand behind the quality of our prints. If you&apos;re not completely satisfied, we&apos;ll make it right.</p>
        </div>
      </div>
    )
  })

  // Collections and Tags (if available) - shown as supplementary info
  const hasSupplementaryInfo = (product.tags && product.tags.length > 0) || 
                               (product.collections && product.collections.length > 0)

  if (hasSupplementaryInfo) {
    accordionItems.push({
      id: 'additional-info',
      title: 'Additional Information',
      defaultOpen: false,
      content: (
        <div className={styles.additionalInfo}>
          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className={styles.tagsSection}>
              <h4>Tags</h4>
              <div className="tagsList">
                {product.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Collections */}
          {product.collections && product.collections.length > 0 && (
            <div className={styles.collectionsSection}>
              <h4>Collections</h4>
              <div className="collectionsList">
                {product.collections.map((collection, index) => (
                  <a
                    key={index}
                    href={`/shop/${collection.handle}`}
                    className="collectionLink"
                  >
                    {collection.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    })
  }

  // Analytics handler for accordion interactions
  const handleAccordionToggle = (itemId: string, isOpen: boolean) => {
    // Track accordion interactions for analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
      if (typeof gtag === 'function') {
        gtag('event', 'accordion_open', {
          event_category: 'product_page',
          event_label: itemId,
          value: isOpen ? 1 : 0
        })
      }
    }
    
    // Call parent handler if provided
    onAccordionToggle?.(itemId, isOpen)
  }

  return (
    <div className={styles.productContent}>
      <AccordionGroup 
        items={accordionItems}
        allowMultiple={true}
        onToggle={handleAccordionToggle}
        className={styles.contentAccordions}
      />
    </div>
  )
}

export default ProductContent
