"use client"

import * as React from "react"
import { DirectionProvider } from "@base-ui/react/direction-provider"
import { DayPicker, useDayPicker, type DayPickerProps, type DayButtonProps, type MonthCaptionProps, TZDate } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "#components/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "#components/select"
import { useAqualyUIScope } from "#components/aqualy-ui-scope"
import { NavigationMenu, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuItem, NavigationMenuLabel } from "#lib/navigation-menu"
import { cn } from "#lib/utils"

export type CalendarAnnotation = { count?: number; label?: string; unavailableReason?: string; items?: { id: string; label: string; description?: string; onSelect?: () => void }[] }
export type CalendarProps = DayPickerProps & { annotations?: (date: Date) => CalendarAnnotation | undefined }
const AnnotationContext = React.createContext<CalendarProps["annotations"]>(undefined)
function CalendarDayButton({ day, modifiers, children, className, ...props }: DayButtonProps) {
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => { if (modifiers.focused) ref.current?.focus() }, [modifiers.focused])
  const annotation = React.useContext(AnnotationContext)?.(day.date)
  const label = [props["aria-label"], annotation?.unavailableReason, annotation?.count ? `${annotation.count} items` : ""].filter(Boolean).join("; ")
  const element = <Button {...props} ref={ref} variant="ghost" size="icon" className={cn("aq-calendar-day", className)}
    data-date={`${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, "0")}-${String(day.date.getDate()).padStart(2, "0")}`}
    aria-label={label} disabled={props.disabled || !!annotation?.unavailableReason}>
    <span>{children}</span>{annotation?.count ? <span className="aq-calendar-count" aria-hidden="true">{annotation.count}</span> : null}
    {annotation?.label && <span className="aq-calendar-tag" aria-hidden="true">{annotation.label}</span>}
  </Button>
  return annotation?.items?.length && !props.disabled && !annotation.unavailableReason ? <NavigationMenu>
    <NavigationMenuTrigger render={element} />
    <NavigationMenuContent aria-label={label}><NavigationMenuLabel>{label}</NavigationMenuLabel>
      {annotation.items.map(item => <NavigationMenuItem key={item.id} onClick={item.onSelect}><span>{item.label}</span>{item.description && <small>{item.description}</small>}</NavigationMenuItem>)}
    </NavigationMenuContent>
  </NavigationMenu> : element
}
function CalendarCaption({ calendarMonth, displayIndex, ...props }: MonthCaptionProps) {
  const { goToMonth, dayPickerProps, formatters } = useDayPicker()
  const date = calendarMonth.date
  if ((dayPickerProps.captionLayout ?? "label") === "label") return <div {...props}>{formatters.formatCaption(date)}</div>
  const first = dayPickerProps.startMonth?.getFullYear() ?? date.getFullYear() - 100
  const last = dayPickerProps.endMonth?.getFullYear() ?? date.getFullYear() + 10
  const zone = dayPickerProps.timeZone
  const target = (year: number, month: number) => zone ? new TZDate(year, month - displayIndex, 1, zone) : new Date(year, month - displayIndex, 1)
  return <div {...props} className={cn(props.className, "aq-calendar-caption-selects")}>
    <Select value={date.getMonth()} onValueChange={month => { if (month !== null) goToMonth(target(date.getFullYear(), month)) }}>
      <SelectTrigger size="sm" aria-label="Month"><SelectValue>{formatters.formatMonthDropdown(date)}</SelectValue></SelectTrigger><SelectContent><SelectGroup>
        {Array.from({ length: 12 }, (_, month) => <SelectItem key={month} value={month}
          disabled={(date.getFullYear() === first && month < (dayPickerProps.startMonth?.getMonth() ?? 0)) || (date.getFullYear() === last && month > (dayPickerProps.endMonth?.getMonth() ?? 11))}>
          {formatters.formatMonthDropdown(target(date.getFullYear(), month + displayIndex))}</SelectItem>)}
      </SelectGroup></SelectContent>
    </Select>
    <Select value={date.getFullYear()} onValueChange={year => { if (year !== null) goToMonth(target(year, date.getMonth())) }}>
      <SelectTrigger size="sm" aria-label="Year"><SelectValue /></SelectTrigger><SelectContent><SelectGroup>
        {Array.from({ length: last - first + 1 }, (_, index) => <SelectItem key={first + index} value={first + index}>{first + index}</SelectItem>)}
      </SelectGroup></SelectContent>
    </Select>
  </div>
}

export function Calendar({ className, annotations, classNames, components, dir, disabled, ...props }: CalendarProps) {
  const scope = useAqualyUIScope()
  const direction = dir === "ltr" || dir === "rtl" ? dir : scope.dir
  return <DirectionProvider direction={direction}><AnnotationContext.Provider value={annotations}><DayPicker weekStartsOn={1} fixedWeeks showOutsideDays
    {...props} disabled={annotations ? [...(Array.isArray(disabled) ? disabled : disabled === undefined ? [] : [disabled]), (date: Date) => !!annotations(date)?.unavailableReason] : disabled} dir={dir ?? scope.dir} className={cn("aq-calendar", className)}
    classNames={{ root: "aq-calendar", months: "aq-calendar-months", month: "aq-calendar-month", month_caption: "aq-calendar-caption", caption_label: "aq-calendar-caption-label",
      nav: "aq-calendar-nav", month_grid: "aq-calendar-grid", weekdays: "aq-calendar-weekdays", weekday: "aq-calendar-weekday", week: "aq-calendar-week", day: "aq-calendar-cell",
      today: "aq-calendar-today", selected: "aq-calendar-selected", outside: "aq-calendar-outside", disabled: "aq-calendar-disabled",
      range_start: "aq-calendar-range-start", range_middle: "aq-calendar-range-middle", range_end: "aq-calendar-range-end", ...classNames }}
    components={{ DayButton: CalendarDayButton, MonthCaption: CalendarCaption,
      PreviousMonthButton: props => <Button {...props} variant="ghost" size="icon-sm"><ChevronLeft data-directional="true" /></Button>,
      NextMonthButton: props => <Button {...props} variant="ghost" size="icon-sm"><ChevronRight data-directional="true" /></Button>, ...components }} />
  </AnnotationContext.Provider></DirectionProvider>
}

export { DatePicker, DateRangePicker, TimePicker, TimeSlotPicker, DateTimePicker } from "#components/calendar-pickers"
export { OperationsCalendar, CalendarEventDialog } from "#components/calendar-operations"
export type { DateRange } from "react-day-picker"
export type { CalendarEvent } from "#lib/calendar-date"
export type { OperationsCalendarProps, CalendarView, CalendarEventDialogProps } from "#components/calendar-operations"
export type { DatePickerProps, DateRangePickerProps, TimePickerProps, TimeSlotPickerProps, DateTimePickerProps } from "#components/calendar-pickers"
