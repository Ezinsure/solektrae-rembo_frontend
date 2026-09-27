import { z } from "zod";

const requiredString = z.string().min(1, "Field is required");

export const iremboSchema = z.object({
  name: requiredString.min(2, "Enter  names"),
  email: requiredString.email("Enter a valid email address"),
  phone: requiredString.regex(/^\+\d{8,15}$/, "Enter a valid phone number"),
  service: requiredString,
  fatherName: requiredString,
  motherName: requiredString,
  spouseName: requiredString,
  district: requiredString,
  sector: requiredString,
  cell: requiredString,
  village: requiredString,
  street: requiredString,
  height: requiredString,
  hovName: requiredString,
  hovNumber: requiredString,
});

export type IremboFormValues = z.infer<typeof iremboSchema>;

// Field groups per step for validation
export const STEP_FIELDS: Record<1 | 2, (keyof IremboFormValues)[]> = {
  1: [
    "name",
    "email",
    "phone",
    "service",
    "fatherName",
    "motherName",
    "spouseName",
  ],
  2: [
    "district",
    "sector",
    "village",
    "cell",
    "street",
    "hovNumber",
    "hovName",
    "height",
  ],
};

// login-schema
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;
