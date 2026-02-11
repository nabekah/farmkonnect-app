import { useState, useCallback } from 'react';

interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
  onSuccess?: () => void;
  onFailure?: (error: Error) => void;
}

interface RetryState {
  isLoading: boolean;
  error: Error | null;
  attempt: number;
  isRetrying: boolean;
}

/**
 * useRetry Hook
 * Implements exponential backoff retry logic for async operations
 * Useful for handling transient network failures
 */
export function useRetry(options: RetryOptions = {}) {
  const {
    maxAttempts = 3,
    initialDelayMs = 1000,
    maxDelayMs = 30000,
    backoffMultiplier = 2,
    onRetry,
    onSuccess,
    onFailure,
  } = options;

  const [state, setState] = useState<RetryState>({
    isLoading: false,
    error: null,
    attempt: 0,
    isRetrying: false,
  });

  const calculateDelay = useCallback((attempt: number): number => {
    const delay = initialDelayMs * Math.pow(backoffMultiplier, attempt - 1);
    return Math.min(delay, maxDelayMs);
  }, [initialDelayMs, maxDelayMs, backoffMultiplier]);

  const executeWithRetry = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      let lastError: Error | null = null;
      let attempt = 0;

      while (attempt < maxAttempts) {
        attempt++;
        setState((prev) => ({
          ...prev,
          attempt,
          isLoading: true,
          isRetrying: attempt > 1,
          error: null,
        }));

        try {
          const result = await fn();
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: null,
            isRetrying: false,
          }));
          onSuccess?.();
          return result;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));

          if (attempt < maxAttempts) {
            const delay = calculateDelay(attempt);
            onRetry?.(attempt, lastError);

            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      // All retries exhausted
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: lastError,
        isRetrying: false,
      }));
      onFailure?.(lastError || new Error('Unknown error'));
      throw lastError;
    },
    [maxAttempts, calculateDelay, onRetry, onSuccess, onFailure]
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      attempt: 0,
      isRetrying: false,
    });
  }, []);

  return {
    ...state,
    executeWithRetry,
    reset,
  };
}
