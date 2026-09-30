import type { ComponentProps } from "react";
import type { Choice } from "@/lib/form-steps";

export function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.5 10.5 8.2 14.2 15.5 5.8"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChoiceList({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Choice[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-[22px] bg-paper shadow-[0_1px_2px_rgba(29,29,31,0.04)] ring-1 ring-black/5">
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={selected}
            className={cx(
              "flex w-full items-center justify-between gap-4 px-5 py-[18px] text-left transition-colors",
              index > 0 && "border-t border-line",
              selected ? "bg-teal text-white" : "hover:bg-soft",
            )}
          >
            <span className="min-w-0">
              <span className="block text-[17px] font-medium tracking-[-0.015em]">
                {option.label}
              </span>
              {option.hint ? (
                <span
                  className={cx(
                    "mt-0.5 block text-[13px] leading-snug",
                    selected ? "text-white/70" : "text-muted",
                  )}
                >
                  {option.hint}
                </span>
              ) : null}
            </span>
            {selected ? (
              <CheckIcon className="h-[18px] w-[18px] shrink-0 text-gold" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function ChoiceGrid({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Choice[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={selected}
            className={cx(
              "flex min-h-[72px] items-center justify-center rounded-[20px] text-[17px] font-medium tracking-[-0.02em] ring-1 transition-colors",
              selected
                ? "bg-teal text-white ring-teal"
                : "bg-paper text-ink ring-black/5 hover:bg-soft",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function TextControl({
  id,
  label,
  error,
  ...props
}: ComponentProps<"input"> & {
  id: string;
  label: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="w-full rounded-[20px] bg-input-fill px-5 py-[18px] text-[17px] tracking-[-0.01em] text-ink outline-none placeholder:text-[#a1a1a6] focus:bg-paper focus:shadow-[0_0_0_4px_rgba(198,161,91,0.22)] focus:ring-1 focus:ring-gold aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-red-500"
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-3 text-[13px] text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextAreaControl({
  id,
  label,
  error,
  ...props
}: ComponentProps<"textarea"> & {
  id: string;
  label: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="min-h-[160px] w-full resize-y rounded-[20px] bg-input-fill px-5 py-[18px] text-[17px] leading-relaxed tracking-[-0.01em] text-ink outline-none placeholder:text-[#a1a1a6] focus:bg-paper focus:shadow-[0_0_0_4px_rgba(198,161,91,0.22)] focus:ring-1 focus:ring-gold"
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-3 text-[13px] text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ToggleRow({
  name,
  checked,
  label,
  onChange,
}: {
  name: string;
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-[56px] cursor-pointer items-center justify-between gap-4 px-5 py-4">
      <span className="text-[17px] tracking-[-0.015em]">{label}</span>
      <input
        type="checkbox"
        name={name}
        className="toggle"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}
