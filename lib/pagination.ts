/**
 * Pagination response wrapper.
 *
 * @example
 * const response: PaginatedResponse<User> = {
 *   items,
 *   total,
 *   page,
 *   pageSize,
 *   totalPages: Math.ceil(total / pageSize),
 * }
 */
export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Parse pagination params from URLSearchParams.
 *
 * Rules:
 * - page must be >= 1; invalid values fallback to 1
 * - pageSize must be between 1 and 100; invalid values fallback to 20
 *
 * @example
 * const { page, pageSize, skip, take } = parsePaginationParams(searchParams)
 * // Use with Prisma
 * // prisma.model.findMany({ skip, take })
 */
export function parsePaginationParams(
  searchParams: URLSearchParams
): {
  page: number
  pageSize: number
  skip: number
  take: number
} {
  const rawPage = searchParams.get('page')
  const rawPageSize = searchParams.get('pageSize')

  const parsedPage = rawPage ? Number.parseInt(rawPage, 10) : Number.NaN
  const parsedPageSize = rawPageSize
    ? Number.parseInt(rawPageSize, 10)
    : Number.NaN

  const page = Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1

  const normalizedPageSize =
    Number.isFinite(parsedPageSize) && parsedPageSize >= 1 && parsedPageSize <= 100
      ? parsedPageSize
      : 20

  const skip = (page - 1) * normalizedPageSize
  const take = normalizedPageSize

  return {
    page,
    pageSize: normalizedPageSize,
    skip,
    take,
  }
}
