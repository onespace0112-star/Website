import type { FAQ, FAQType } from "@prisma/client";
import type { PaginatedResponse } from "@/lib/pagination";
import { serializeDate } from "./serialize";

/**
 * DTO for FAQ (scalar fields only).
 */
export type FAQDTO = {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  typeId: number | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FAQTypeDTO = {
  id: number;
  name: string;
};

export type FAQListItemDTO = FAQDTO & {
  type?: FAQTypeDTO | null;
};

export type FAQListResponse = PaginatedResponse<FAQListItemDTO>;

/**
 * Serialize a FAQ model into a JSON-safe DTO.
 */
export function serializeFAQ(faq: FAQ): FAQDTO {
  return {
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
    category: faq.category,
    typeId: faq.typeId,
    order: faq.order,
    isActive: faq.isActive,
    createdAt: serializeDate(faq.createdAt)!,
    updatedAt: serializeDate(faq.updatedAt)!,
  };
}

export function serializeFAQWithType(
  faq: FAQ & { type: FAQType | null },
): FAQListItemDTO {
  return {
    ...serializeFAQ(faq),
    type: faq.type
      ? {
          id: faq.type.id,
          name: faq.type.name,
        }
      : null,
  };
}

function isFAQTypeDTO(value: unknown): value is FAQTypeDTO {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "number" && typeof item.name === "string";
}

function isFAQListItemDTO(value: unknown): value is FAQListItemDTO {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "number" &&
    typeof item.question === "string" &&
    typeof item.answer === "string" &&
    (item.category === null || typeof item.category === "string") &&
    (item.typeId === null || typeof item.typeId === "number") &&
    typeof item.order === "number" &&
    typeof item.isActive === "boolean" &&
    typeof item.createdAt === "string" &&
    typeof item.updatedAt === "string" &&
    (item.type === undefined || item.type === null || isFAQTypeDTO(item.type))
  );
}

export function extractFAQItems(payload: unknown): FAQListItemDTO[] {
  if (Array.isArray(payload)) {
    return payload.filter(isFAQListItemDTO);
  }

  if (payload && typeof payload === "object") {
    const maybeItems = (payload as { items?: unknown }).items;
    if (Array.isArray(maybeItems)) {
      return maybeItems.filter(isFAQListItemDTO);
    }
  }

  return [];
}
