import type { Carousel } from "@prisma/client";
import { serializeDate } from "./serialize";

/**
 * DTO for Carousel (scalar fields only).
 */
export type CarouselDTO = {
  id: number;
  title: string | null;
  image: string;
  height: number;
  order: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * Serialize a Carousel model into a JSON-safe DTO.
 */
export function serializeCarousel(carousel: Carousel): CarouselDTO {
  return {
    id: carousel.id,
    title: carousel.title,
    image: carousel.image,
    height: carousel.height,
    order: carousel.order,
    isVisible: carousel.isVisible,
    createdAt: serializeDate(carousel.createdAt)!,
    updatedAt: serializeDate(carousel.updatedAt)!,
  };
}
