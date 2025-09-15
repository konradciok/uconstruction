'use client'

import React from 'react'
import clsx from 'clsx'
import styles from './reassurance-bullets.module.css'

interface ReassuranceBullet {
  icon: React.ReactNode
  text: string
  subtext?: string
}

interface ReassuranceBulletsProps {
  bullets?: ReassuranceBullet[]
  className?: string
}

// Default trust signals for fine art prints
const DEFAULT_BULLETS: ReassuranceBullet[] = [
  {
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    text: "Museum-quality giclée on archival paper"
  },
  {
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    text: "Ships in 3-5 business days from EU/US"
  },
  {
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    text: "Free shipping over $50",
    subtext: "Easy 30-day returns"
  }
]

export function ReassuranceBullets({ bullets = DEFAULT_BULLETS, className }: ReassuranceBulletsProps) {
  return (
    <div className={clsx(styles.container, className)} role="list" aria-label="Product guarantees">
      {bullets.map((bullet, index) => (
        <div key={index} className={styles.bullet} role="listitem">
          <div className={styles.iconContainer}>
            <div className={styles.icon}>
              {bullet.icon}
            </div>
          </div>
          <div className={styles.content}>
            <span className={styles.text}>{bullet.text}</span>
            {bullet.subtext && (
              <span className={styles.subtext}> · {bullet.subtext}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
