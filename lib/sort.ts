type SortOrder = 'asc' | 'desc'

/**
 * Parse sort params from URLSearchParams with whitelist validation.
 *
 * Rules:
 * - sortBy must be in allowedFields; invalid values fallback to defaultField
 * - order must be 'asc' or 'desc'; invalid values fallback to 'asc'
 *
 * @example
 * const { prismaOrderBy } = parseSortParams(
 *   searchParams,
 *   ['createdAt', 'order', 'name'],
 *   'order'
 * )
 * // prisma.model.findMany({ orderBy: prismaOrderBy })
 */
export function parseSortParams<T extends string>(
  searchParams: URLSearchParams,
  allowedFields: T[],
  defaultField: T
): {
  sortBy: T
  order: SortOrder
  prismaOrderBy: Record<string, SortOrder>
} {
  const rawSortBy = searchParams.get('sortBy')
  const rawOrder = searchParams.get('order')

  const sortBy = allowedFields.includes(rawSortBy as T)
    ? (rawSortBy as T)
    : defaultField

  const order: SortOrder = rawOrder === 'desc' ? 'desc' : 'asc'

  return {
    sortBy,
    order,
    prismaOrderBy: { [sortBy]: order },
  }
}
