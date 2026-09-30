"use server";

import { sendRequestEmails } from "@/lib/email";
import { saveCleaningRequest } from "@/lib/firebase";
import { cleaningRequestSchema } from "@/lib/schema";

export type SubmitState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  reference?: string;
};

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readFlag(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "yes";
}

function fieldErrorsFromZod(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}

export async function submitCleaningRequest(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  if (readString(formData, "website_url").trim()) {
    return { ok: true, reference: "LB-000000" };
  }

  const parsed = cleaningRequestSchema.safeParse({
    service: readString(formData, "service"),
    address: readString(formData, "address"),
    property_type: readString(formData, "property_type"),
    bedrooms: readString(formData, "bedrooms"),
    bathrooms: readString(formData, "bathrooms"),
    floors: readString(formData, "floors") || "1",
    stairs: readFlag(formData, "stairs"),
    balcony: readFlag(formData, "balcony"),
    utility: readFlag(formData, "utility"),
    condition: readString(formData, "condition"),
    pets: readString(formData, "pets"),
    access: readString(formData, "access"),
    time: readString(formData, "time"),
    notes: readString(formData, "notes"),
    first_name: readString(formData, "first_name"),
    last_name: readString(formData, "last_name"),
    phone: readString(formData, "phone"),
    email: readString(formData, "email"),
    date: readString(formData, "date"),
    source: readString(formData, "source"),
    contact_consent: readFlag(formData, "contact_consent"),
    accuracy: readFlag(formData, "accuracy"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check the highlighted fields and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  const preferredDate = new Date(`${parsed.data.date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (Number.isNaN(preferredDate.getTime()) || preferredDate < today) {
    return {
      ok: false,
      message: "Please choose today or a future date.",
      fieldErrors: { date: "Choose today or a future date" },
    };
  }

  try {
    const id = await saveCleaningRequest({
      ...parsed.data,
      notes: parsed.data.notes || "",
      status: "new",
    });
    const reference = `LB-${id.slice(-6).toUpperCase()}`;

    try {
      await sendRequestEmails(parsed.data, reference);
    } catch (error) {
      console.error("Failed to send request emails", error);
    }

    return {
      ok: true,
      reference,
    };
  } catch (error) {
    console.error("Failed to save cleaning request", error);

    const unconfigured =
      error instanceof Error && error.message === "UNCONFIGURED";

    return {
      ok: false,
      message: unconfigured
        ? process.env.NODE_ENV === "development"
          ? "Firebase is not configured yet. Add your credentials to .env.local."
          : "We could not save your request just now. Please try again in a moment."
        : "We could not save your request just now. Please try again in a moment.",
    };
  }
}
