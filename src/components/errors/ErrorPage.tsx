/**
 * Error Page Component
 * 
 * Provides consistent error state for pages
 */

import React from 'react'
import Link from 'next/link'
import Container from '../Container'

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          {/* Error Icon */}
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {title}
          </h1>

          {/* Error Message */}
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {/* Error Details (for development) */}
          {error && process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-700 font-mono">
                {error}
              </p>
            </div>
          )}

          {/* Back Button */}
          {showBackButton && (
            <div className="space-y-4">
              <Link
                href={backButtonHref}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {backButtonText}
              </Link>
            </div>
          )}

          {/* Additional Help */}
          <div className="mt-8 text-sm text-gray-500">
            <p>
              If you continue to experience issues, please{' '}
              <Link href="/contact" className="text-blue-600 hover:text-blue-500">
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
