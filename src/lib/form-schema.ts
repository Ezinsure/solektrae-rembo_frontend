import { z } from "zod";

const requiredString = z.string().min(1, "Field is required");

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
      roleId: z.string(),
      password: z.string(),
    })
    .superRefine((data, ctx) => {
      // a new user must get a role (on edit, empty = keep the current one)
      if (!isEdit && !data.roleId) {
        ctx.addIssue({
          code: "custom",
          path: ["roleId"],
          message: "Select a role",
        });
      }

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
