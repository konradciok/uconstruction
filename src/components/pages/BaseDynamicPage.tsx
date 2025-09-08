/**
 * Base Dynamic Page Component
 * 
 * Provides consistent structure for dynamic pages with data fetching
 */

import React from 'react'
import { notFound } from 'next/navigation'
import BasePage from './BasePage'
import LoadingPage from '../errors/LoadingPage'
import ErrorPage from '../errors/ErrorPage'

interface BaseDynamicPageProps<T> {
  data: T | null
  loading?: boolean
  error?: string
  title: string
  description?: string
  className?: string
  children: (data: T) => React.ReactNode
  notFoundMessage?: string
  errorMessage?: string
}

export default function BaseDynamicPage<T>({
  data,
  loading = false,
  error,
  title,
  description,
  className,
  children,
  notFoundMessage = 'The requested resource was not found.',
  errorMessage = 'An error occurred while loading the page.'
}: BaseDynamicPageProps<T>) {
  // Handle loading state
  if (loading) {
    return <LoadingPage />
  }

  // Handle error state
  if (error) {
    return (
      <ErrorPage 
        title="Error Loading Page"
        message={errorMessage}
        error={error}
      />
    )
  }

  // Handle not found state
  if (!data) {
    return (
      <ErrorPage 
        title="Not Found"
        message={notFoundMessage}
        showBackButton={true}
      />
    )
  }

  // Render the page with data
  return (
    <BasePage
      title={title}
      description={description}
      className={className}
    >
      {children(data)}
    </BasePage>
  )
}

/**
 * Hook-like function for handling dynamic page data
 */
export function useDynamicPageData<T>(
  data: T | null,
  loading: boolean = false,
  error?: string
): {
  shouldRender: boolean
  shouldShowLoading: boolean
  shouldShowError: boolean
  shouldShowNotFound: boolean
} {
  return {
    shouldRender: !loading && !error && data !== null,
    shouldShowLoading: loading,
    shouldShowError: !!error,
    shouldShowNotFound: !loading && !error && data === null
  }
}
