"use client"

import * as React from "react"
import { useAqualyUIScope } from "#components/aqualy-ui-scope"
import { RadioGroupField, RadioGroupOption } from "#components/radio-group"
import { cn } from "#lib/utils"
import { clampSplit, splitFromPointer, splitFromKey } from "#lib/resizable-model"
export { clampSplit, splitFromPointer, splitFromKey } from "#lib/resizable-model"
export interface ResizablePanel { label: string; content: React.ReactNode }
export interface ResizablePanelsProps {
  label: string; start: ResizablePanel; end: ResizablePanel; orientation?: "horizontal" | "vertical"
  value?: number; defaultValue?: number; min?: number; max?: number; disabled?: boolean
  onValueChange?: (value: number) => void; onValueCommit?: (value: number) => void
  mobileView?: "start" | "end"; defaultMobileView?: "start" | "end"; onMobileViewChange?: (value: "start" | "end") => void
  mobileViewLabel?: string; className?: string
}
// The approved design is a bounded two-panel inspector. Routing and record selection remain caller-owned.
export function ResizablePanels({ label, start, end, orientation = "horizontal", value, defaultValue = 45, min = 25, max = 75, disabled = false, onValueChange, onValueCommit, mobileView, defaultMobileView = "start", onMobileViewChange, mobileViewLabel = "Panel view", className }: ResizablePanelsProps) {
  const { dir } = useAqualyUIScope(), id = React.useId(), grid = React.useRef<HTMLDivElement>(null)
  const [local, setLocal] = React.useState(defaultValue), [localView, setLocalView] = React.useState(defaultMobileView), [dragging, setDragging] = React.useState(false)
  const current = clampSplit(value ?? local, min, max), view = mobileView ?? localView
  const latest = React.useRef(current); latest.current = current
  const drag = React.useRef<{ pointer: number; initial: number; value: number } | null>(null)
  const update = (next: number) => { const clamped = clampSplit(next, min, max); latest.current = clamped; if (value === undefined) setLocal(clamped); onValueChange?.(clamped); return clamped }
  const setView = (next: string) => { if (next !== "start" && next !== "end") return; if (mobileView === undefined) setLocalView(next); onMobileViewChange?.(next) }
  const endDrag = (event: React.PointerEvent<HTMLDivElement>, cancel = false) => {
    const active = drag.current; if (!active || event.pointerId !== active.pointer) return
    drag.current = null; setDragging(false)
    if (cancel || disabled) update(active.initial); else onValueCommit?.(active.value)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }
  const tracks = `${current}fr 7px ${100 - current}fr`
  return <section data-slot="resizable" data-orientation={orientation} data-mobile-view={view} data-resizing={dragging || undefined} aria-label={label} className={cn("aq-resizable", className)}>
    {orientation === "horizontal" && <div className="aq-resize-mobile"><RadioGroupField label={mobileViewLabel} layout="inline" size="sm" value={view} onValueChange={setView}><RadioGroupOption value="start" label={start.label} /><RadioGroupOption value="end" label={end.label} /></RadioGroupField></div>}
    <div ref={grid} className="aq-resize-grid" style={orientation === "horizontal" ? { gridTemplateColumns: tracks } : { gridTemplateRows: tracks }}>
      <div id={`${id}-start`} data-panel="start" className="aq-resize-panel" role="region" aria-label={start.label}>{start.content}</div>
      <div role="separator" tabIndex={disabled ? -1 : 0} className="aq-resize-handle" aria-label={label} aria-controls={`${id}-start ${id}-end`} aria-orientation={orientation === "horizontal" ? "vertical" : "horizontal"} aria-valuemin={min} aria-valuemax={max} aria-valuenow={current} aria-valuetext={`${current}% ${start.label}`} aria-disabled={disabled || undefined}
        onPointerDown={event => { if (disabled || event.button !== 0 || drag.current) return; event.preventDefault(); event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId); drag.current = { pointer: event.pointerId, initial: current, value: current }; setDragging(true) }}
        onPointerMove={event => { const active = drag.current, bounds = grid.current?.getBoundingClientRect(); if (disabled || !active || active.pointer !== event.pointerId || !bounds) return; const next = splitFromPointer(orientation === "horizontal" ? event.clientX - bounds.left : event.clientY - bounds.top, orientation === "horizontal" ? bounds.width : bounds.height, orientation === "horizontal" && dir === "rtl"); if (next !== null) active.value = update(next) }}
        onPointerUp={event => endDrag(event)} onPointerCancel={event => endDrag(event, true)}
        onLostPointerCapture={event => { if (drag.current) endDrag(event, true) }}
        onKeyDown={event => { if (disabled) return; if (event.key === "Escape" && drag.current) { event.preventDefault(); const active = drag.current; drag.current = null; setDragging(false); update(active.initial); if (event.currentTarget.hasPointerCapture(active.pointer)) event.currentTarget.releasePointerCapture(active.pointer); return } if (drag.current) return; const next = splitFromKey(event.key, latest.current, orientation, dir === "rtl", min, max, event.shiftKey); if (next !== null) { event.preventDefault(); onValueCommit?.(update(next)) } }}><span aria-hidden="true" /></div>
      <div id={`${id}-end`} data-panel="end" className="aq-resize-panel" role="region" aria-label={end.label}>{end.content}</div>
    </div>
  </section>
}
