import { TRPCClientError } from '@trpc/client';

interface RetryConfig {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  retryableStatusCodes?: number[];
}

const DEFAULT_RETRYABLE_CODES = [408, 429, 500, 502, 503, 504];

/**
 * Wraps a tRPC procedure call with automatic retry logic
 * Implements exponential backoff for transient failures
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 30000,
    backoffMultiplier = 2,
    retryableStatusCodes = DEFAULT_RETRYABLE_CODES,
  } = config;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is retryable
      const isRetryable = isRetryableError(error, retryableStatusCodes);
      const isLastAttempt = attempt === maxRetries - 1;

      if (!isRetryable || isLastAttempt) {
        throw error;
      }

      // Calculate exponential backoff delay
      const delay = calculateBackoffDelay(
        attempt,
        initialDelayMs,
        maxDelayMs,
        backoffMultiplier
      );

      // Log retry attempt
      console.warn(
        `[tRPC Retry] Attempt ${attempt + 1}/${maxRetries} failed. Retrying in ${delay}ms...`,
        lastError.message
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Determines if an error is retryable based on error type and status code
 */
function isRetryableError(error: unknown, retryableCodes: number[]): boolean {
  // Network errors are always retryable
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  // Check tRPC error status codes
  if (error instanceof TRPCClientError) {
    const data = error.data as any;
    if (data?.code) {
      // TRPC error codes: PARSE_ERROR, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, METHOD_NOT_SUPPORTED, TIMEOUT, CONFLICT, PRECONDITION_FAILED, PAYLOAD_TOO_LARGE, UNSUPPORTED_MEDIA_TYPE, UNPROCESSABLE_CONTENT, TOO_MANY_REQUESTS, CLIENT_CLOSED_REQUEST, INTERNAL_SERVER_ERROR
      const retryableTRPCCodes = ['TIMEOUT', 'TOO_MANY_REQUESTS', 'INTERNAL_SERVER_ERROR'];
      if (retryableTRPCCodes.includes(data.code)) {
        return true;
      }
    }
  }

  // Check HTTP status codes if available
  if (error instanceof Error && error.message) {
    const statusMatch = error.message.match(/status[:\\s]+(\d+)/i);
    if (statusMatch) {
      const statusCode = parseInt(statusMatch[1], 10);
      return retryableCodes.includes(statusCode);
    }
  }

  return false;
}

/**
 * Calculates exponential backoff delay
 */
function calculateBackoffDelay(
  attempt: number,
  initialDelayMs: number,
  maxDelayMs: number,
  backoffMultiplier: number
): number {
  const delay = initialDelayMs * Math.pow(backoffMultiplier, attempt);
  const jitter = Math.random() * 0.1 * delay; // Add 10% jitter
  return Math.min(delay + jitter, maxDelayMs);
}
