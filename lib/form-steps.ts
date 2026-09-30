export type Choice = {
  value: string;
  label: string;
  hint?: string;
};

export const SERVICES: Choice[] = [
  {
    value: "Residential cleaning",
    label: "Home cleaning",
    hint: "Regular upkeep of lived-in rooms",
  },
  {
    value: "Deep cleaning",
    label: "Deep cleaning",
    hint: "A thorough reset, including neglected areas",
  },
  {
    value: "Move-in / move-out",
    label: "Move-in / move-out",
    hint: "Empty or nearly empty home",
  },
  {
    value: "Other",
    label: "Something else",
    hint: "We’ll confirm the details with you",
  },
];

export const PROPERTY_TYPES: Choice[] = [
  { value: "Flat / apartment", label: "Flat / apartment" },
  { value: "Terraced house", label: "Terraced house" },
  { value: "Semi-detached house", label: "Semi-detached house" },
  { value: "Detached house", label: "Detached house" },
  { value: "Other", label: "Other" },
];

export const BEDROOMS: Choice[] = [
  { value: "Studio", label: "Studio" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5+", label: "5+" },
];

export const BATHROOMS: Choice[] = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4+", label: "4+" },
];

export const FLOORS: Choice[] = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3+", label: "3+" },
];

export const CONDITIONS: Choice[] = [
  { value: "Regular / maintained", label: "Looked after", hint: "Day-to-day dust and upkeep" },
  { value: "Needs extra attention", label: "Needs extra attention", hint: "Build-up in a few areas" },
  { value: "Very heavily soiled", label: "Heavily soiled", hint: "A full reset is needed" },
  { value: "Not sure", label: "Not sure" },
];

export const PETS: Choice[] = [
  { value: "No pets", label: "No pets" },
  { value: "Dog", label: "Dog" },
  { value: "Cat", label: "Cat" },
  { value: "Other pet", label: "Other pet" },
  { value: "Multiple pets", label: "More than one" },
];

export const ACCESS: Choice[] = [
  { value: "Easy access", label: "Easy access" },
  { value: "Permit / restricted parking", label: "Permit or restricted parking" },
  { value: "Stairs / difficult access", label: "Stairs or difficult access" },
  { value: "Not sure", label: "Not sure" },
];

export const TIMES: Choice[] = [
  { value: "Morning", label: "Morning" },
  { value: "Afternoon", label: "Afternoon" },
  { value: "Evening", label: "Evening" },
  { value: "Flexible", label: "I’m flexible" },
];

export const SOURCES: Choice[] = [
  { value: "Google", label: "Google" },
  { value: "Instagram / Facebook", label: "Instagram or Facebook" },
  { value: "Recommendation", label: "A recommendation" },
  { value: "Returning customer", label: "I’ve used you before" },
  { value: "Other", label: "Other" },
];

export type StepId =
  | "service"
  | "address"
  | "property_type"
  | "bedrooms"
  | "bathrooms"
  | "floors"
  | "extras"
  | "condition"
  | "pets"
  | "access"
  | "time"
  | "date"
  | "notes"
  | "name"
  | "phone"
  | "email"
  | "source"
  | "review";

export type Step = {
  id: StepId;
  title: string;
  hint: string;
  fields: string[];
  optional?: boolean;
};

export const STEPS: Step[] = [
  {
    id: "service",
    title: "What do you need cleaned?",
    hint: "Choose the closest match. We’ll confirm the scope before we book.",
    fields: ["service"],
  },
  {
    id: "address",
    title: "Where should we come?",
    hint: "House number, street, area and city.",
    fields: ["address"],
  },
  {
    id: "property_type",
    title: "What kind of home is it?",
    hint: "This helps us plan time on site.",
    fields: ["property_type"],
  },
  {
    id: "bedrooms",
    title: "How many bedrooms?",
    hint: "Include any room you use as a bedroom.",
    fields: ["bedrooms"],
  },
  {
    id: "bathrooms",
    title: "How many bathrooms?",
    hint: "Include WCs and en suites.",
    fields: ["bathrooms"],
  },
  {
    id: "floors",
    title: "How many floors?",
    hint: "Inside the property, including a converted loft if it is lived in.",
    fields: ["floors"],
  },
  {
    id: "extras",
    title: "Anything else to include?",
    hint: "Turn on only what you want cleaned. You can leave these off.",
    fields: ["stairs", "balcony", "utility"],
    optional: true,
  },
  {
    id: "condition",
    title: "How does the home look right now?",
    hint: "Be honest — it only helps us send the right team.",
    fields: ["condition"],
  },
  {
    id: "pets",
    title: "Are there pets in the home?",
    hint: "We’ll bring the right products and take extra care.",
    fields: ["pets"],
  },
  {
    id: "access",
    title: "How easy is access?",
    hint: "Parking and entry affect how we schedule the visit.",
    fields: ["access"],
  },
  {
    id: "time",
    title: "What time of day works?",
    hint: "We’ll confirm the appointment before anything is final.",
    fields: ["time"],
  },
  {
    id: "date",
    title: "Which day works best?",
    hint: "A preference only. We’ll check availability with you.",
    fields: ["date"],
  },
  {
    id: "notes",
    title: "Anything we should pay extra attention to?",
    hint: "Ovens, cupboards, particular stains — skip if you’re not sure.",
    fields: ["notes"],
    optional: true,
  },
  {
    id: "name",
    title: "What’s your name?",
    hint: "We’ll use this when we contact you.",
    fields: ["first_name", "last_name"],
  },
  {
    id: "phone",
    title: "What’s the best number for you?",
    hint: "We’ll call or text to confirm the visit.",
    fields: ["phone"],
  },
  {
    id: "email",
    title: "Where can we email you?",
    hint: "We’ll send a thank-you note here, then get back to you with the details.",
    fields: ["email"],
  },
  {
    id: "source",
    title: "How did you hear about us?",
    hint: "This helps us know what’s working.",
    fields: ["source"],
  },
  {
    id: "review",
    title: "Does this look right?",
    hint: "Submitting this is an enquiry — not a confirmed booking or price.",
    fields: ["contact_consent", "accuracy"],
  },
];

export function stepIndexForField(field: string) {
  return STEPS.findIndex((step) => step.fields.includes(field));
}
