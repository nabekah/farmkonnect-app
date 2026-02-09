import { TRPCError } from '@trpc/server';
import { ZodError } from 'zod';

/**
 * Standardized error response format
 */
export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

/**
 * Error codes for different scenarios
 */
export enum ErrorCode {
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',

  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  // Business logic errors
  INVALID_STATE = 'INVALID_STATE',
  OPERATION_FAILED = 'OPERATION_FAILED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',

  // External service errors
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  NOTIFICATION_FAILED = 'NOTIFICATION_FAILED',

  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

/**
 * User-friendly error messages
 */
const errorMessages: Record<ErrorCode, string> = {
  [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCode.INVALID_INPUT]: 'Invalid input provided.',
  [ErrorCode.MISSING_REQUIRED_FIELD]: 'Required field is missing.',
  [ErrorCode.DATABASE_ERROR]: 'Database operation failed. Please try again.',
  [ErrorCode.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCode.DUPLICATE_ENTRY]: 'This entry already exists.',
  [ErrorCode.CONSTRAINT_VIOLATION]: 'Operation violates data constraints.',
  [ErrorCode.UNAUTHORIZED]: 'You are not authenticated. Please log in.',
  [ErrorCode.FORBIDDEN]: 'You do not have permission to perform this action.',
  [ErrorCode.SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
  [ErrorCode.INVALID_STATE]: 'Operation cannot be performed in the current state.',
  [ErrorCode.OPERATION_FAILED]: 'Operation failed. Please try again.',
  [ErrorCode.INSUFFICIENT_FUNDS]: 'Insufficient funds for this operation.',
  [ErrorCode.QUOTA_EXCEEDED]: 'You have exceeded your quota.',
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 'External service error. Please try again later.',
  [ErrorCode.PAYMENT_FAILED]: 'Payment processing failed. Please try again.',
  [ErrorCode.NOTIFICATION_FAILED]: 'Failed to send notification.',
  [ErrorCode.INTERNAL_ERROR]: 'An unexpected error occurred. Please try again.',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable. Please try again later.',
};

/**
 * Create a standardized error response
 */
export const createErrorResponse = (
  code: ErrorCode,
  details?: Record<string, any>
): ErrorResponse => {
  return {
    code,
    message: errorMessages[code],
    details,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Handle Zod validation errors
 */
export const handleValidationError = (error: ZodError): ErrorResponse => {
  const fieldErrors: Record<string, string> = {};
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    fieldErrors[path] = err.message;
  });

  return createErrorResponse(ErrorCode.VALIDATION_ERROR, { fieldErrors });
};

/**
 * Handle database errors
 */
export const handleDatabaseError = (error: any): ErrorResponse => {
  if (error.code === 'ER_DUP_ENTRY') {
    return createErrorResponse(ErrorCode.DUPLICATE_ENTRY);
  }
  if (error.code === 'ER_NO_REFERENCED_ROW') {
    return createErrorResponse(ErrorCode.NOT_FOUND);
  }
  if (error.code?.startsWith('ER_')) {
    return createErrorResponse(ErrorCode.CONSTRAINT_VIOLATION, { originalError: error.message });
  }
  return createErrorResponse(ErrorCode.DATABASE_ERROR, { originalError: error.message });
};

/**
 * Throw a standardized TRPC error
 */
export const throwTRPCError = (
  code: ErrorCode,
  details?: Record<string, any>
): never => {
  const errorResponse = createErrorResponse(code, details);

  const trpcCode = mapErrorCodeToTRPCCode(code);
  throw new TRPCError({
    code: trpcCode,
    message: errorResponse.message,
    cause: errorResponse,
  });
};

/**
 * Map error code to TRPC error code
 */
const mapErrorCodeToTRPCCode = (code: ErrorCode): any => {
  const mapping: Record<ErrorCode, any> = {
    [ErrorCode.VALIDATION_ERROR]: 'BAD_REQUEST',
    [ErrorCode.INVALID_INPUT]: 'BAD_REQUEST',
    [ErrorCode.MISSING_REQUIRED_FIELD]: 'BAD_REQUEST',
    [ErrorCode.DATABASE_ERROR]: 'INTERNAL_SERVER_ERROR',
    [ErrorCode.NOT_FOUND]: 'NOT_FOUND',
    [ErrorCode.DUPLICATE_ENTRY]: 'CONFLICT',
    [ErrorCode.CONSTRAINT_VIOLATION]: 'BAD_REQUEST',
    [ErrorCode.UNAUTHORIZED]: 'UNAUTHORIZED',
    [ErrorCode.FORBIDDEN]: 'FORBIDDEN',
    [ErrorCode.SESSION_EXPIRED]: 'UNAUTHORIZED',
    [ErrorCode.INVALID_STATE]: 'BAD_REQUEST',
    [ErrorCode.OPERATION_FAILED]: 'INTERNAL_SERVER_ERROR',
    [ErrorCode.INSUFFICIENT_FUNDS]: 'BAD_REQUEST',
    [ErrorCode.QUOTA_EXCEEDED]: 'BAD_REQUEST',
    [ErrorCode.EXTERNAL_SERVICE_ERROR]: 'INTERNAL_SERVER_ERROR',
    [ErrorCode.PAYMENT_FAILED]: 'INTERNAL_SERVER_ERROR',
    [ErrorCode.NOTIFICATION_FAILED]: 'INTERNAL_SERVER_ERROR',
    [ErrorCode.INTERNAL_ERROR]: 'INTERNAL_SERVER_ERROR',
    [ErrorCode.SERVICE_UNAVAILABLE]: 'INTERNAL_SERVER_ERROR',
  };
  return mapping[code] || 'INTERNAL_SERVER_ERROR';
};

/**
 * Retry logic with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
};

/**
 * Safe async operation wrapper
 */
export const safeAsync = async <T>(
  fn: () => Promise<T>,
  errorCode: ErrorCode = ErrorCode.OPERATION_FAILED
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    console.error('Async operation error:', error);
    throwTRPCError(errorCode, { originalError: String(error) });
  }
};

/**
 * Field-level validation helper
 */
export const validateField = (
  fieldName: string,
  value: any,
  validators: Array<(val: any) => boolean | string>
): string | null => {
  for (const validator of validators) {
    const result = validator(value);
    if (result !== true) {
      return typeof result === 'string' ? result : `${fieldName} is invalid`;
    }
  }
  return null;
};

/**
 * Common field validators
 */
export const validators = {
  required: (value: any) => value !== null && value !== undefined && value !== '',
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: (value: string) => /^\+?[1-9]\d{1,14}$/.test(value),
  positive: (value: number) => value > 0,
  nonNegative: (value: number) => value >= 0,
  minLength: (min: number) => (value: string) => value.length >= min,
  maxLength: (max: number) => (value: string) => value.length <= max,
  minValue: (min: number) => (value: number) => value >= min,
  maxValue: (max: number) => (value: number) => value <= max,
  numeric: (value: any) => !isNaN(parseFloat(value)) && isFinite(value),
  date: (value: any) => value instanceof Date && !isNaN(value.getTime()),
  url: (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
};

/**
 * Batch validation for multiple fields
 */
export const validateFields = (
  data: Record<string, any>,
  schema: Record<string, Array<(val: any) => boolean | string>>
): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.entries(schema).forEach(([fieldName, fieldValidators]) => {
    const error = validateField(fieldName, data[fieldName], fieldValidators);
    if (error) {
      errors[fieldName] = error;
    }
  });

  return errors;
};
