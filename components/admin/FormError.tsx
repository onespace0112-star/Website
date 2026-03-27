import React from 'react';

type FieldErrorProps = {
  errors?: string[];
};

type FormErrorProps = {
  error?: string | null;
};

export function FieldError({ errors }: FieldErrorProps) {
  if (!errors?.length) return null;

  return (
    <ul className="mt-2 space-y-1 text-xs font-semibold text-rose-600">
      {errors.map((message, index) => (
        <li
          key={`${message}-${index}`}
          className="flex items-start gap-2 rounded-xl bg-rose-50/70 px-3 py-2 shadow-sm"
        >
          <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
          <span className="leading-relaxed text-rose-700">{message}</span>
        </li>
      ))}
    </ul>
  );
}

export function FormError({ error }: FormErrorProps) {
  if (!error) return null;

  return (
    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-200/70 bg-rose-50/80 px-4 py-3 text-sm font-semibold text-rose-700 shadow-sm">
      <span className="mt-1 h-2 w-2 rounded-full bg-rose-500" />
      <p className="leading-relaxed">{error}</p>
    </div>
  );
}
