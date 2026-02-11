import { z } from 'zod';

/**
 * Common validation schemas for reuse across the application
 */

// User validation
export const userSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(['admin', 'user']),
});

// Farm validation
export const farmSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  name: z.string().min(1).max(255),
  location: z.string().min(1).max(255),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  size: z.number().positive().optional(),
});

// Animal validation
export const animalSchema = z.object({
  id: z.number().int().positive(),
  farmId: z.number().int().positive(),
  name: z.string().min(1).max(255),
  type: z.enum(['cattle', 'poultry', 'goats', 'sheep', 'pigs', 'horses', 'other']),
  breed: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  weight: z.number().positive().optional(),
  status: z.enum(['healthy', 'sick', 'quarantined', 'deceased']).optional(),
});

// Expense validation
export const expenseSchema = z.object({
  farmId: z.string().or(z.number()),
  expenseType: z.string().min(1).max(50),
  description: z.string().min(1).max(500),
  amount: z.number().positive('Amount must be greater than 0'),
  expenseDate: z.string().or(z.date()),
  vendor: z.string().optional(),
  animalId: z.string().optional(),
  invoiceNumber: z.string().optional(),
  paymentStatus: z.enum(['pending', 'paid', 'partial']).optional(),
});

// Revenue validation
export const revenueSchema = z.object({
  farmId: z.string().or(z.number()),
  revenueType: z.enum(['animal_sale', 'milk_production', 'egg_production', 'wool_production', 'meat_sale', 'crop_sale', 'produce_sale', 'breeding_service', 'other']),
  description: z.string().min(1).max(500),
  amount: z.number().positive('Amount must be greater than 0'),
  revenueDate: z.string().or(z.date()),
  buyer: z.string().optional(),
  animalId: z.string().optional(),
  quantity: z.number().positive().optional(),
  unitPrice: z.number().positive().optional(),
});

// Crop validation
export const cropSchema = z.object({
  farmId: z.number().int().positive(),
  name: z.string().min(1).max(255),
  variety: z.string().optional(),
  plantingDate: z.string().datetime().optional(),
  harvestDate: z.string().datetime().optional(),
  expectedYield: z.number().positive().optional(),
  actualYield: z.number().positive().optional(),
  status: z.enum(['planning', 'planted', 'growing', 'harvesting', 'harvested']).optional(),
});

// Veterinary appointment validation
export const vetAppointmentSchema = z.object({
  farmId: z.string().or(z.number()),
  animalId: z.string().or(z.number()),
  veterinarianId: z.string().or(z.number()),
  appointmentDate: z.string().datetime(),
  reason: z.string().min(1).max(500),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
  notes: z.string().optional(),
});

// Medication validation
export const medicationSchema = z.object({
  farmId: z.number().int().positive(),
  name: z.string().min(1).max(255),
  type: z.string().min(1).max(100),
  quantity: z.number().positive(),
  unit: z.string().min(1).max(50),
  expiryDate: z.string().datetime().optional(),
  cost: z.number().positive().optional(),
  supplier: z.string().optional(),
});

// Budget validation
export const budgetSchema = z.object({
  farmId: z.number().int().positive(),
  category: z.string().min(1).max(100),
  budgetedAmount: z.number().positive('Budget amount must be greater than 0'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  notes: z.string().optional(),
});

// Pagination validation
export const paginationSchema = z.object({
  limit: z.number().int().positive().default(50).max(1000),
  offset: z.number().int().nonnegative().default(0),
});

// Date range validation
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Error response schema
export const errorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.any()).optional(),
  timestamp: z.string().datetime(),
});

/**
 * Validation error formatter
 */
export function formatValidationError(error: z.ZodError) {
  return {
    code: 'VALIDATION_ERROR',
    message: 'Input validation failed',
    details: error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
      code: err.code,
    })),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Safe parse wrapper
 */
export async function safeValidate<T>(
  schema: z.ZodSchema,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; error: ReturnType<typeof formatValidationError> }> {
  try {
    const result = await schema.parseAsync(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: formatValidationError(error) };
    }
    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred during validation',
        timestamp: new Date().toISOString(),
      },
    };
  }
}
