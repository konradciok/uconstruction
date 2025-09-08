/**
 * Loading Page Component
 * 
 * Provides consistent loading state for pages
 */

import React from 'react'
import Container from '../Container'

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {showSpinner && (
            <div className="mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          )}
          <p className="text-lg text-gray-600">{message}</p>
        </div>
      </div>
    </Container>
  )
}
