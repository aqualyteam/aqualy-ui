"use client"

import * as React from "react"
import { useDirection } from "@base-ui/react/direction-provider"
import { Progress as Primitive } from "@base-ui/react/progress"
import { Check, Clock, Circle, X } from "lucide-react"
import { HoverCard, HoverCardTrigger, HoverCardContent, HoverCardTitle, HoverCardDescription, HoverCardClose } from "#components/hover-card"
import { Button } from "#components/button"
import { Badge } from "#components/badge"
import { cn } from "#lib/utils"
import { capacitySummary, type CapacitySeat, type CapacitySeatState } from "#lib/progress-model"
export { capacitySummary, type CapacitySeat, type CapacitySeatState } from "#lib/progress-model"
export interface ProgressProps extends Omit<Primitive.Root.Props, "children"> { label: string; size?: "sm" | "default" | "lg"; variant?: "default" | "success" | "warning" | "danger"; description?: React.ReactNode; showValue?: boolean }
export function Progress({ label, value, min = 0, max = 100, size = "default", variant = "default", description, showValue = true, className, ...props }: ProgressProps) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min || value !== null && (!Number.isFinite(value) || value < min || value > max)) throw new RangeError("Invalid progress value/range")
  const inheritedDirection = useDirection()
  const direction = props.dir === "rtl" || props.dir === "ltr" ? props.dir : inheritedDirection
  const ratio = value === null ? null : (value - min) / (max - min) * 100
  return <Primitive.Root {...props} {...(ratio === null ? {} : { "aria-valuetext": props["aria-valuetext"] ?? `${Math.round(ratio)}% (${value} / ${max})` })} value={value} min={min} max={max} data-slot="progress" data-progress-direction={direction} data-size={size} data-variant={variant} className={state => cn("aq-progress", typeof className === "function" ? className(state) : className)}>
    <div className="aq-progress-header"><Primitive.Label>{label}</Primitive.Label>{showValue && value !== null && <bdi>{value} / {max} · {Math.round(ratio!)}%</bdi>}</div>
    <Primitive.Track className="aq-progress-track"><Primitive.Indicator className="aq-progress-indicator" style={ratio === null ? undefined : { width: `${ratio}%` }} /></Primitive.Track>{description && <p className="aq-progress-description">{description}</p>}
  </Primitive.Root>
}
const seatLabels: Record<CapacitySeatState, string> = { confirmed: "Confirmed", pending: "Pending payment", provisional: "Provisional", available: "Available" }
export interface CapacityProgressProps {
  label: string; seats: readonly CapacitySeat[]; capacity: number; minimum: number; waitlist?: number
  stateLabels?: Record<CapacitySeatState, string>; minimumLabel?: string; closeLabel?: string
  renderSeat?: (seat: CapacitySeat, index: number) => React.ReactNode; className?: string
}
export function CapacityProgress({ label, seats, capacity, minimum, waitlist = 0, stateLabels = seatLabels, minimumLabel = "Minimum confirmed places", closeLabel = "Close place preview", renderSeat, className }: CapacityProgressProps) {
  const summary = capacitySummary(seats, capacity, minimum)
  if (!Number.isInteger(waitlist) || waitlist < 0) throw new RangeError("Waitlist must be a non-negative integer")
  const slots = Array.from({ length: capacity }, (_, index) => seats[index] ?? { id: `available-${index}`, label: `${stateLabels.available} ${index + 1}`, state: "available" as const })
  return <section aria-label={label} data-slot="capacity-progress" className={cn("aq-capacity", className)}>
    <div className="aq-capacity-heading"><strong>{label}</strong><Badge variant={summary.minimumMet ? "success" : "outline"}>{summary.confirmed} / {minimum} confirmed</Badge></div><p className="aq-capacity-description">{minimumLabel}: {minimum}</p>
    <div className="aq-capacity-meter"><div className="aq-capacity-slots" style={{ gridTemplateColumns: `repeat(${capacity}, minmax(0, 1fr))` }}>{slots.map((seat, index) => {
      const Icon = seat.state === "confirmed" ? Check : seat.state === "pending" ? Clock : Circle
      return <HoverCard key={`${index}:${seat.id}`}><HoverCardTrigger render={<Button variant="outline" className="aq-capacity-seat" />} data-state={seat.state} aria-label={`Place ${index + 1}: ${seat.label} · ${stateLabels[seat.state]}`}><Icon aria-hidden="true" /><bdi>{index + 1}</bdi></HoverCardTrigger><HoverCardContent size="compact" aria-label={`Place ${index + 1} preview`}><div className="aq-capacity-preview"><div className="aq-capacity-heading"><HoverCardTitle>{seat.label}</HoverCardTitle><HoverCardClose render={<Button size="icon-xs" variant="ghost" />} aria-label={closeLabel}><X /></HoverCardClose></div><Badge variant={seat.state === "confirmed" ? "success" : seat.state === "pending" ? "warning" : seat.state === "provisional" ? "info" : "outline"}>{stateLabels[seat.state]}</Badge>{seat.description && <HoverCardDescription>{seat.description}</HoverCardDescription>}{renderSeat?.(seat, index)}</div></HoverCardContent></HoverCard>
    })}</div><span className="aq-capacity-threshold" aria-hidden="true" style={{ insetInlineStart: minimum === 1 ? "-1px" : `calc(${(minimum - 1) / capacity * 100}% - ${4 * (capacity - minimum + 1) / capacity - 1}px)` }} /></div>
    <div className="aq-capacity-legend">{(["confirmed", "pending", "provisional", "available"] as const).map(state => <span key={state}><i data-state={state} aria-hidden="true" />{stateLabels[state]} <bdi>{summary[state]}</bdi></span>)}</div>{waitlist > 0 && <p className="aq-capacity-description">Waitlist: {waitlist} · outside {capacity} places</p>}
  </section>
}
export interface StepItem { id: string; label: string; description?: string; disabled?: boolean; status?: "complete" | "error" }
export interface StepIndicatorProps { label: string; steps: readonly StepItem[]; current: number; onStepChange?: (index: number) => void; orientation?: "horizontal" | "vertical"; className?: string }
export function StepIndicator({ label, steps, current, onStepChange, orientation = "horizontal", className }: StepIndicatorProps) {
  if (!Number.isInteger(current) || current < 0 || current >= steps.length || new Set(steps.map(step => step.id)).size !== steps.length) throw new RangeError("Invalid step index or IDs")
  return <ol aria-label={label} data-slot="step-indicator" data-orientation={orientation} className={cn("aq-step-indicator", className)}>{steps.map((step, index) => <li key={step.id} data-current={index === current || undefined} data-status={step.status}>
    {onStepChange ? <Button variant="ghost" className="aq-step-action" disabled={step.disabled} aria-current={index === current ? "step" : undefined} onClick={() => onStepChange(index)}><span className="aq-step-dot">{step.status === "complete" ? <Check /> : index + 1}</span><span className="aq-step-copy"><strong>{step.label}</strong>{step.description && <small>{step.description}</small>}</span></Button> : <span className="aq-step-action" aria-current={index === current ? "step" : undefined}><span className="aq-step-dot">{step.status === "complete" ? <Check /> : index + 1}</span><span className="aq-step-copy"><strong>{step.label}</strong>{step.description && <small>{step.description}</small>}</span></span>}
  </li>)}</ol>
}
