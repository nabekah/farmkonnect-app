/**
 * Validation Rule Enforcer
 * Applies admin-defined validation rules to form fields
 */

export interface ValidationRule {
  id: number;
  entityType: string;
  fieldName: string;
  ruleType: 'required' | 'min' | 'max' | 'pattern' | 'enum' | 'custom';
  ruleValue: string;
  errorMessage: string;
  isActive: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  ruleType: string;
}

export function validateFieldAgainstRules(
  fieldName: string,
  fieldValue: any,
  rules: ValidationRule[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  const applicableRules = rules.filter(
    (r) => r.fieldName === fieldName && r.isActive
  );

  for (const rule of applicableRules) {
    const error = validateSingleRule(fieldValue, rule);
    if (error) {
      errors.push(error);
    }
  }

  return errors;
}

function validateSingleRule(
  value: any,
  rule: ValidationRule
): ValidationError | null {
  switch (rule.ruleType) {
    case 'required':
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return {
          field: rule.fieldName,
          message: rule.errorMessage || `${rule.fieldName} is required`,
          ruleType: 'required',
        };
      }
      break;

    case 'min':
      const minValue = parseInt(rule.ruleValue);
      if (typeof value === 'string' && value.length < minValue) {
        return {
          field: rule.fieldName,
          message:
            rule.errorMessage ||
            `${rule.fieldName} must be at least ${minValue} characters`,
          ruleType: 'min',
        };
      }
      if (typeof value === 'number' && value < minValue) {
        return {
          field: rule.fieldName,
          message:
            rule.errorMessage ||
            `${rule.fieldName} must be at least ${minValue}`,
          ruleType: 'min',
        };
      }
      break;

    case 'max':
      const maxValue = parseInt(rule.ruleValue);
      if (typeof value === 'string' && value.length > maxValue) {
        return {
          field: rule.fieldName,
          message:
            rule.errorMessage ||
            `${rule.fieldName} must not exceed ${maxValue} characters`,
          ruleType: 'max',
        };
      }
      if (typeof value === 'number' && value > maxValue) {
        return {
          field: rule.fieldName,
          message:
            rule.errorMessage ||
            `${rule.fieldName} must not exceed ${maxValue}`,
          ruleType: 'max',
        };
      }
      break;

    case 'pattern':
      try {
        const regex = new RegExp(rule.ruleValue);
        if (typeof value === 'string' && !regex.test(value)) {
          return {
            field: rule.fieldName,
            message:
              rule.errorMessage ||
              `${rule.fieldName} format is invalid`,
            ruleType: 'pattern',
          };
        }
      } catch (e) {
        console.error('Invalid regex pattern:', rule.ruleValue);
      }
      break;

    case 'enum':
      try {
        const allowedValues = JSON.parse(rule.ruleValue);
        if (!allowedValues.includes(value)) {
          return {
            field: rule.fieldName,
            message:
              rule.errorMessage ||
              `${rule.fieldName} must be one of: ${allowedValues.join(', ')}`,
            ruleType: 'enum',
          };
        }
      } catch (e) {
        console.error('Invalid enum values:', rule.ruleValue);
      }
      break;

    case 'custom':
      // Custom rules would require custom validation logic
      // For now, we'll skip them
      break;
  }

  return null;
}

export function validateFormAgainstRules(
  formData: Record<string, any>,
  rules: ValidationRule[]
): Record<string, ValidationError[]> {
  const errors: Record<string, ValidationError[]> = {};

  // Get all unique field names from rules
  const fieldNames = Array.from(new Set(rules.map((r) => r.fieldName)));

  for (const fieldName of fieldNames) {
    const fieldErrors = validateFieldAgainstRules(
      fieldName,
      formData[fieldName],
      rules
    );
    if (fieldErrors.length > 0) {
      errors[fieldName] = fieldErrors;
    }
  }

  return errors;
}

export function hasValidationErrors(
  errors: Record<string, ValidationError[]>
): boolean {
  return Object.values(errors).some((fieldErrors) => fieldErrors.length > 0);
}

export function getFirstErrorMessage(
  errors: Record<string, ValidationError[]>,
  fieldName: string
): string | null {
  const fieldErrors = errors[fieldName];
  if (fieldErrors && fieldErrors.length > 0) {
    return fieldErrors[0].message;
  }
  return null;
}
