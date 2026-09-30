"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  submitCleaningRequest,
  type SubmitState,
} from "@/app/actions/submit-request";
import {
  CheckIcon,
  ChoiceGrid,
  ChoiceList,
  cx,
  TextAreaControl,
  TextControl,
  ToggleRow,
} from "@/components/form-controls";
import {
  ACCESS,
  BATHROOMS,
  BEDROOMS,
  CONDITIONS,
  FLOORS,
  PETS,
  PROPERTY_TYPES,
  SERVICES,
  SOURCES,
  STEPS,
  TIMES,
  stepIndexForField,
  type StepId,
} from "@/lib/form-steps";

type Answers = {
  service: string;
  address: string;
  property_type: string;
  bedrooms: string;
  bathrooms: string;
  floors: string;
  stairs: boolean;
  balcony: boolean;
  utility: boolean;
  condition: string;
  pets: string;
  access: string;
  time: string;
  notes: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  date: string;
  source: string;
  contact_consent: boolean;
  accuracy: boolean;
};

const INITIAL: Answers = {
  service: "",
  address: "",
  property_type: "",
  bedrooms: "",
  bathrooms: "",
  floors: "",
  stairs: false,
  balcony: false,
  utility: false,
  condition: "",
  pets: "",
  access: "",
  time: "",
  notes: "",
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  date: "",
  source: "",
  contact_consent: false,
  accuracy: false,
};

const initialState: SubmitState = { ok: false };

function todayIsoDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function extrasLabel(answers: Answers) {
  const items = [
    answers.stairs ? "Stairs" : null,
    answers.balcony ? "Balcony" : null,
    answers.utility ? "Utility room" : null,
  ].filter((item): item is string => Boolean(item));
  return items.length ? items.join(", ") : "Nothing extra";
}

