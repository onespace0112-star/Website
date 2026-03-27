import type { Decimal } from "@prisma/client/runtime/library";

/**
 * Serialize a Date to an ISO string for RSC → Client transfer.
 */
export function serializeDate(date: Date | null): string | null {
  return date ? date.toISOString() : null;
}

/**
 * Serialize a BigInt to a string for JSON-safe transport.
 */
export function serializeBigInt(value: bigint | null): string | null {
  return value === null ? null : value.toString();
}

/**
 * Serialize a Decimal to a string for JSON-safe transport.
 */
export function serializeDecimal(value: Decimal | null): string | null {
  return value === null ? null : value.toString();
}

/**
 * Serialize a nullable value with a provided serializer.
 */
export function serializeNullable<T, U>(
  value: T | null,
  serializer: (value: T) => U,
): U | null {
  return value === null ? null : serializer(value);
}

/**
 * Serialize an array with a provided serializer.
 */
export function serializeArray<T, U>(
  values: T[] | null,
  serializer: (value: T) => U,
): U[] | null {
  return values === null ? null : values.map(serializer);
}
