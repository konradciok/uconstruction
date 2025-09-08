/**
 * Not Found Page Component
 * 
 * Provides consistent 404 state for pages
 */

import React from 'react'
import Link from 'next/link'
import Container from '../Container'

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          {/* 404 Icon */}
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
              <svg
                className="h-6 w-6 text-gray-600"
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {title}
          </h1>

          {/* 404 Message */}
          <p className="text-gray-600 mb-6">
            {message}
          </p>

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
              Looking for something specific? Try browsing our{' '}
              <Link href="/gallery" className="text-blue-600 hover:text-blue-500">
                gallery
              </Link>
              {' '}or{' '}
              <Link href="/shop" className="text-blue-600 hover:text-blue-500">
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
