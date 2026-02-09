import { z } from 'zod';

/**
 * Centralized validation schemas for all forms and operations
 * Using Zod for runtime type checking and validation
 */

// Farm validation schemas
export const farmSchema = z.object({
  name: z.string().min(2, 'Farm name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  farmType: z.enum(['Crop', 'Livestock', 'Mixed', 'Dairy', 'Poultry']),
  location: z.string().min(2, 'Location is required'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  size: z.number().positive('Farm size must be positive'),
  sizeUnit: z.enum(['hectares', 'acres']),
  contactPerson: z.string().min(2).optional(),
  contactPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  email: z.string().email().optional(),
});

// Crop validation schemas
export const cropSchema = z.object({
  farmId: z.number().positive(),
  cropName: z.string().min(2, 'Crop name is required').max(100),
  variety: z.string().min(2).max(100),
  plantingDate: z.date(),
  expectedHarvestDate: z.date(),
  area: z.number().positive('Area must be positive'),
  areaUnit: z.enum(['hectares', 'acres']),
  seedVariety: z.string().optional(),
  notes: z.string().max(500).optional(),
});

// Livestock validation schemas
export const animalSchema = z.object({
  farmId: z.number().positive(),
  animalType: z.enum(['Cattle', 'Goat', 'Sheep', 'Pig', 'Poultry', 'Rabbit', 'Fish']),
  breed: z.string().min(2).max(100),
  tagNumber: z.string().min(1).max(50),
  dateOfBirth: z.date(),
  weight: z.number().positive('Weight must be positive').optional(),
  weightUnit: z.enum(['kg', 'lbs']).optional(),
  status: z.enum(['Healthy', 'Sick', 'Injured', 'Quarantined']),
  notes: z.string().max(500).optional(),
});

// Health record validation
export const healthRecordSchema = z.object({
  animalId: z.number().positive(),
  recordDate: z.date(),
  healthStatus: z.enum(['Healthy', 'Sick', 'Injured', 'Recovering']),
  symptoms: z.string().max(500).optional(),
  treatment: z.string().max(500).optional(),
  veterinarianNotes: z.string().max(500).optional(),
  cost: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid cost format').optional(),
});

// Vaccination validation
export const vaccinationSchema = z.object({
  animalId: z.number().positive(),
  vaccineName: z.string().min(2).max(100),
  vaccinationDate: z.date(),
  nextDueDate: z.date(),
  veterinarian: z.string().min(2).max(100),
  batchNumber: z.string().optional(),
  notes: z.string().max(500).optional(),
});

// Marketplace product validation
export const productSchema = z.object({
  farmId: z.number().positive(),
  name: z.string().min(2, 'Product name is required').max(100),
  description: z.string().max(500),
  category: z.enum(['Produce', 'Livestock', 'Dairy', 'Grains', 'Equipment', 'Seeds', 'Other']),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1).max(50),
  image: z.string().url().optional(),
});

// Order validation
export const orderSchema = z.object({
  buyerId: z.number().positive(),
  totalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format'),
  deliveryAddress: z.string().min(5, 'Delivery address is required'),
  deliveryDate: z.date().optional(),
  notes: z.string().max(500).optional(),
});

// Payment validation
export const paymentSchema = z.object({
  orderId: z.number().positive(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format'),
  paymentMethod: z.enum(['Cash', 'Mobile Money', 'Bank Transfer', 'Card']),
  transactionId: z.string().optional(),
  notes: z.string().max(500).optional(),
});

// Worker validation
export const workerSchema = z.object({
  farmId: z.number().positive(),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  role: z.enum(['Manager', 'Supervisor', 'Field Worker', 'Veterinarian', 'Equipment Operator']),
  dateOfHire: z.date(),
  salary: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid salary format'),
  ssnitNumber: z.string().optional(),
  bankAccount: z.string().optional(),
});

// Attendance validation
export const attendanceSchema = z.object({
  workerId: z.number().positive(),
  date: z.date(),
  clockInTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  clockOutTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)').optional(),
  status: z.enum(['Present', 'Absent', 'Late', 'Half Day']),
  notes: z.string().max(500).optional(),
});

// Equipment validation
export const equipmentSchema = z.object({
  farmId: z.number().positive(),
  name: z.string().min(2, 'Equipment name is required').max(100),
  type: z.enum(['Tractor', 'Pump', 'Sprayer', 'Harvester', 'Plough', 'Other']),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.date(),
  purchaseCost: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid cost format'),
  status: z.enum(['Operational', 'Under Maintenance', 'Broken', 'Retired']),
  notes: z.string().max(500).optional(),
});

// Maintenance validation
export const maintenanceSchema = z.object({
  equipmentId: z.number().positive(),
  maintenanceDate: z.date(),
  maintenanceType: z.enum(['Routine', 'Repair', 'Inspection', 'Cleaning']),
  description: z.string().min(5, 'Description is required').max(500),
  cost: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid cost format').optional(),
  nextMaintenanceDate: z.date().optional(),
  notes: z.string().max(500).optional(),
});

// Fuel tracking validation
export const fuelSchema = z.object({
  equipmentId: z.number().positive(),
  date: z.date(),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.enum(['liters', 'gallons']),
  cost: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid cost format'),
  meterReading: z.number().positive().optional(),
  notes: z.string().max(500).optional(),
});

// Veterinary appointment validation
export const veterinaryAppointmentSchema = z.object({
  farmId: z.number().positive(),
  animalId: z.number().positive().optional(),
  appointmentType: z.enum(['Consultation', 'Vaccination', 'Treatment', 'Surgery', 'Follow-up']),
  appointmentDate: z.date(),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  veterinarian: z.string().min(2).max(100),
  reason: z.string().min(5, 'Reason is required').max(500),
  estimatedCost: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid cost format').optional(),
  notes: z.string().max(500).optional(),
});

// Prescription validation
export const prescriptionSchema = z.object({
  appointmentId: z.number().positive(),
  animalId: z.number().positive(),
  prescriptionDate: z.date(),
  expiryDate: z.date(),
  veterinarian: z.string().min(2).max(100),
  instructions: z.string().min(10, 'Instructions are required').max(1000),
  medications: z.array(
    z.object({
      name: z.string().min(2),
      dosage: z.string().min(2),
      frequency: z.string().min(2),
      duration: z.number().positive(),
      quantity: z.number().positive(),
    })
  ),
  notes: z.string().max(500).optional(),
});

// Payroll validation
export const payrollSchema = z.object({
  workerId: z.number().positive(),
  payPeriodStart: z.date(),
  payPeriodEnd: z.date(),
  baseSalary: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid salary format'),
  hoursWorked: z.number().positive().optional(),
  overtimeHours: z.number().nonnegative().optional(),
  bonuses: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid bonus format').optional(),
  deductions: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid deduction format').optional(),
  notes: z.string().max(500).optional(),
});

// Training course validation
export const trainingCourseSchema = z.object({
  farmId: z.number().positive(),
  courseName: z.string().min(2, 'Course name is required').max(100),
  description: z.string().max(500),
  duration: z.number().positive('Duration must be positive'),
  durationUnit: z.enum(['days', 'weeks', 'months']),
  instructor: z.string().min(2).max(100),
  startDate: z.date(),
  endDate: z.date(),
  maxParticipants: z.number().positive().optional(),
  cost: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid cost format').optional(),
});

// Breeding record validation
export const breedingRecordSchema = z.object({
  sireId: z.number().positive('Sire is required'),
  damId: z.number().positive('Dam is required'),
  breedingDate: z.date(),
  expectedDueDate: z.date(),
  notes: z.string().max(500).optional(),
});

/**
 * Utility function to validate data and return errors
 */
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { valid: boolean; errors?: Record<string, string>; data?: T } => {
  try {
    const validated = schema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { valid: false, errors };
    }
    return { valid: false, errors: { general: 'Validation failed' } };
  }
};

/**
 * Create a user-friendly error message from validation errors
 */
export const formatValidationErrors = (errors: Record<string, string>): string => {
  return Object.entries(errors)
    .map(([field, message]) => `${field}: ${message}`)
    .join('\n');
};
