"use client"

import * as React from "react"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "#components/card"
import { DataChart, type ChartConfig } from "#components/chart"
import { Badge } from "#components/badge"
import { Spinner } from "#components/spinner"
import { EmptyState } from "#components/empty"
import { ErrorState } from "#components/error-state"
import { compareMetric, type MetricComparison } from "#lib/metric-model"
import { cn } from "#lib/utils"

export { compareMetric, type MetricComparison } from "#lib/metric-model"
export interface MetricCardProps extends Omit<React.ComponentProps<"div">, "children"> {
  label: string; value: number | null; formatValue?: (value: number) => string
  period: string; description?: React.ReactNode; unit?: string; footnote?: React.ReactNode
  comparison?: MetricComparison; locale?: string; compact?: boolean
  status?: "ready" | "loading" | "empty" | "error"; onRetry?: () => void; retrying?: boolean
  chart?: { type: "area" | "bar" | "line" | "radial"; data: ReadonlyArray<Record<string, string | number | null>>; config: ChartConfig; categoryKey: string; label: string; max?: number }
  loadingLabel?: string; emptyLabel?: string; errorLabel?: string; retryLabel?: string
}
export function MetricCard({ label, value, period, description, unit, footnote, comparison, formatValue, locale = "en-AU", compact = false, status = "ready", chart, onRetry, retrying, loadingLabel = "Loading metric", emptyLabel = "No data for this period", errorLabel = "Metric unavailable", retryLabel = "Retry", className, ...props }: MetricCardProps) {
  const titleId = React.useId()
  const state = status === "ready" && value === null ? "empty" : status
  if (state === "ready" && value !== null && !Number.isFinite(value)) throw new RangeError("Metric value must be finite")
  const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 })
  const result = state === "ready" && value !== null && comparison ? compareMetric(value, comparison) : null
  const directionIcon = result?.direction === "increase" ? <ArrowUpRight /> : result?.direction === "decrease" ? <ArrowDownRight /> : <Minus />
  return <Card {...props} className={cn("aq-metric-card", className)} size={compact ? "sm" : "default"} data-slot="metric-card" data-state={state} data-compact={compact || undefined} role="region" aria-labelledby={titleId} aria-busy={state === "loading" || retrying || undefined}>
    <CardHeader><CardTitle id={titleId}>{label}</CardTitle><CardDescription>{period}</CardDescription></CardHeader>
    <CardContent>
      {state === "loading" ? <div className="aq-metric-state" role="status"><Spinner role={undefined} aria-label={undefined} aria-hidden="true" />{loadingLabel}</div> : state === "error" ? <ErrorState size="sm" title={errorLabel} description={description ?? "Try loading this metric again."} retry={onRetry ? { onRetry, pending: retrying, label: retryLabel } : undefined} /> : state === "empty" ? <EmptyState size="sm" title={emptyLabel} description={description} /> : <>
        <div className="aq-metric-value"><bdi>{value !== null && (formatValue ? formatValue(value) : formatter.format(value))}</bdi>{unit && <small><bdi>{unit}</bdi></small>}</div>
        {result && comparison && <div className="aq-metric-comparison" data-tone={result.tone}>
          {result.delta === null ? <span>No comparison available</span> : <Badge variant="outline" icon={directionIcon}>{result.delta > 0 ? "+" : ""}{formatter.format(result.delta)}{comparison.mode === "points" ? " pp" : result.percent !== null ? ` (${result.percent > 0 ? "+" : ""}${formatter.format(result.percent)}%)` : ""}</Badge>}
          <span>{comparison.label}{result.delta !== null && comparison.previous === 0 && comparison.mode !== "points" ? " · previous value 0" : ""}</span>
        </div>}
        {description && <p className="aq-metric-description">{description}</p>}
        {chart && <DataChart {...chart} radialMax={chart.max} compact />}
      </>}
    </CardContent>{footnote && <CardFooter>{footnote}</CardFooter>}
  </Card>
}
