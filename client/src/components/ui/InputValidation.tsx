import { forwardRef, useState, useCallback, ReactNode, InputHTMLAttributes } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ValidationStatus = 'idle' | 'validating' | 'success' | 'error' | 'warning';

export interface ValidationRule {
  /**
   * Validation function
   */
  validate: (value: string) => boolean;
  /**
   * Error message
   */
  message: string;
}

export interface InputValidationProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label text
   */
  label?: string;
  /**
   * Validation rules
   */
  rules?: ValidationRule[];
  /**
   * Validation status
   */
  status?: ValidationStatus;
  /**
   * Error message
   */
  errorMessage?: string;
  /**
   * Success message
   */
  successMessage?: string;
  /**
   * Warning message
   */
  warningMessage?: string;
  /**
   * Helper text
   */
  helperText?: string;
  /**
   * Show validation icon
   */
  showIcon?: boolean;
  /**
   * Callback on validation change
   */
  onValidationChange?: (status: ValidationStatus, message?: string) => void;
  /**
   * Custom className for wrapper
   */
  wrapperClassName?: string;
  /**
   * Custom className for input
   */
  inputClassName?: string;
}

/**
 * InputValidation Component
 * 
 * Input field with real-time validation feedback
 */
export const InputValidation = forwardRef<HTMLInputElement, InputValidationProps>(
  (
    {
      label,
      rules = [],
      status = 'idle',
      errorMessage,
      successMessage,
      warningMessage,
      helperText,
      showIcon = true,
      onValidationChange,
      wrapperClassName = '',
      inputClassName = '',
      onChange,
      onBlur,
      value,
      ...props
    },
    ref
  ) => {
    const [internalStatus, setInternalStatus] = useState<ValidationStatus>(status);
    const [internalMessage, setInternalMessage] = useState<string>('');

    const validateInput = useCallback(
      (inputValue: string) => {
        if (!inputValue && !props.required) {
          setInternalStatus('idle');
          setInternalMessage('');
          onValidationChange?.('idle');
          return;
        }

        if (rules.length === 0) {
          setInternalStatus('success');
          setInternalMessage('');
          onValidationChange?.('success');
          return;
        }

        for (const rule of rules) {
          if (!rule.validate(inputValue)) {
            setInternalStatus('error');
            setInternalMessage(rule.message);
            onValidationChange?.('error', rule.message);
            return;
          }
        }

        setInternalStatus('success');
        setInternalMessage('');
        onValidationChange?.('success');
      },
      [rules, props.required, onValidationChange]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      validateInput(newValue);
      onChange?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      validateInput(e.target.value);
      onBlur?.(e);
    };

    const getStatusIcon = () => {
      if (!showIcon) return null;

      switch (internalStatus) {
        case 'success':
          return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'error':
          return <AlertCircle className="h-5 w-5 text-red-500" />;
        case 'warning':
          return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
        case 'validating':
          return (
            <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          );
        default:
          return null;
      }
    };

    const getInputBorderColor = () => {
      switch (internalStatus) {
        case 'success':
          return 'border-green-500 focus:ring-green-500';
        case 'error':
          return 'border-red-500 focus:ring-red-500';
        case 'warning':
          return 'border-yellow-500 focus:ring-yellow-500';
        case 'validating':
          return 'border-blue-500 focus:ring-blue-500';
        default:
          return 'border-border focus:ring-primary';
      }
    };

    const getMessage = () => {
      if (internalStatus === 'error' && errorMessage) return errorMessage;
      if (internalStatus === 'error' && internalMessage) return internalMessage;
      if (internalStatus === 'success' && successMessage) return successMessage;
      if (internalStatus === 'warning' && warningMessage) return warningMessage;
      return helperText;
    };

    const getMessageColor = () => {
      switch (internalStatus) {
        case 'success':
          return 'text-green-600 dark:text-green-400';
        case 'error':
          return 'text-red-600 dark:text-red-400';
        case 'warning':
          return 'text-yellow-600 dark:text-yellow-400';
        default:
          return 'text-muted-foreground';
      }
    };

    return (
      <div className={cn('flex flex-col gap-2', wrapperClassName)}>
        {/* Label */}
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative flex items-center">
          <input
            ref={ref}
            {...props}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
              getInputBorderColor(),
              showIcon && 'pr-10',
              inputClassName
            )}
          />

          {/* Status icon */}
          {getStatusIcon() && (
            <div className="absolute right-3 flex-shrink-0 pointer-events-none">
              {getStatusIcon()}
            </div>
          )}
        </div>

        {/* Message */}
        {getMessage() && (
          <p className={cn('text-xs font-medium', getMessageColor())}>
            {getMessage()}
          </p>
        )}
      </div>
    );
  }
);

InputValidation.displayName = 'InputValidation';

/**
 * TextareaValidation Component
 * 
 * Textarea field with real-time validation feedback
 */
