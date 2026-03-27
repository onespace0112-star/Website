import { ZodError } from 'zod';

export type FieldErrors = Record<string, string[]>;
export type FormError = string | null;

export interface FormState<T = any> {
  ok: boolean;
  data?: T;
  fieldErrors?: FieldErrors;
  formError?: FormError;
}

const ROOT_PATH_LABELS = new Set(['', '_root']);

// 将 ZodError 转换为结构化错误
export function formatZodError(error: ZodError): {
  fieldErrors: FieldErrors;
  formError: FormError;
} {
  const fieldErrors: FieldErrors = {};
  const formMessages: string[] = [];

  for (const issue of error.issues) {
    const path = issue.path.map(String).join('.');
    if (!path || ROOT_PATH_LABELS.has(path)) {
      formMessages.push(issue.message);
      continue;
    }

    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(issue.message);
  }

  return {
    fieldErrors,
    formError: formMessages.length ? formMessages.join('，') : null,
  };
}

// Server Action 统一返回结构
export function successResponse<T>(data: T): FormState<T> {
  return { ok: true, data };
}

export function errorResponse(formError: string): FormState {
  return { ok: false, formError };
}

export function validationErrorResponse(error: ZodError): FormState {
  const { fieldErrors, formError } = formatZodError(error);
  return { ok: false, fieldErrors, formError };
}
