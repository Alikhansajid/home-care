import { z } from "zod";

export const signupSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["homeowner", "technician"]),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const homeSchema = z.object({
  name: z.string().min(1, "Home name is required"),
  address: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  size_sqft: z.coerce.number().optional(),
  year_built: z.coerce.number().min(1800).max(2026).optional(),
  notes: z.string().optional(),
});

export const applianceSchema = z.object({
  name: z.string().min(1, "Appliance name is required"),
  category: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  installation_date: z.string().optional(),
  warranty_expiry: z.string().optional(),
  notes: z.string().optional(),
});

export const maintenanceTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  frequency_days: z.coerce.number().optional(),
  next_due_date: z.string().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
});

export const expenseSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().optional(),
  date: z.string().optional(),
  notes: z.string().optional(),
});

export const technicianListingSchema = z.object({
  category: z.string().min(1, "Service category is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  hourly_rate: z.coerce.number().positive("Rate must be positive"),
  country: z.string().min(1, "Country is required"),
  state: z.string().optional(),
  city: z.string().optional(),
});

export const serviceRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  scheduled_date: z.string().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type HomeInput = z.infer<typeof homeSchema>;
export type ApplianceInput = z.infer<typeof applianceSchema>;
export type MaintenanceTaskInput = z.infer<typeof maintenanceTaskSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type TechnicianListingInput = z.infer<typeof technicianListingSchema>;
export type ServiceRequestInput = z.infer<typeof serviceRequestSchema>;