export interface TextareaValidationProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Label text
   */
  label?: string;
  /**
   * Validation rules
   */
  rules?: ValidationRule[];
  /**
   * Validation status
   */
  status?: ValidationStatus;
  /**
   * Error message
   */
  errorMessage?: string;
  /**
   * Success message
   */
  successMessage?: string;
  /**
   * Warning message
   */
  warningMessage?: string;
  /**
   * Helper text
   */
  helperText?: string;
  /**
   * Show validation icon
   */
  showIcon?: boolean;
  /**
   * Callback on validation change
   */
  onValidationChange?: (status: ValidationStatus, message?: string) => void;
  /**
   * Custom className for wrapper
   */
  wrapperClassName?: string;
  /**
   * Custom className for textarea
   */
  textareaClassName?: string;
}

export const TextareaValidation = forwardRef<HTMLTextAreaElement, TextareaValidationProps>(
  (
    {
      label,
      rules = [],
      status = 'idle',
      errorMessage,
      successMessage,
      warningMessage,
      helperText,
      showIcon = true,
      onValidationChange,
      wrapperClassName = '',
      textareaClassName = '',
      onChange,
      onBlur,
      value,
      ...props
    },
    ref
  ) => {
    const [internalStatus, setInternalStatus] = useState<ValidationStatus>(status);
    const [internalMessage, setInternalMessage] = useState<string>('');

    const validateInput = useCallback(
      (inputValue: string) => {
        if (!inputValue && !props.required) {
          setInternalStatus('idle');
          setInternalMessage('');
          onValidationChange?.('idle');
          return;
        }

        if (rules.length === 0) {
          setInternalStatus('success');
          setInternalMessage('');
          onValidationChange?.('success');
          return;
        }

        for (const rule of rules) {
          if (!rule.validate(inputValue)) {
            setInternalStatus('error');
            setInternalMessage(rule.message);
            onValidationChange?.('error', rule.message);
            return;
          }
        }

        setInternalStatus('success');
        setInternalMessage('');
        onValidationChange?.('success');
      },
      [rules, props.required, onValidationChange]
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      validateInput(newValue);
      onChange?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      validateInput(e.target.value);
      onBlur?.(e);
    };

    const getInputBorderColor = () => {
      switch (internalStatus) {
        case 'success':
          return 'border-green-500 focus:ring-green-500';
        case 'error':
          return 'border-red-500 focus:ring-red-500';
        case 'warning':
          return 'border-yellow-500 focus:ring-yellow-500';
        case 'validating':
          return 'border-blue-500 focus:ring-blue-500';
        default:
          return 'border-border focus:ring-primary';
      }
    };

    const getMessage = () => {
      if (internalStatus === 'error' && errorMessage) return errorMessage;
      if (internalStatus === 'error' && internalMessage) return internalMessage;
      if (internalStatus === 'success' && successMessage) return successMessage;
      if (internalStatus === 'warning' && warningMessage) return warningMessage;
      return helperText;
    };

    const getMessageColor = () => {
      switch (internalStatus) {
        case 'success':
          return 'text-green-600 dark:text-green-400';
        case 'error':
          return 'text-red-600 dark:text-red-400';
        case 'warning':
          return 'text-yellow-600 dark:text-yellow-400';
        default:
          return 'text-muted-foreground';
      }
    };

    return (
      <div className={cn('flex flex-col gap-2', wrapperClassName)}>
        {/* Label */}
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          {...props}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            'flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none',
            getInputBorderColor(),
            textareaClassName
          )}
        />

        {/* Message */}
        {getMessage() && (
          <p className={cn('text-xs font-medium', getMessageColor())}>
            {getMessage()}
          </p>
        )}
      </div>
    );
  }
);

TextareaValidation.displayName = 'TextareaValidation';

/**
 * Common validation rules
 */
export const ValidationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    validate: (value) => value.trim().length > 0,
    message,
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),

  minLength: (length: number, message?: string): ValidationRule => ({
    validate: (value) => value.length >= length,
    message: message || `Minimum ${length} characters required`,
  }),

  maxLength: (length: number, message?: string): ValidationRule => ({
    validate: (value) => value.length <= length,
    message: message || `Maximum ${length} characters allowed`,
  }),

  pattern: (pattern: RegExp, message = 'Invalid format'): ValidationRule => ({
    validate: (value) => pattern.test(value),
    message,
  }),

  numeric: (message = 'Please enter a valid number'): ValidationRule => ({
    validate: (value) => /^\d+(\.\d+)?$/.test(value),
    message,
  }),

  phone: (message = 'Please enter a valid phone number'): ValidationRule => ({
    validate: (value) => /^[\d\s\-\+\(\)]+$/.test(value) && value.replace(/\D/g, '').length >= 10,
    message,
  }),

  url: (message = 'Please enter a valid URL'): ValidationRule => ({
    validate: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  strongPassword: (message = 'Password must contain uppercase, lowercase, number, and special character'): ValidationRule => ({
    validate: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value),
    message,
  }),

  custom: (validate: (value: string) => boolean, message: string): ValidationRule => ({
    validate,
    message,
  }),
};
