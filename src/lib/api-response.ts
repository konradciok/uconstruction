import { NextResponse } from 'next/server'

/**
 * Standardized API response helpers
 * Provides consistent error and success response formats
 */

export interface ApiError {
  code: string
  message: string
  details?: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: string,
  status: number = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  )
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  headers?: Record<string, string>
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
  }, { status, headers })
}

/**
 * Common error response creators
 */
export const ApiErrors = {
  invalidInput: (message: string, details?: string) =>
    createErrorResponse('INVALID_INPUT', message, details, 400),
  
  notFound: (message: string = 'Resource not found') =>
    createErrorResponse('NOT_FOUND', message, undefined, 404),
  
  serverError: (message: string = 'Internal server error', details?: string) =>
    createErrorResponse('SERVER_ERROR', message, details, 500),
  
  unauthorized: (message: string = 'Unauthorized') =>
    createErrorResponse('UNAUTHORIZED', message, undefined, 401),
  
  forbidden: (message: string = 'Forbidden') =>
    createErrorResponse('FORBIDDEN', message, undefined, 403),
}

/**
 * Handle validation errors from param-validators
 */
export function handleValidationError(
  validationResult: { isValid: boolean; error?: string }
): NextResponse<ApiResponse> | null {
  if (!validationResult.isValid && validationResult.error) {
    return ApiErrors.invalidInput(validationResult.error)
  }
  return null
}