export function paginationItems(page: number, pageCount: number): Array<number | "ellipsis-start" | "ellipsis-end"> {
  if (!Number.isInteger(pageCount) || pageCount < 0 || !Number.isInteger(page) || page < 1 || page > Math.max(1, pageCount)) throw new RangeError("Invalid pagination range")
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1)
  const start = Math.max(2, Math.min(page - 1, pageCount - 3)), end = Math.min(pageCount - 1, Math.max(page + 1, 4))
  return [1, ...(start > 2 ? ["ellipsis-start" as const] : []), ...Array.from({ length: end - start + 1 }, (_, index) => start + index), ...(end < pageCount - 1 ? ["ellipsis-end" as const] : []), pageCount]
}
export function parsePageJump(text: string, pageCount: number): number | null {
  if (!/^\d+$/.test(text)) return null
  const value = Number(text)
  return Number.isSafeInteger(value) && value >= 1 && value <= pageCount ? value : null
}
