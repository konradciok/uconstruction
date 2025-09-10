/**
 * Not Found Page Component (Legacy Wrapper)
 * 
 * Wrapper around StatusPage for backward compatibility
 * @deprecated Use StatusPage directly for new implementations
 */

import React from 'react'
import Link from 'next/link'
import StatusPage, { StatusIcons } from './StatusPage'

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
  const helpText = (
    <p>
      Looking for something specific? Try browsing our{' '}
      <Link href="/gallery" className="text-blue-600 hover:text-blue-800 transition-colors">
        gallery
      </Link>
      {' '}or{' '}
      <Link href="/shop" className="text-blue-600 hover:text-blue-800 transition-colors">
        shop
      </Link>
      .
    </p>
  )

  return (
    <StatusPage
      icon={StatusIcons.notFound}
      title={title}
      message={message}
      showAction={showBackButton}
      actionText={backButtonText}
      actionHref={backButtonHref}
      helpText={helpText}
      variant="neutral"
    />
  )
}