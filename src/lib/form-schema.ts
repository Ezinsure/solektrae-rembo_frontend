import { z } from "zod";

export const iremboSchema = z.object({
  // Step 1
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .min(8, "Enter a valid phone number")
    .refine((v) => v.startsWith("+"), "Phone must include country code"),
  service: z.string().min(1, "Please choose a service"),

  // Step 2
  height: z
    .string()
    .min(1, "Height is required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Enter a valid height"),
  villageHeadName: z.string().min(2, "Head of village name is required"),
  villageHeadPhone: z.string().min(6, "Enter a valid phone number"),
  district: z.string().min(2, "District is required"),
  sector: z.string().min(2, "Sector is required"),
  cell: z.string().optional().or(z.literal("")),
  village: z.string().min(2, "Village is required"),
});

export type IremboFormValues = z.infer<typeof iremboSchema>;

// Field groups per step for validation
export const STEP_FIELDS: Record<1 | 2, (keyof IremboFormValues)[]> = {
  1: ["name", "email", "phone", "service"],
  2: [
    "height",
    "villageHeadName",
    "villageHeadPhone",
    "district",
    "sector",
    "village",
  ],
};

// login-schema
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;
