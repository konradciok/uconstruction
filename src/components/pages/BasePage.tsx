/**
 * Base Page Component
 * 
 * Provides consistent layout and structure for all pages
 */

import React from 'react'
import Container from '../Container'

interface BasePageProps {
  children: React.ReactNode
  title: string
  description?: string
  className?: string
  showContainer?: boolean
}

export default function BasePage({
  children,
  title,
  description,
  className = '',
  showContainer = true
}: BasePageProps) {
  const content = (
    <div className={`min-h-screen ${className}`}>
      {/* Page Header */}
      <header className="py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h1>
          {description && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {description}
            </p>
          )}
        </div>
      </header>

      {/* Page Content */}
      <main>
        {children}
      </main>
    </div>
  )

  if (showContainer) {
    return <Container>{content}</Container>
  }

  return content
}
