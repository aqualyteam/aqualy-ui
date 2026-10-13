"use client"

import * as React from "react"
import { Dialog } from "@base-ui/react/dialog"
import { ChevronLeft, ChevronRight, Maximize, X } from "lucide-react"
import { Button } from "#components/button"
import { Badge } from "#components/badge"
import { DatePicker } from "#components/calendar-pickers"
import { useAqualyUIScope } from "#components/aqualy-ui-scope"
import { AqualyUIPortalScope } from "#components/aqualy-ui-portal"
import { NavigationMenu, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuItem, NavigationMenuLabel } from "#lib/navigation-menu"
import { calendarDateLabel, calendarMonthDays, calendarSpanLayout, calendarTimedLayout, calendarWeekStart, eventsOnDate, shiftCalendarDate, shiftCalendarMonth, validateCalendarEvent, type CalendarEvent } from "#lib/calendar-date"
import { cn } from "#lib/utils"

export type CalendarView = "month" | "week" | "day" | "agenda"
export type CalendarEventDialogProps = {
  event: CalendarEvent | null; onOpenChange: (open: boolean) => void; timeZone: string
  locale?: string; closeLabel?: string; children?: React.ReactNode
}
export function CalendarEventDialog({ event, onOpenChange, timeZone, locale = "en-GB", closeLabel = "Close event details", children }: CalendarEventDialogProps) {
  // Retain the last record throughout the exit animation.
  const last = React.useRef(event)
  React.useEffect(() => { if (event) last.current = event }, [event])
  const record = event ?? last.current
  return <Dialog.Root open={!!event} onOpenChange={onOpenChange}><Dialog.Portal><AqualyUIPortalScope layer="overlay">
    <Dialog.Backdrop className="aq-alert-dialog-backdrop" /><Dialog.Viewport className="aq-alert-dialog-viewport">
      <Dialog.Popup className="aq-alert-dialog-content" data-size="default" aria-label="Event details">
        <div className="aq-alert-dialog-header"><Dialog.Title className="aq-alert-dialog-title">{record?.title}</Dialog.Title>
          <Dialog.Description className="aq-alert-dialog-description">{record?.description ?? "Scheduled activity details"}</Dialog.Description>
          {record && <dl className="aq-calendar-event-facts"><div><dt>Date</dt><dd><bdi>{calendarDateLabel(record.startDate, locale)}{record.endDate && record.endDate !== record.startDate ? ` – ${calendarDateLabel(record.endDate, locale)}` : ""}</bdi></dd></div>
            <div><dt>Time</dt><dd><bdi>{record.allDay ? "All day" : `${record.startTime} – ${record.endTime}`}</bdi></dd></div><div><dt>Time zone</dt><dd><bdi>{timeZone}</bdi></dd></div>
            {record.location && <div><dt>Location</dt><dd>{record.location}</dd></div>}</dl>}{children}</div>
        <div className="aq-alert-dialog-footer"><Dialog.Close render={<Button variant="outline" />} aria-label={closeLabel}>{closeLabel}</Dialog.Close></div>
      </Dialog.Popup>
    </Dialog.Viewport>
  </AqualyUIPortalScope></Dialog.Portal></Dialog.Root>
}
export type OperationsCalendarProps = Omit<React.ComponentProps<"div">, "children" | "onSelect"> & {
  events: CalendarEvent[]; currentDate: string; timeZone: string; locale?: string
  date?: string; defaultDate?: string; onDateChange?: (date: string) => void
  view?: CalendarView; defaultView?: CalendarView; onViewChange?: (view: CalendarView) => void
  weekStartsOn?: 0 | 1; startHour?: number; endHour?: number
  onEventSelect?: (event: CalendarEvent) => void; filters?: React.ReactNode
  labels?: Partial<Record<CalendarView | "today" | "previous" | "next" | "jump" | "expand" | "close" | "allDay" | "empty" | "title", string>>
}
export function OperationsCalendar({ events, currentDate, timeZone, locale = "en-GB", date: controlledDate, defaultDate,
  onDateChange, view: controlledView, defaultView = "month", onViewChange, weekStartsOn = 1, startHour = 7, endHour = 18,
  onEventSelect, filters, labels, className, ...props }: OperationsCalendarProps) {
  const [localDate, setDate] = React.useState(defaultDate ?? currentDate), [localView, setView] = React.useState(defaultView)
  const [full, setFull] = React.useState(false), [focusedDate, setFocusedDate] = React.useState(controlledDate ?? defaultDate ?? currentDate)
  const boardRoot = React.useRef<HTMLDivElement>(null)
  const { dir } = useAqualyUIScope()
  const date = controlledDate ?? localDate, view = controlledView ?? localView
  const text = { month: "Month", week: "Week", day: "Day", agenda: "Agenda", today: "Today", previous: "Previous period", next: "Next period", jump: "Jump to date", expand: "Full-page view", close: "Close full-page calendar", allDay: "All day / Multi-day", empty: "No activities scheduled", title: "Operations calendar", ...labels }
  const ids = new Set<string>()
  for (const event of events) { validateCalendarEvent(event); if (ids.has(event.id)) throw new RangeError("Calendar event IDs must be unique"); ids.add(event.id) }
  if (!Number.isInteger(startHour) || !Number.isInteger(endHour) || startHour < 0 || endHour > 24 || startHour >= endHour) throw new RangeError("Calendar hours must be an increasing 0–24 window")
  const changeDate = (next: string) => { setDate(next); setFocusedDate(next); onDateChange?.(next) }
  const changeView = (next: CalendarView) => { setView(next); onViewChange?.(next) }
  const days = view === "month" ? calendarMonthDays(date, weekStartsOn) : view === "day" ? [date] : Array.from({ length: 7 }, (_, index) => shiftCalendarDate(calendarWeekStart(date, weekStartsOn), index))
  const focusDate = days.includes(focusedDate) ? focusedDate : days.includes(date) ? date : days[0]
  const labelDate = (day: string) => calendarDateLabel(day, locale)
  const select = (event: CalendarEvent) => onEventSelect?.(event)
  const eventLabel = (event: CalendarEvent) => `${event.title}; ${labelDate(event.startDate)}${event.endDate && event.endDate !== event.startDate ? ` – ${labelDate(event.endDate)}` : ""}; ${event.allDay ? text.allDay : `${event.startTime}–${event.endTime}`} ${timeZone}`
  const eventButton = (event: CalendarEvent, extraClass?: string, style?: React.CSSProperties, visibleTime?: string) => <Button key={event.id} size="xs" variant="ghost" className={cn("aq-operations-event", extraClass)}
    data-event-id={event.id} data-tone={event.tone ?? "neutral"} onClick={() => select(event)} aria-label={eventLabel(event)} style={style}>
    <bdi>{event.allDay ? "All day" : visibleTime ?? event.startTime}</bdi><strong>{event.title}</strong>{event.location && <small>{event.location}</small>}
  </Button>
  const dateMenu = (day: string) => {
    const items = eventsOnDate(events, day)
    return <NavigationMenu><NavigationMenuTrigger render={<Button variant="ghost" size="icon-xs" />} aria-label={`${labelDate(day)}; ${items.length} items`}
      aria-current={day === currentDate ? "date" : undefined} aria-pressed={day === focusDate} tabIndex={day === focusDate ? 0 : -1}
      data-calendar-date={day} onClick={() => setFocusedDate(day)} onKeyDown={event => {
        const shift = event.key === "ArrowLeft" ? dir === "rtl" ? 1 : -1 : event.key === "ArrowRight" ? dir === "rtl" ? -1 : 1 : event.key === "ArrowUp" ? -7 : event.key === "ArrowDown" ? 7 : undefined
        const target = shift !== undefined ? shiftCalendarDate(day, shift) : event.key === "Home" ? calendarWeekStart(day, weekStartsOn) : event.key === "End" ? shiftCalendarDate(calendarWeekStart(day, weekStartsOn), 6) : event.key === "PageUp" || event.key === "PageDown" ? shiftCalendarMonth(day, event.key === "PageUp" ? -1 : 1) : undefined
        if (!target) return
        event.preventDefault(); event.stopPropagation(); event.preventBaseUIHandler()
        setFocusedDate(target)
        if (!days.includes(target) || (view === "month" && target.slice(0,7) !== date.slice(0,7))) changeDate(target)
        requestAnimationFrame(() => boardRoot.current?.querySelector<HTMLButtonElement>(`[data-calendar-date="${target}"]`)?.focus({preventScroll:true}))
      }} className="aq-operations-date"><bdi>{Number(day.slice(8))}</bdi>{items.length > 0 && <span className="aq-calendar-count" aria-hidden="true">{items.length}</span>}</NavigationMenuTrigger>
      <NavigationMenuContent aria-label={labelDate(day)}><NavigationMenuLabel><bdi>{labelDate(day)}</bdi></NavigationMenuLabel>
        {items.length ? items.map(event => <NavigationMenuItem key={event.id} onClick={() => select(event)}><span>{event.title}</span><small><bdi>{event.allDay ? text.allDay : `${event.startTime} – ${event.endTime}`}</bdi> · {event.location}</small></NavigationMenuItem>) : <p className="aq-type-caption">{text.empty}</p>}
        <NavigationMenuItem onClick={() => { changeDate(day); changeView("day") }}>{text.day}</NavigationMenuItem>
      </NavigationMenuContent>
    </NavigationMenu>
  }
  const spans = (visibleDays: string[]) => {
    const segments = calendarSpanLayout(visibleDays, events)
    return <div className="aq-operations-spans" style={{ gridTemplateColumns: `repeat(${visibleDays.length}, minmax(0, 1fr))` }}>
      {segments.map(segment => eventButton(segment.event, cn("aq-operations-span", segment.continuesBefore && "aq-span-before", segment.continuesAfter && "aq-span-after"),
        { gridColumn: `${segment.start + 1} / span ${segment.end - segment.start + 1}`, gridRow: segment.lane + 1 }))}
    </div>
  }
  const dayHeading = (day: string) => <div className="aq-operations-day-heading"><span>{calendarDateLabel(day, locale, { weekday: "short" })}</span>{dateMenu(day)}</div>
  const month = <div className="aq-operations-month" role="region" aria-label={calendarDateLabel(date, locale, { month: "long", year: "numeric" })}>
    <div className="aq-operations-weekdays">{days.slice(0, 7).map(day => <span key={day}>{calendarDateLabel(day, locale, { weekday: "short" })}</span>)}</div>
    {Array.from({ length: 6 }, (_, index) => {
      const week = days.slice(index * 7, index * 7 + 7)
      return <div className="aq-operations-month-week" key={week[0]}><div className="aq-operations-dates">{week.map(day => <div key={day} data-outside={day.slice(0, 7) !== date.slice(0, 7)}>{dateMenu(day)}</div>)}</div>
        {spans(week)}<div className="aq-operations-month-timed">{week.map(day => <div key={day}>{eventsOnDate(events, day).filter(event => !event.allDay && !(event.endDate && event.endDate !== event.startDate)).slice(0, 2).map(event => eventButton(event))}</div>)}</div>
      </div>
    })}
  </div>
  const timeline = <div className="aq-operations-timeline-scroll" tabIndex={0} role="region" aria-label={`${text[view]} · ${timeZone}`}>
    <div className="aq-operations-timeline" data-view={view} style={{ "--aq-days": days.length } as React.CSSProperties}>
      <div className="aq-operations-timeline-heading"><span className="aq-time-zone"><bdi>{timeZone}</bdi></span>{days.map(day => <React.Fragment key={day}>{dayHeading(day)}</React.Fragment>)}</div>
      <div className="aq-operations-all-day"><span>{text.allDay}</span>{spans(days)}</div>
      <div className="aq-operations-time-body"><div className="aq-operations-axis">{Array.from({ length: endHour - startHour }, (_, index) => <bdi key={index}>{String(index + startHour).padStart(2, "0")}:00</bdi>)}</div>
        {days.map(day => <div key={day} className="aq-operations-time-column" style={{ height: (endHour - startHour) * 64 }}>
          {calendarTimedLayout(events, day, startHour, endHour).map(segment => eventButton(segment.event, "aq-operations-timed", {
            top: (segment.start - startHour * 60) / 60 * 64, height: Math.max(24, (segment.end - segment.start) / 60 * 64 - 2),
            insetInlineStart: `calc(${segment.lane / segment.lanes * 100}% + 2px)`, width: `calc(${100 / segment.lanes}% - 4px)`,
          }, `${String(Math.floor(segment.start / 60)).padStart(2, "0")}:${String(segment.start % 60).padStart(2, "0")}`))}
        </div>)}
      </div>
    </div>
  </div>
  const agenda = <div className="aq-operations-agenda">{days.map(day => <section key={day}><h4>{calendarDateLabel(day, locale, { weekday: "short", day: "numeric", month: "short" })}</h4>
    {eventsOnDate(events, day).length ? eventsOnDate(events, day).map(event => <Button key={event.id} variant="ghost" className="aq-operations-agenda-event" onClick={() => select(event)}>
      <bdi>{event.allDay ? text.allDay : `${event.startTime} – ${event.endTime}`}</bdi><span><strong>{event.title}</strong><small>{event.location}{event.endDate && event.endDate !== event.startDate ? ` · ${labelDate(event.startDate)} – ${labelDate(event.endDate)}` : ""}</small></span><Badge size="xs" variant={event.tone === "neutral" || !event.tone ? "secondary" : event.tone}>{event.category ?? "Event"}</Badge>
    </Button>) : <p>{text.empty}</p>}
  </section>)}</div>
  const board = <div ref={boardRoot} className="aq-operations-body">
    <div className="aq-operations-toolbar"><div className="aq-operations-period"><Button size="icon-sm" variant="ghost" aria-label={text.previous} onClick={() => changeDate(view === "month" ? shiftCalendarMonth(date, -1) : shiftCalendarDate(date, view === "day" ? -1 : -7))}><ChevronLeft data-directional="true" /></Button>
      <Button size="icon-sm" variant="ghost" aria-label={text.next} onClick={() => changeDate(view === "month" ? shiftCalendarMonth(date, 1) : shiftCalendarDate(date, view === "day" ? 1 : 7))}><ChevronRight data-directional="true" /></Button>
      <Button size="sm" variant="ghost" onClick={() => changeDate(currentDate)}>{text.today}</Button><strong><bdi>{view === "month" ? calendarDateLabel(date, locale, { month: "long", year: "numeric" }) : view === "day" ? labelDate(date) : `${labelDate(days[0])} – ${labelDate(days[days.length - 1])}`}</bdi></strong></div>
      <div className="aq-operations-views" role="group" aria-label="Calendar view">{(["month", "week", "day", "agenda"] as const).map(next => <Button key={next} size="sm" variant={view === next ? "secondary" : "ghost"} aria-pressed={view === next} onClick={() => changeView(next)}>{text[next]}</Button>)}</div>
    </div><div className="aq-operations-filters">{filters}<DatePicker label={text.jump} value={new Date(`${date}T12:00:00`)} onValueChange={next => { if (next) changeDate(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`) }} /></div>
    {view === "month" ? month : view === "agenda" ? agenda : timeline}
    <div className="aq-operations-footer"><bdi>{timeZone}</bdi><span>{new Set(days.flatMap(day => eventsOnDate(events, day).map(event => event.id))).size} activities · spanning events counted once</span></div>
  </div>
  return <Dialog.Root open={full} onOpenChange={setFull}><div {...props} data-slot="operations-calendar" className={cn("aq-operations", className)}>
    <div className="aq-operations-heading"><h3>{text.title}</h3><Dialog.Trigger render={<Button variant="outline" size="sm" />}><Maximize />{text.expand}</Dialog.Trigger></div>
    {!full && board}
  </div><Dialog.Portal><AqualyUIPortalScope layer="overlay"><Dialog.Backdrop className="aq-alert-dialog-backdrop" /><Dialog.Viewport className="aq-calendar-fullscreen-viewport">
    <Dialog.Popup className="aq-calendar-fullscreen"><div className="aq-operations-heading"><Dialog.Title>{text.title}</Dialog.Title><Dialog.Close render={<Button variant="ghost" size="icon-sm" />} aria-label={text.close}><X /></Dialog.Close></div>
      <Dialog.Description className="sr-only">{timeZone}</Dialog.Description>{board}
    </Dialog.Popup>
  </Dialog.Viewport></AqualyUIPortalScope></Dialog.Portal></Dialog.Root>
}
