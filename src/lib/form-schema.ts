import { ROLES } from "@/config/nav";
import { z } from "zod";

const requiredString = z.string().min(1, "Field is required");

export const STEP2_ALL_FIELDS = [
  "fatherName",
  "motherName",
  "spouseName",
  "height",
  "hovName",
  "hovNumber",
  "district",
  "sector",
  "cell",
  "village",
  "street",
  "service",
] as const;

export type Step2Field = (typeof STEP2_ALL_FIELDS)[number];

const KNOWN_SERVICE_VALUES = [
  "passport",
  "laisserpasser",
  "foreignid",
  "visa",
  "permit",
  "cpgl",
  "penalty",
];

export const SERVICE_FIELD_CONFIG: Record<string, Step2Field[]> = {
  passport: [
    "height",
    "hovName",
    "hovNumber",
    "district",
    "sector",
    "cell",
    "village",
  ],
  laisserpasser: [
    "height",
    "hovName",
    "hovNumber",
    "district",
    "sector",
    "cell",
    "village",
  ],
  foreignid: ["height", "hovName", "hovNumber"],
  visa: [
    "fatherName",
    "motherName",
    "spouseName",
    "district",
    "sector",
    "cell",
    "village",
    "street",
  ],
  permit: [
    "fatherName",
    "motherName",
    "spouseName",
    "district",
    "sector",
    "cell",
    "village",
    "street",
  ],
  cpgl: [
    "fatherName",
    "motherName",
    "hovName",
    "hovNumber",
    "district",
    "sector",
    "cell",
    "village",
  ],
  penalty: ["height", "hovNumber", "hovName"],
  others: [
    "fatherName",
    "motherName",
    "spouseName",
    "district",
    "sector",
    "cell",
    "village",
    "street",
    "service",
  ],
};

export function getStep2Fields(service: string): Step2Field[] {
  if (KNOWN_SERVICE_VALUES.includes(service)) {
    return SERVICE_FIELD_CONFIG[service] ?? SERVICE_FIELD_CONFIG.others;
  }
  return SERVICE_FIELD_CONFIG.others;
}

export const FIELD_META: Record<Step2Field, { label: string; type?: string }> =
  {
    fatherName: { label: "Father's Names / Noms du père / Amazina ya Se *" },
    motherName: {
      label: "Mother's Names / Noms de la mère / Amazina ya Nyina *",
    },
    spouseName: {
      label:
        "Spouse's Name / Nom du conjoint ~ de la conjointe / Izina ry'Uwo Bashakanye *",
    },
    height: { label: "Height / Taille / Uburebure (Cm) *", type: "number" },
    hovName: {
      label:
        "Name of the Head of Village / Nom du chef du village / Amazina y'umukuru w'umudugudu *",
    },
    hovNumber: {
      label:
        "Phone Number of the Head of Village / Numéro de téléphone du chef du village / Telefone y'umukuru w'umudugudu *",
      type: "tel",
    },
    district: { label: "District / Akarere *" },
    sector: { label: "Sector / Umurenge *" },
    cell: { label: "Cell / Akagari *" },
    village: { label: "Village / Umudugudu *" },
    street: { label: "Street Number / Numéro de rue / Nomero y'Umuhanda *" },
    service: { label: "Service Name / Nom du Service / Izina rya Serivisi *" },
  };

export const iremboSchema = z
  .object({
    name: requiredString.min(2, "Enter names"),
    email: requiredString.email("Enter a valid email address"),
    phone: requiredString.regex(/^\+\d{8,15}$/, "Enter a valid phone number"),
    service: requiredString,
    fatherName: z.string(),
    motherName: z.string(),
    spouseName: z.string(),
    district: z.string(),
    sector: z.string(),
    cell: z.string(),
    village: z.string(),
    street: z.string(),
    height: z.string(),
    hovName: z.string(),
    hovNumber: z.string(),
  })
  .superRefine((data, ctx) => {
    const required = getStep2Fields(data.service);
    for (const field of required) {
      if (!data[field] || data[field].trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: "Field is required",
        });
      }
    }
  });

export type IremboFormValues = z.infer<typeof iremboSchema>;

export function getStep1Fields(
  selectedOption: string,
): (keyof IremboFormValues)[] {
  const base: (keyof IremboFormValues)[] = ["name", "email", "phone"];
  if (selectedOption !== "others") base.push("service");
  return base;
}

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
