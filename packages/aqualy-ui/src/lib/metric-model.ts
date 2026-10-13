export interface MetricComparison { previous: number | null; label: string; mode?: "relative" | "points"; favorable?: "increase" | "decrease" | "neutral" }
export function compareMetric(value: number, comparison: MetricComparison) {
  const { previous, mode = "relative", favorable = "neutral" } = comparison
  if (!Number.isFinite(value)) throw new RangeError("Metric value must be finite")
  if (previous === null) return { direction: "unknown", tone: "neutral", delta: null, percent: null } as const
  if (!Number.isFinite(previous)) throw new RangeError("Previous metric must be finite or null")
  const delta = value - previous
  const direction = delta === 0 ? "flat" : delta > 0 ? "increase" : "decrease"
  const tone = delta === 0 || favorable === "neutral" ? "neutral" : direction === favorable ? "positive" : "negative"
  return { direction, tone, delta, percent: mode === "points" || previous === 0 ? null : delta / Math.abs(previous) * 100 }
}
