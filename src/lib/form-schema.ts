import { ROLES } from "@/config/nav";
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

// user-schema
const passwordRule = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[a-z]/, "Include at least one lowercase letter")
  .regex(/\d/, "Include at least one number");

export const getUserSchema = (isEdit: boolean) =>
  z
    .object({
      names: requiredString.min(2, "Enter full names"),
      email: requiredString.email("Enter a valid email address"),
      phoneNumber: requiredString.regex(
        /^\+\d{8,15}$/,
        "Enter a valid phone number",
      ),
      role: z
        .string()
        .min(1, "Select a role")
        .refine((r) => ROLES.includes(r), "Select a valid role"),
      password: z.string(),
    })
    .superRefine((data, ctx) => {
      // on edit, a blank password means "keep the current one"
      if (isEdit && data.password === "") return;

      const result = passwordRule.safeParse(data.password);
      if (!result.success) {
        ctx.addIssue({
          code: "custom",
          path: ["password"],
          message: result.error.issues[0].message,
        });
      }
    });

export type UserFormValues = z.infer<ReturnType<typeof getUserSchema>>;
