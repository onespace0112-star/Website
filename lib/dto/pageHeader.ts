import type { PageHeader } from "@prisma/client";
import { serializeDate } from "./serialize";

/**
 * DTO for PageHeader (scalar fields only).
 */
export type PageHeaderDTO = {
  id: number;
  page: string;
  title: string;
  description: string | null;
  image: string | null;
  height: number;
  createdAt: string;
  updatedAt: string;
};

/**
 * Serialize a PageHeader model into a JSON-safe DTO.
 */
export function serializePageHeader(pageHeader: PageHeader): PageHeaderDTO {
  return {
    id: pageHeader.id,
    page: pageHeader.page,
    title: pageHeader.title,
    description: pageHeader.description,
    image: pageHeader.image,
    height: pageHeader.height,
    createdAt: serializeDate(pageHeader.createdAt)!,
    updatedAt: serializeDate(pageHeader.updatedAt)!,
  };
}
