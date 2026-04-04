import { ShiftType } from '@/generated/prisma/enums';
import { z } from 'zod';

// Library Validation
export const librarySchema = z.object({
  name: z.string().min(1, 'Library name is required').max(255),
  email: z.email('Invalid email address'),
  contactNumber: z.string().min(10, 'Invalid phone number'),
  address: z.string().min(5, 'Address must be at least 5 characters').max(500),
  district: z.string().min(2, 'District is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{5,6}$/, 'Invalid pincode'),
  facilities: z.array(z.string()),
});

export type Library = z.infer<typeof librarySchema> & { id: string };

// Floor Validation
export const floorSchema = z.object({
  name: z.string().min(1, 'Floor name is required').max(100),
  totalSeats: z.number("No. of seats is required").int('Seats must be a whole number').min(1, 'At least 1 seat required').max(1000),
});

export const floorWithIdSchema = floorSchema.extend({
  id: z.cuid(),
});

export type Floor = z.infer<typeof floorWithIdSchema>;
export type FloorInput = z.infer<typeof floorSchema>;

// Shift Validation
export const shiftSchema = z.object({
  name: z.enum(ShiftType),
  startTime: z.number().min(0).max(1440),
  endTime: z.number().min(0).max(1440),
  price: z.number("Monthly price is required").min(0, 'Price cannot be negative').max(999999),
  isActive: z.boolean(),
});

export const shiftWithIdSchema = shiftSchema.extend({
  id: z.cuid(),
});

export type Shift = z.infer<typeof shiftWithIdSchema>;
export type ShiftInput = z.infer<typeof shiftSchema>;

// API Response Schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
  data: z.unknown().optional(),
});

export const errorResponseSchema = z.object({
  error: z.string(),
  status: z.number().optional(),
});

// Form State Validation
export const libraryFormSchema = librarySchema.extend({
  id: z.string().optional(),
});

export type LibraryFormState = z.infer<typeof libraryFormSchema>;

// Master Setup Validation
export const librarySetupSchema = librarySchema.extend({
  floors: z.array(floorSchema).min(1, 'At least one floor is required'),
  shifts: z.array(shiftSchema)
    .refine((shifts) => shifts.some(s => s.isActive), {
      message: 'At least one active shift is required',
    }),
});

// payload type for library setup
export type LibrarySetupPayload = z.input<typeof librarySetupSchema>;