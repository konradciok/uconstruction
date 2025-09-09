/**
 * Error Page Component
 * 
 * Provides consistent error state for pages
 */

import React from 'react'
import Link from 'next/link'
import Container from '../Container'
import styles from './ErrorPage.module.css'

interface ErrorPageProps {
  title?: string
  message: string
  error?: string
  showBackButton?: boolean
  backButtonText?: string
  backButtonHref?: string
}

export default function ErrorPage({
  title = 'Something went wrong',
  message,
  error,
  showBackButton = false,
  backButtonText = 'Go Back',
  backButtonHref = '/'
}: ErrorPageProps) {
  return (
    <Container>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Error Icon */}
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>

          {/* Error Title */}
          <h1 className={styles.title}>
            {title}
          </h1>

          {/* Error Message */}
          <p className={styles.message}>
            {message}
          </p>

          {/* Error Details (for development) */}
          {error && process.env.NODE_ENV === 'development' && (
            <div className={styles.errorDetails}>
              <p className={styles.errorText}>
                {error}
              </p>
            </div>
          )}

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
              If you continue to experience issues, please{' '}
              <Link href="/contact" className={styles.helpLink}>
                contact us
              </Link>
              {' '}for assistance.
            </p>
          </div>
        </div>
      </div>
    </Container>
  )
}
