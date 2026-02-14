import { forwardRef, ReactNode, FormEvent, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';

export interface FormField {
  /**
   * Field name
   */
  name: string;
  /**
   * Field value
   */
  value: any;
  /**
   * Field error
   */
  error?: string;
  /**
   * Is field touched
   */
  touched?: boolean;
}

export interface FormState {
  /**
   * Form values
   */
  values: Record<string, any>;
  /**
   * Form errors
   */
  errors: Record<string, string>;
  /**
   * Touched fields
   */
  touched: Record<string, boolean>;
  /**
   * Is form submitting
   */
  isSubmitting: boolean;
  /**
   * Is form valid
   */
  isValid: boolean;
}

export interface FormProps {
  /**
   * Form children
   */
  children: ReactNode;
  /**
   * On form submit
   */
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  /**
   * Initial values
   */
  initialValues?: Record<string, any>;
  /**
   * Validate function
   */
  validate?: (values: Record<string, any>) => Record<string, string>;
  /**
   * Custom className
   */
  className?: string;
}

/**
 * Form Component
 * 
 * Wrapper for form with validation and error handling
 */
export const Form = forwardRef<HTMLFormElement, FormProps>(
  (
    {
      children,
      onSubmit,
      initialValues = {},
      validate,
      className = '',
    },
    ref
  ) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = useCallback(
      async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate
        const validationErrors = validate?.(values) || {};
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
          setIsSubmitting(true);
          try {
            await onSubmit(values);
          } finally {
            setIsSubmitting(false);
          }
        }
      },
      [values, validate, onSubmit]
    );

    const handleChange = useCallback((name: string, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }, [errors]);

    const handleBlur = useCallback((name: string) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }, []);

    const formContextValue = {
      values,
      errors,
      touched,
      isSubmitting,
      handleChange,
      handleBlur,
    };

    return (
      <form
        ref={ref}
        onSubmit={handleSubmit}
        className={cn('space-y-4', className)}
      >
        {typeof children === 'function'
          ? children(formContextValue)
          : children}
      </form>
    );
  }
);

Form.displayName = 'Form';

/**
 * FormField Component
 */
export interface FormFieldProps {
  /**
   * Field name
   */
  name: string;
  /**
   * Field label
   */
  label?: string;
  /**
   * Field type
   */
  type?: string;
  /**
   * Placeholder
   */
  placeholder?: string;
  /**
   * Is required
   */
  required?: boolean;
  /**
   * Helper text
   */
  helperText?: string;
  /**
   * Custom className
   */
  className?: string;
  /**
   * Form context
   */
  formContext?: {
    values: Record<string, any>;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    isSubmitting: boolean;
    handleChange: (name: string, value: any) => void;
    handleBlur: (name: string) => void;
  };
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      name,
      label,
      type = 'text',
      placeholder,
      required = false,
      helperText,
      className = '',
      formContext,
    },
    ref
  ) => {
    const value = formContext?.values[name] || '';
    const error = formContext?.errors[name];
    const touched = formContext?.touched[name];
    const isSubmitting = formContext?.isSubmitting;

    const showError = touched && error;

    return (
      <div className={cn('flex flex-col gap-2', className)}>
        {label && (
          <label htmlFor={name} className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={isSubmitting}
          onChange={(e) => formContext?.handleChange(name, e.target.value)}
          onBlur={() => formContext?.handleBlur(name)}
          className={cn(
            'px-3 py-2 rounded-md border bg-background text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            'transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
            showError && 'border-destructive focus:ring-destructive'
          )}
        />

        {showError && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {helperText && !showError && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

/**
 * FormGroup Component
 */
export interface FormGroupProps {
  /**
   * Group label
   */
  label?: string;
  /**
   * Group description
   */
  description?: string;
  /**
   * Group children
   */
  children: ReactNode;
  /**
   * Custom className
   */
  className?: string;
}

export const FormGroup = forwardRef<HTMLDivElement, FormGroupProps>(
  (
    {
      label,
      description,
      children,
      className = '',
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-3', className)}
      >
        {label && (
          <div>
            <h3 className="font-semibold text-sm">{label}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          {children}
        </div>
      </div>
    );
  }
);

FormGroup.displayName = 'FormGroup';

/**
 * FormActions Component
 */
export interface FormActionsProps {
  /**
   * Submit button label
   */
  submitLabel?: string;
  /**
   * Cancel button label
   */
  cancelLabel?: string;
  /**
   * On cancel callback
   */
  onCancel?: () => void;
  /**
   * Is submitting
   */
  isSubmitting?: boolean;
  /**
   * Custom className
   */
  className?: string;
}

export const FormActions = forwardRef<HTMLDivElement, FormActionsProps>(
  (
    {
      submitLabel = 'Submit',
      cancelLabel = 'Cancel',
      onCancel,
      isSubmitting = false,
      className = '',
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('flex gap-3 justify-end', className)}
      >
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className={cn(
              'px-4 py-2 rounded-md border border-input',
              'hover:bg-muted transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {cancelLabel}
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium',
            'hover:bg-primary/90 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isSubmitting ? 'Loading...' : submitLabel}
        </button>
      </div>
    );
  }
);

FormActions.displayName = 'FormActions';

/**
 * useForm Hook
 * 
 * Manage form state
 */
export function useForm(
  initialValues: Record<string, any>,
  onSubmit: (values: Record<string, any>) => void | Promise<void>,
  validate?: (values: Record<string, any>) => Record<string, string>
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleBlur = useCallback((name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const handleSubmit = useCallback(
    async (e?: FormEvent<HTMLFormElement>) => {
      e?.preventDefault();

      const validationErrors = validate?.(values) || {};
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length === 0) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [values, validate, onSubmit]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setFieldValue = useCallback((name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name: string, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
  };
}
