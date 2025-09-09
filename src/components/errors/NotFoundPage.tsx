/**
 * Not Found Page Component
 * 
 * Provides consistent 404 state for pages
 */

import React from 'react'
import Link from 'next/link'
import Container from '../Container'
import styles from './NotFoundPage.module.css'

interface NotFoundPageProps {
  title?: string
  message?: string
  showBackButton?: boolean
  backButtonText?: string
  backButtonHref?: string
}

export default function NotFoundPage({
  title = 'Page Not Found',
  message = 'The page you are looking for does not exist.',
  showBackButton = true,
  backButtonText = 'Go Home',
  backButtonHref = '/'
}: NotFoundPageProps) {
  return (
    <Container>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* 404 Icon */}
          <div className={styles.iconContainer}>
            <div className={styles.iconWrapper}>
              <svg
                className={styles.icon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"
                />
              </svg>
            </div>
          </div>

          {/* 404 Title */}
          <h1 className={styles.title}>
            {title}
          </h1>

          {/* 404 Message */}
          <p className={styles.message}>
            {message}
          </p>

          {/* Back Button */}
          {showBackButton && (
            <div className={styles.actions}>
              <Link
                href={backButtonHref}
                className={styles.backButton}
              >
                {backButtonText}
              </Link>
            </div>
          )}

          {/* Additional Help */}
          <div className={styles.help}>
            <p>
              Looking for something specific? Try browsing our{' '}
              <Link href="/gallery" className={styles.helpLink}>
                gallery
              </Link>
              {' '}or{' '}
              <Link href="/shop" className={styles.helpLink}>
                shop
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </Container>
  )
}
