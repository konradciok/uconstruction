/**
 * Generic Status Page Component
 * 
 * Provides consistent status display for various page states
 * (error, not found, loading, success, etc.)
 */

import React from 'react'
import Link from 'next/link'
import Container from '../Container'
import styles from './StatusPage.module.css'

export interface StatusPageProps {
  /** Icon to display - can be a React component or SVG path */
  icon?: React.ReactNode
  /** Main title of the status page */
  title: string
  /** Descriptive message */
  message: string
  /** Optional error details (only shown in development) */
  error?: string
  /** Whether to show a back/action button */
  showAction?: boolean
  /** Text for the action button */
  actionText?: string
  /** URL for the action button */
  actionHref?: string
  /** Custom action button component */
  actionComponent?: React.ReactNode
  /** Additional help text */
  helpText?: React.ReactNode
  /** Status variant for styling */
  variant?: 'error' | 'warning' | 'info' | 'success' | 'neutral'
  /** Custom CSS class */
  className?: string
}

export default function StatusPage({
  icon,
  title,
  message,
  error,
  showAction = false,
  actionText = 'Go Back',
  actionHref = '/',
  actionComponent,
  helpText,
  variant = 'neutral',
  className = ''
}: StatusPageProps) {
  const containerClass = `${styles.container} ${styles[variant]} ${className}`.trim()

  return (
    <Container>
      <div className={containerClass}>
        <div className={styles.content}>
          {/* Icon */}
          {icon && (
            <div className={styles.iconContainer}>
              <div className={styles.iconWrapper}>
                {icon}
              </div>
            </div>
          )}

          {/* Title */}
          <h1 className={styles.title}>
            {title}
          </h1>

          {/* Message */}
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

          {/* Action Button */}
          {showAction && (
            <div className={styles.actions}>
              {actionComponent || (
                <Link
                  href={actionHref}
                  className={styles.actionButton}
                >
                  {actionText}
                </Link>
              )}
            </div>
          )}

          {/* Help Text */}
          {helpText && (
            <div className={styles.help}>
              {helpText}
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}

// Predefined icon components for common use cases
export const StatusIcons = {
  error: (
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
  ),
  notFound: (
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
  ),
  warning: (
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
  ),
  info: (
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
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  success: (
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
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}
