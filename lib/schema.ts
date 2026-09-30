import { z } from "zod";

const nonempty = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message);

export const cleaningRequestSchema = z.object({
  service: z.enum(
    [
      "Residential cleaning",
      "Deep cleaning",
      "Move-in / move-out",
      "Other",
    ],
    { error: "Choose the service you need" },
  ),
  address: nonempty("Enter the property address").max(
    300,
    "Address is too long",
  ),
  property_type: nonempty("Select a property type"),
  bedrooms: nonempty("Select the number of bedrooms"),
  bathrooms: nonempty("Select the number of bathrooms"),
  floors: nonempty("Select how many floors the property has"),
  stairs: z.boolean(),
  balcony: z.boolean(),
  utility: z.boolean(),
  condition: nonempty("Select the current condition"),
  pets: nonempty("Select whether there are pets"),
  access: nonempty("Select parking or access details"),
  time: nonempty("Select a preferred visit time"),
  notes: z.string().trim().max(2000, "Notes are too long").optional(),
  first_name: nonempty("Enter your first name").max(80, "First name is too long"),
  last_name: nonempty("Enter your last name").max(80, "Last name is too long"),
  phone: nonempty("Enter a mobile number")
    .max(20, "Phone number is too long")
    .refine((value) => value.replace(/\D/g, "").length >= 10, {
      message: "Enter a valid mobile number",
    }),
  email: nonempty("Enter your email")
    .max(120, "Email is too long")
    .refine(
      (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      "Enter a valid email",
    ),
  date: nonempty("Choose a preferred cleaning date"),
  source: nonempty("Tell us how you heard about us"),
  contact_consent: z.boolean().refine((value) => value, {
    message: "Please agree so we can contact you about this request",
  }),
  accuracy: z.boolean().refine((value) => value, {
    message: "Please confirm the information is accurate",
  }),
});

export type CleaningRequest = z.infer<typeof cleaningRequestSchema>;

export const REQUIRED_FIELDS = [
  "service",
  "address",
  "property_type",
  "bedrooms",
  "bathrooms",
  "first_name",
  "last_name",
  "phone",
  "email",
  "date",
  "contact_consent",
  "accuracy",
] as const;
