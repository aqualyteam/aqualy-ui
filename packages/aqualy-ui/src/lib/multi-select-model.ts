import type { ComboboxOption } from "#components/combobox"

export function normalizeSelections(values: readonly string[], options: readonly ComboboxOption[], maxSelections?: number): string[] {
  if (maxSelections !== undefined && (!Number.isInteger(maxSelections) || maxSelections < 1)) throw new RangeError("maxSelections must be a positive integer")
  const valid = new Set(options.filter(option => !option.disabled).map(option => option.value))
  return [...new Set(values)].filter(value => valid.has(value)).slice(0, maxSelections)
}
