import type { Project } from "@prisma/client";
import { serializeDate } from "./serialize";

/**
 * DTO for Project (scalar fields only).
 */
export type ProjectDTO = {
  id: number;
  title: string;
  description: string | null;
  coverImage: string | null;
  slug: string | null;
  content: string | null;
  area: string | null;
  location: string | null;
  order: number;
  typeId: number | null;
  createdAt: string;
  updatedAt: string | null;
};

/**
 * Serialize a Project model into a JSON-safe DTO.
 */
export function serializeProject(project: Project): ProjectDTO {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    coverImage: project.coverImage,
    slug: project.slug,
    content: project.content,
    area: project.area,
    location: project.location,
    order: project.order,
    typeId: project.typeId,
    createdAt: serializeDate(project.createdAt)!,
    updatedAt: serializeDate(project.updatedAt),
  };
}
