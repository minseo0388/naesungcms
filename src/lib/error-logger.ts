/**
 * Secure Error Logger
 * Sanitizes errors in production to prevent information leakage
 */

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

interface ErrorLogOptions {
    userId?: string
    requestId?: string
    context?: string
}

/**
 * Logs error securely - full details in dev, sanitized in production
 */
export function logError(error: unknown, options: ErrorLogOptions = {}) {
    const { userId, requestId, context } = options

    const timestamp = new Date().toISOString()
    const logPrefix = `[${timestamp}]${requestId ? ` [${requestId}]` : ''}${context ? ` [${context}]` : ''}`

    if (IS_PRODUCTION) {
        // Production: Log minimal info, no stack traces
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`${logPrefix} Error occurred:`, {
            message: errorMessage,
            userId: userId || 'anonymous',
            // Don't log stack trace or error details
        })
    } else {
        // Development: Log full error details
        console.error(`${logPrefix} Error:`, error)
        if (error instanceof Error && error.stack) {
            console.error('Stack trace:', error.stack)
        }
    }
}

/**
 * Returns a safe error message for client response
 */
export function getSafeErrorMessage(error: unknown, fallback: string = 'An error occurred'): string {
    if (IS_PRODUCTION) {
        // Never expose internal error details in production
        return fallback
    }

    // In development, show actual error for debugging
    if (error instanceof Error) {
        return error.message
    }

    return fallback
}

/**
 * Generates a unique request ID for error tracking
 */
export function generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Safe error response for API routes
 */
export function createErrorResponse(
    error: unknown,
    statusCode: number = 500,
    publicMessage: string = 'Internal Server Error',
    options: ErrorLogOptions = {}
): Response {
    const requestId = options.requestId || generateRequestId()

    // Log the error securely
    logError(error, { ...options, requestId })

    // Return safe response
    return new Response(
        JSON.stringify({
            error: publicMessage,
            requestId: IS_PRODUCTION ? undefined : requestId, // Only include in dev
        }),
        {
            status: statusCode,
            headers: { 'Content-Type': 'application/json' }
        }
    )
}
