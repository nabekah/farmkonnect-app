import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  message?: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

/**
 * Form validation hook for enforcing validation rules
 */
export function useFormValidation(rules: Record<string, ValidationRule>) {
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = useCallback((fieldName: string, value: any): string | undefined => {
    const rule = rules[fieldName];
    if (!rule) return undefined;

    // Check required
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return rule.message || `${fieldName} is required`;
    }

    // Check minLength
    if (rule.minLength && value && value.length < rule.minLength) {
      return rule.message || `${fieldName} must be at least ${rule.minLength} characters`;
    }

    // Check maxLength
    if (rule.maxLength && value && value.length > rule.maxLength) {
      return rule.message || `${fieldName} must be at most ${rule.maxLength} characters`;
    }

    // Check pattern
    if (rule.pattern && value && !rule.pattern.test(value)) {
      return rule.message || `${fieldName} format is invalid`;
    }

    // Check custom validation
    if (rule.custom) {
      const result = rule.custom(value);
      if (result !== true) {
        return typeof result === 'string' ? result : rule.message || `${fieldName} is invalid`;
      }
    }

    return undefined;
  }, [rules]);

  const validateForm = useCallback((formData: Record<string, any>): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(rules).forEach((fieldName) => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [rules, validateField]);

  const clearError = useCallback((fieldName: string) => {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: undefined,
    }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearError,
    clearAllErrors,
  };
}
