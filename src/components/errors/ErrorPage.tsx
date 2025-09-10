/**
 * Error Page Component (Legacy Wrapper)
 * 
 * Wrapper around StatusPage for backward compatibility
 * @deprecated Use StatusPage directly for new implementations
 */

import React from 'react'
import Link from 'next/link'
import StatusPage, { StatusIcons } from './StatusPage'

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
  const helpText = (
    <p>
      If you continue to experience issues, please{' '}
      <Link href="/contact" className="text-blue-600 hover:text-blue-800 transition-colors">
        contact us
      </Link>
      {' '}for assistance.
    </p>
  )

  return (
    <StatusPage
      icon={StatusIcons.error}
      title={title}
      message={message}
      error={error}
      showAction={showBackButton}
      actionText={backButtonText}
      actionHref={backButtonHref}
      helpText={helpText}
      variant="error"
    />
  )
}