function serviceLabel(value: string) {
  return SERVICES.find((item) => item.value === value)?.label ?? value;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function toFormData(answers: Answers) {
  const data = new FormData();
  data.set("service", answers.service);
  data.set("address", answers.address);
  data.set("property_type", answers.property_type);
  data.set("bedrooms", answers.bedrooms);
  data.set("bathrooms", answers.bathrooms);
  data.set("floors", answers.floors);
  if (answers.stairs) data.set("stairs", "on");
  if (answers.balcony) data.set("balcony", "on");
  if (answers.utility) data.set("utility", "on");
  data.set("condition", answers.condition);
  data.set("pets", answers.pets);
  data.set("access", answers.access);
  data.set("time", answers.time);
  data.set("notes", answers.notes);
  data.set("first_name", answers.first_name);
  data.set("last_name", answers.last_name);
  data.set("phone", answers.phone);
  data.set("email", answers.email);
  data.set("date", answers.date);
  data.set("source", answers.source);
  if (answers.contact_consent) data.set("contact_consent", "on");
  if (answers.accuracy) data.set("accuracy", "on");
  return data;
}

function stepError(id: StepId, answers: Answers, minDate: string) {
  switch (id) {
    case "service":
      return answers.service ? "" : "Choose the service you need";
    case "address":
      return answers.address.trim().length >= 5
        ? ""
        : "Enter the property address";
    case "property_type":
      return answers.property_type ? "" : "Select a property type";
    case "bedrooms":
      return answers.bedrooms ? "" : "Select the number of bedrooms";
    case "bathrooms":
      return answers.bathrooms ? "" : "Select the number of bathrooms";
    case "floors":
      return answers.floors ? "" : "Select how many floors";
    case "condition":
      return answers.condition ? "" : "Select the current condition";
    case "pets":
      return answers.pets ? "" : "Select whether there are pets";
    case "access":
      return answers.access ? "" : "Select parking or access details";
    case "time":
      return answers.time ? "" : "Select a preferred visit time";
    case "date":
      if (!answers.date) return "Choose a preferred date";
      if (answers.date < minDate) return "Choose today or a future date";
      return "";
    case "name":
      if (!answers.first_name.trim()) return "Enter your first name";
      if (!answers.last_name.trim()) return "Enter your last name";
      return "";
    case "phone":
      return answers.phone.replace(/\D/g, "").length >= 10
        ? ""
        : "Enter a valid mobile number";
    case "email":
      if (!answers.email.trim()) return "Enter your email";
      return isEmail(answers.email) ? "" : "Enter a valid email";
    case "source":
      return answers.source ? "" : "Tell us how you heard about us";
    case "review":
      if (!answers.contact_consent) {
        return "Please agree so we can contact you about this request";
      }
      if (!answers.accuracy) {
        return "Please confirm the information is accurate";
      }
      return "";
    default:
      return "";
  }
}

export function RequestForm() {
  const [state, formAction, pending] = useActionState(
    submitCleaningRequest,
    initialState,
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(INITIAL);
  const [returnToReview, setReturnToReview] = useState(false);
  const [localError, setLocalError] = useState("");
  const [errorState, setErrorState] = useState<SubmitState | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const advanceTimer = useRef<number | null>(null);
  const minDate = todayIsoDate();

  const step = STEPS[stepIndex];
  const percent = Math.round(((stepIndex + 1) / STEPS.length) * 100);
  const isReview = step.id === "review";
  const fieldErrors = state.fieldErrors ?? {};

  useEffect(() => {
    const focusId =
      step.id === "name"
        ? "first_name"
        : step.id === "notes"
          ? "notes"
          : step.fields.length === 1
            ? step.fields[0]
            : "";
    const node = focusId ? document.getElementById(focusId) : null;
    if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
      node.focus();
      return;
    }
    headingRef.current?.focus();
  }, [stepIndex, step]);

  useEffect(() => {
    if (state.ok) {
      successRef.current?.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state.ok]);

  if (state.fieldErrors && state !== errorState) {
    const first = Object.keys(state.fieldErrors)[0];
    const index = stepIndexForField(first);
    setErrorState(state);
    if (index >= 0) setStepIndex(index);
  }

  useEffect(() => {
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    };
  }, []);

  function setField<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((current) => ({ ...current, [key]: value }));
    setLocalError("");
  }

  function goTo(index: number) {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    setLocalError("");
    setStepIndex(index);
  }

  function goNext() {
    setLocalError("");
    setReturnToReview((comingBack) => {
      if (comingBack) {
        setStepIndex(STEPS.length - 1);
        return false;
      }
      setStepIndex((index) => Math.min(index + 1, STEPS.length - 1));
      return false;
    });
  }

  function queueAdvance() {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(goNext, 240);
  }

  function choose(key: keyof Answers, value: string) {
    setField(key, value);
    queueAdvance();
  }

  function continueStep() {
    const error = stepError(step.id, answers, minDate);
    if (error) {
      setLocalError(error);
      return;
    }
    goNext();
  }

  function editStep(id: StepId) {
    const index = STEPS.findIndex((item) => item.id === id);
    if (index < 0) return;
    setReturnToReview(true);
    goTo(index);
  }

  function onTextKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      continueStep();
    }
  }

  if (state.ok) {
    return (
      <section
        className="mx-auto flex w-full max-w-[520px] flex-1 flex-col justify-center px-5 py-16 text-center"
        aria-live="polite"
      >
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-teal shadow-[0_0_0_6px_rgba(198,161,91,0.22)]">
          <CheckIcon className="h-8 w-8 text-gold" />
        </div>
        <h1
          ref={successRef}
          tabIndex={-1}
          className="text-[34px] font-semibold tracking-[-0.04em] outline-none sm:text-[40px]"
        >
          Request received.
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-[17px] leading-relaxed text-muted">
          You will get feedback from our team shortly. We will confirm the
          cleaning scope, appointment and price before issuing an invoice.
        </p>
        {state.reference ? (
          <p className="mt-8 text-[13px] tracking-wide text-muted">
            Reference{" "}
            <span className="font-medium text-ink">{state.reference}</span>
          </p>
        ) : null}
      </section>
    );
  }

  const visibleError =
    localError ||
    step.fields.map((field) => fieldErrors[field]).find(Boolean) ||
    (isReview ? state.message : "");

  return (
    <div className="mx-auto flex w-full max-w-[520px] flex-1 flex-col px-5 py-6 sm:py-10">
      <div
        className="h-1 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label="Form progress"
      >
        <div
          className="h-full rounded-full bg-teal transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="sr-only">
        Step {stepIndex + 1} of {STEPS.length}
      </p>

      <div key={step.id} className="step-enter mt-8 flex flex-1 flex-col">
        <p className="text-[12px] font-medium tracking-[0.16em] text-gold uppercase">
          Cleaning request
        </p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="mt-3 text-[32px] font-semibold tracking-[-0.038em] leading-[1.12] outline-none sm:text-[40px]"
        >
          {step.title}
        </h1>
        <p className="mt-3 max-w-[34rem] text-[15px] leading-relaxed text-muted">
          {step.hint}
        </p>

        <div className="mt-8">
          {step.id === "service" ? (
            <ChoiceList
              value={answers.service}
              options={SERVICES}
              onChange={(value) => choose("service", value)}
            />
          ) : null}

          {step.id === "address" ? (
            <TextControl
              id="address"
              name="address"
              label="Property address"
              autoComplete="street-address"
              placeholder="House number, street, area, city"
              maxLength={300}
              value={answers.address}
              onChange={(event) => setField("address", event.target.value)}
              onKeyDown={onTextKeyDown}
              error={visibleError}
            />
          ) : null}

          {step.id === "property_type" ? (
            <ChoiceList
              value={answers.property_type}
              options={PROPERTY_TYPES}
              onChange={(value) => choose("property_type", value)}
            />
          ) : null}

          {step.id === "bedrooms" ? (
            <ChoiceGrid
              value={answers.bedrooms}
              options={BEDROOMS}
              onChange={(value) => choose("bedrooms", value)}
            />
          ) : null}

          {step.id === "bathrooms" ? (
            <ChoiceGrid
              value={answers.bathrooms}
              options={BATHROOMS}
              onChange={(value) => choose("bathrooms", value)}
            />
          ) : null}

          {step.id === "floors" ? (
            <ChoiceGrid
              value={answers.floors}
              options={FLOORS}
              onChange={(value) => choose("floors", value)}
            />
          ) : null}

          {step.id === "extras" ? (
            <div className="overflow-hidden rounded-[22px] bg-paper ring-1 ring-black/5">
              <ToggleRow
                name="stairs"
                label="Internal stairs"
                checked={answers.stairs}
                onChange={(checked) => setField("stairs", checked)}
              />
              <div className="h-px bg-line" />
              <ToggleRow
                name="balcony"
                label="Balcony"
                checked={answers.balcony}
                onChange={(checked) => setField("balcony", checked)}
              />
              <div className="h-px bg-line" />
              <ToggleRow
                name="utility"
                label="Utility room"
                checked={answers.utility}
                onChange={(checked) => setField("utility", checked)}
              />
            </div>
          ) : null}

          {step.id === "condition" ? (
            <ChoiceList
              value={answers.condition}
              options={CONDITIONS}
              onChange={(value) => choose("condition", value)}
            />
          ) : null}

          {step.id === "pets" ? (
            <ChoiceList
              value={answers.pets}
              options={PETS}
              onChange={(value) => choose("pets", value)}
            />
          ) : null}

          {step.id === "access" ? (
            <ChoiceList
              value={answers.access}
              options={ACCESS}
              onChange={(value) => choose("access", value)}
            />
          ) : null}

          {step.id === "time" ? (
            <ChoiceList
              value={answers.time}
              options={TIMES}
              onChange={(value) => choose("time", value)}
            />
          ) : null}

          {step.id === "date" ? (
            <TextControl
              id="date"
              name="date"
              type="date"
              label="Preferred cleaning date"
              min={minDate}
              value={answers.date}
              onChange={(event) => setField("date", event.target.value)}
              onKeyDown={onTextKeyDown}
              error={visibleError}
            />
          ) : null}

          {step.id === "notes" ? (
            <TextAreaControl
              id="notes"
              name="notes"
              label="Anything specific you want cleaned"
              maxLength={2000}
              placeholder="Ovens, inside cupboards, particular stains…"
              value={answers.notes}
              onChange={(event) => setField("notes", event.target.value)}
            />
          ) : null}

          {step.id === "name" ? (
            <div className="overflow-hidden rounded-[22px] bg-input-fill">
              <label htmlFor="first_name" className="sr-only">
                First name
              </label>
              <input
                id="first_name"
                name="first_name"
                autoComplete="given-name"
                autoCapitalize="words"
                maxLength={80}
                placeholder="First name"
                value={answers.first_name}
                onChange={(event) => setField("first_name", event.target.value)}
                onKeyDown={onTextKeyDown}
                className="w-full bg-transparent px-5 py-[18px] text-[17px] outline-none placeholder:text-[#a1a1a6]"
              />
              <div className="h-px bg-line" />
              <label htmlFor="last_name" className="sr-only">
                Last name
              </label>
              <input
                id="last_name"
                name="last_name"
                autoComplete="family-name"
                autoCapitalize="words"
                maxLength={80}
                placeholder="Last name"
                value={answers.last_name}
                onChange={(event) => setField("last_name", event.target.value)}
                onKeyDown={onTextKeyDown}
                className="w-full bg-transparent px-5 py-[18px] text-[17px] outline-none placeholder:text-[#a1a1a6]"
              />
            </div>
          ) : null}

          {step.id === "phone" ? (
            <TextControl
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              enterKeyHint="next"
              label="Mobile number"
              placeholder="07…"
              maxLength={20}
              value={answers.phone}
              onChange={(event) => setField("phone", event.target.value)}
              onKeyDown={onTextKeyDown}
              error={visibleError}
            />
          ) : null}

          {step.id === "email" ? (
            <TextControl
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              enterKeyHint="next"
              label="Email"
              placeholder="name@email.com"
              maxLength={120}
              value={answers.email}
              onChange={(event) => setField("email", event.target.value)}
              onKeyDown={onTextKeyDown}
              error={visibleError}
            />
          ) : null}

          {step.id === "source" ? (
            <ChoiceList
              value={answers.source}
              options={SOURCES}
              onChange={(value) => choose("source", value)}
            />
          ) : null}

          {step.id === "review" ? (
            <Review
              answers={answers}
              onEdit={editStep}
              onToggle={(key, value) => setField(key, value)}
            />
          ) : null}

          {visibleError &&
          step.id !== "address" &&
          step.id !== "date" &&
          step.id !== "phone" &&
          step.id !== "email" ? (
            <p className="mt-4 text-[13px] text-red-700" role="alert">
              {visibleError}
            </p>
          ) : null}
        </div>

        <div className="mt-auto flex items-center gap-3 pt-10 pb-[max(8px,env(safe-area-inset-bottom))]">
          {stepIndex > 0 ? (
            <button
              type="button"
              onClick={() => {
                if (returnToReview) {
                  setReturnToReview(false);
                  goTo(STEPS.length - 1);
                  return;
                }
                goTo(stepIndex - 1);
              }}
              className="h-[52px] min-w-[84px] rounded-full px-5 text-[17px] font-medium text-teal"
            >
              Back
            </button>
          ) : (
            <span className="min-w-[84px]" />
          )}

          {isReview ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                const error = stepError("review", answers, minDate);
                if (error) {
                  setLocalError(error);
                  return;
                }
                startTransition(() => {
                  formAction(toFormData(answers));
                });
              }}
              className="relative h-[52px] flex-1 overflow-hidden rounded-full bg-teal text-[17px] font-medium text-white transition-colors hover:bg-teal-deep disabled:cursor-wait"
            >
              {pending ? (
                <>
                  <span className="skeleton absolute inset-0 rounded-full bg-teal-deep" />
                  <span className="relative">Sending your request</span>
                </>
              ) : (
                "Send request"
              )}
            </button>
          ) : step.optional ? (
            <div className="flex flex-1 gap-2">
              <button
                type="button"
                onClick={goNext}
                className="h-[52px] flex-1 rounded-full text-[17px] font-medium text-muted"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={continueStep}
                className="h-[52px] flex-1 rounded-full bg-teal text-[17px] font-medium text-white hover:bg-teal-deep"
              >
                Continue
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={continueStep}
              disabled={Boolean(stepError(step.id, answers, minDate))}
              className="h-[52px] flex-1 rounded-full bg-teal text-[17px] font-medium text-white transition-colors hover:bg-teal-deep disabled:bg-teal/35 disabled:text-white"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Review({
  answers,
  onEdit,
  onToggle,
}: {
  answers: Answers;
  onEdit: (id: StepId) => void;
  onToggle: (key: "contact_consent" | "accuracy", value: boolean) => void;
}) {
  const rows: { id: StepId; label: string; value: string }[] = [
    { id: "service", label: "Service", value: serviceLabel(answers.service) },
    { id: "address", label: "Address", value: answers.address },
    { id: "property_type", label: "Home", value: answers.property_type },
    {
      id: "bedrooms",
      label: "Bedrooms",
      value: answers.bedrooms === "Studio" ? "Studio" : answers.bedrooms,
    },
    { id: "bathrooms", label: "Bathrooms", value: answers.bathrooms },
    { id: "floors", label: "Floors", value: answers.floors },
    { id: "extras", label: "Also include", value: extrasLabel(answers) },
    { id: "condition", label: "Condition", value: answers.condition },
    { id: "pets", label: "Pets", value: answers.pets },
    { id: "access", label: "Access", value: answers.access },
    {
      id: "date",
      label: "Visit",
      value: `${formatDate(answers.date)}, ${answers.time.toLowerCase()}`,
    },
    {
      id: "notes",
      label: "Notes",
      value: answers.notes.trim() || "None",
    },
    {
      id: "name",
      label: "Contact",
      value: [answers.first_name, answers.last_name, answers.phone, answers.email]
        .filter(Boolean)
        .join(" · "),
    },
    { id: "source", label: "Heard about us", value: answers.source },
  ];

  return (
    <div className="grid gap-4">
      <div className="overflow-hidden rounded-[22px] bg-paper ring-1 ring-black/5">
        {rows.map((row, index) => (
          <button
            key={row.id}
            type="button"
            onClick={() => onEdit(row.id)}
            className={cx(
              "flex w-full items-start justify-between gap-4 px-5 py-4 text-left",
              index > 0 && "border-t border-line",
            )}
          >
            <span className="min-w-0">
              <span className="block text-[12px] text-muted">{row.label}</span>
              <span className="mt-0.5 block text-[16px] tracking-[-0.015em]">
                {row.value}
              </span>
            </span>
            <span className="shrink-0 pt-3 text-[15px] font-medium text-teal">
              Edit
            </span>
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-[22px] bg-paper ring-1 ring-black/5">
        <ToggleRow
          name="contact_consent"
          label="You can contact me about this request"
          checked={answers.contact_consent}
          onChange={(checked) => onToggle("contact_consent", checked)}
        />
        <div className="h-px bg-line" />
        <ToggleRow
          name="accuracy"
          label="These details are accurate"
          checked={answers.accuracy}
          onChange={(checked) => onToggle("accuracy", checked)}
        />
      </div>
    </div>
  );
}
