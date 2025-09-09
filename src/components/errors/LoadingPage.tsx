/**
 * Loading Page Component
 * 
 * Provides consistent loading state for pages
 */

import React from 'react'
import Container from '../Container'
import styles from './LoadingPage.module.css'

interface LoadingPageProps {
  message?: string
  showSpinner?: boolean
}

export default function LoadingPage({
  message = 'Loading...',
  showSpinner = true
}: LoadingPageProps) {
  return (
    <Container>
      <div className={styles.container}>
        <div className={styles.content}>
          {showSpinner && (
            <div className={styles.spinnerContainer}>
              <div className={styles.spinner}></div>
            </div>
          )}
          <p className={styles.message}>{message}</p>
        </div>
      </div>
    </Container>
  )
}
