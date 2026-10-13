"use client"

import * as React from "react"
import { CalendarDays, Clock } from "lucide-react"
import { type DateRange, type Matcher, rangeContainsModifiers } from "react-day-picker"
import { Calendar, type CalendarProps } from "#components/calendar"
import { Button } from "#components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle } from "#components/popover"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "#components/select"
import { timeMinutes } from "#lib/calendar-date"
import { cn } from "#lib/utils"

type PickerCalendarProps = Omit<CalendarProps, "mode" | "selected" | "onSelect" | "required" | "disabled" | "className">
type PickerBase = {
  label: string; placeholder?: string; disabled?: boolean; invalid?: boolean; size?: "xs" | "sm" | "default" | "lg"
  disabledDates?: Matcher | Matcher[]; calendarProps?: PickerCalendarProps
  className?: string; locale?: string; formatDate?: (date: Date) => string
}
export type DatePickerProps = PickerBase & { value?: Date; onValueChange: (value: Date | undefined) => void }
const format = (date: Date, locale?: string, timeZone?: string) => new Intl.DateTimeFormat(locale ?? "en-GB", { day: "numeric", month: "short", year: "numeric", timeZone }).format(date)
export function DatePicker({ value, onValueChange, label, placeholder = "Choose a date", disabled, invalid, size="default",
  disabledDates, calendarProps, className, locale, formatDate = date => format(date, locale, calendarProps?.timeZone) }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger render={<Button variant="outline" size={size} />} disabled={disabled} aria-invalid={invalid || undefined} aria-label={label}
      className={cn("aq-date-picker-trigger", className)}><CalendarDays data-icon="inline-start" /><bdi>{value ? formatDate(value) : placeholder}</bdi></PopoverTrigger>
    <PopoverContent className="aq-date-picker-popup" aria-label={label} initialFocus>
      <PopoverTitle className="sr-only">{label}</PopoverTitle>
      <Calendar {...calendarProps} autoFocus mode="single" selected={value} defaultMonth={calendarProps?.defaultMonth ?? value}
        disabled={disabledDates} onSelect={date => { onValueChange(date); setOpen(false) }} />
    </PopoverContent>
  </Popover>
}
export type DateRangePickerProps = PickerBase & {
  value?: DateRange; onValueChange: (value: DateRange | undefined) => void
  applyLabel?: string; clearLabel?: string; incompleteLabel?: string
  presets?: { label: string; value: DateRange }[]
}
export function DateRangePicker({ value, onValueChange, label, placeholder = "Choose a date range", disabled, invalid, size="default",
  disabledDates, calendarProps, className, locale, formatDate = date => format(date, locale, calendarProps?.timeZone), applyLabel = "Apply range", clearLabel = "Clear",
  incompleteLabel = "Choose an end date", presets }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false), [draft, setDraft] = React.useState(value)
  const valid = !!draft?.from && !!draft.to && !(disabledDates && rangeContainsModifiers({ from: draft.from, to: draft.to }, disabledDates))
  return <Popover open={open} onOpenChange={next => { if (next) setDraft(value); setOpen(next) }}>
    <PopoverTrigger render={<Button variant="outline" size={size} />} disabled={disabled} aria-invalid={invalid || undefined} aria-label={label}
      className={cn("aq-date-picker-trigger", className)}><CalendarDays /><bdi>{value?.from ? `${formatDate(value.from)} – ${value.to ? formatDate(value.to) : incompleteLabel}` : placeholder}</bdi></PopoverTrigger>
    <PopoverContent className="aq-date-picker-popup aq-date-range-popup" aria-label={label} initialFocus>
      <PopoverTitle className="sr-only">{label}</PopoverTitle>
      <Calendar numberOfMonths={2} {...calendarProps} autoFocus mode="range" selected={draft} defaultMonth={calendarProps?.defaultMonth ?? value?.from}
        disabled={disabledDates} excludeDisabled onSelect={(_, clicked) => {
          if (!draft?.from || draft.to || clicked < draft.from) { setDraft({ from: clicked }); return }
          const candidate = { from: draft.from, to: clicked }
          if (!disabledDates || !rangeContainsModifiers(candidate, disabledDates)) setDraft(candidate)
        }} />
      {presets?.length ? <div className="aq-calendar-presets">{presets.map(preset => <Button key={preset.label} size="xs" variant="ghost"
        disabled={!preset.value.from || !preset.value.to || (!!disabledDates && !!preset.value.from && !!preset.value.to && rangeContainsModifiers({ from: preset.value.from, to: preset.value.to }, disabledDates))} onClick={() => setDraft(preset.value)}>{preset.label}</Button>)}</div> : null}
      <div className="aq-calendar-picker-footer"><Button variant="ghost" size="sm" onClick={() => { onValueChange(undefined); setOpen(false) }}>{clearLabel}</Button>
        <Button size="sm" disabled={!valid} onClick={() => { onValueChange(draft); setOpen(false) }}>{applyLabel}</Button></div>
    </PopoverContent>
  </Popover>
}
function TimeSelect({ label, value, options, disabled, onChange }: { label: string; value: string; options: { value: string; label: string; disabled?: boolean }[]; disabled?: boolean; onChange: (value: string) => void }) {
  return <Select value={value} disabled={disabled} onValueChange={next => { if (next !== null) onChange(next) }} items={options}>
    <SelectTrigger aria-label={label}><SelectValue /></SelectTrigger><SelectContent><SelectGroup>
      {options.map(option => <SelectItem key={option.value} value={option.value} disabled={option.disabled}>{option.label}</SelectItem>)}
    </SelectGroup></SelectContent>
  </Select>
}
export type TimePickerProps = {
  value: string; onValueChange: (value: string) => void; label: string; disabled?: boolean; invalid?: boolean
  format?: "12" | "24"; onFormatChange?: (format: "12" | "24") => void; minuteStep?: 1 | 5 | 10 | 15 | 30
  timeZone?: string; timeZones?: string[]; onTimeZoneChange?: (zone: string) => void
  labels?: { hour?: string; minute?: string; period?: string; format?: string; timeZone?: string }
}
export function TimePicker({ value, onValueChange, label, disabled, invalid, format: controlledFormat, onFormatChange, minuteStep = 15,
  timeZone, timeZones, onTimeZoneChange, labels }: TimePickerProps) {
  timeMinutes(value)
  const [localFormat, setFormat] = React.useState<"12" | "24">("24")
  const displayFormat = controlledFormat ?? localFormat, hour = Number(value.slice(0, 2)), minute = Number(value.slice(3))
  const commit = (h: number, m: number) => onValueChange(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
  const minutes = [...new Set([...Array.from({ length: 60 / minuteStep }, (_, index) => index * minuteStep), minute])].sort((a, b) => a - b)
  return <div role="group" aria-label={label} data-invalid={invalid || undefined} className="aq-time-picker">
    <div className="aq-time-picker-fields">
      <TimeSelect label={labels?.hour ?? `${label} hour`} disabled={disabled} value={String(displayFormat === "12" ? hour % 12 || 12 : hour)}
        options={Array.from({ length: displayFormat === "12" ? 12 : 24 }, (_, index) => ({ value: String(displayFormat === "12" ? index + 1 : index), label: String(displayFormat === "12" ? index + 1 : index).padStart(2, "0") }))}
        onChange={h => commit(displayFormat === "12" ? Number(h) % 12 + (hour >= 12 ? 12 : 0) : Number(h), minute)} />
      <span aria-hidden="true">:</span><TimeSelect label={labels?.minute ?? `${label} minute`} disabled={disabled} value={String(minute)}
        options={minutes.map(m => ({ value: String(m), label: String(m).padStart(2, "0") }))} onChange={m => commit(hour, Number(m))} />
      {displayFormat === "12" && <TimeSelect label={labels?.period ?? `${label} period`} disabled={disabled} value={hour < 12 ? "am" : "pm"}
        options={[{ value: "am", label: "AM" }, { value: "pm", label: "PM" }]} onChange={period => commit(hour % 12 + (period === "pm" ? 12 : 0), minute)} />}
      <TimeSelect label={labels?.format ?? `${label} format`} disabled={disabled} value={displayFormat}
        options={[{ value: "24", label: "24-hour" }, { value: "12", label: "12-hour" }]}
        onChange={next => { if (next === "12" || next === "24") { setFormat(next); onFormatChange?.(next) } }} />
    </div>
    {timeZone && (timeZones && onTimeZoneChange ? <TimeSelect label={labels?.timeZone ?? `${label} time zone`} value={timeZone} disabled={disabled}
      options={timeZones.map(zone => ({ value: zone, label: zone }))} onChange={onTimeZoneChange} /> : <span className="aq-time-zone"><bdi>{timeZone}</bdi></span>)}
  </div>
}
export type TimeSlotPickerProps = { label: string; value?: string; onValueChange: (value: string) => void; disabled?: boolean; slots: { value: string; label?: string; unavailableReason?: string }[] }
export function TimeSlotPicker({ label, value, onValueChange, disabled, slots }: TimeSlotPickerProps) {
  const [open, setOpen] = React.useState(false)
  return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger render={<Button variant="outline" />} disabled={disabled} aria-label={label}>
    <Clock /><bdi>{value ?? label}</bdi></PopoverTrigger><PopoverContent aria-label={label}><PopoverTitle>{label}</PopoverTitle>
    <div className="aq-time-slots">{slots.map(slot => <Button key={slot.value} size="sm" variant={slot.value === value ? "default" : "outline"}
      disabled={!!slot.unavailableReason} aria-pressed={slot.value === value} aria-label={`${slot.label ?? slot.value}${slot.unavailableReason ? `; ${slot.unavailableReason}` : ""}`}
      onClick={() => { onValueChange(slot.value); setOpen(false) }}><bdi>{slot.label ?? slot.value}</bdi></Button>)}</div>
  </PopoverContent></Popover>
}
export type DateTimePickerProps = Omit<DatePickerProps, "value" | "onValueChange"> & {
  value: { date?: Date; time: string; timeZone: string }
  onValueChange: (value: { date?: Date; time: string; timeZone: string }) => void
  timeZones?: string[]
}
export function DateTimePicker({ value, onValueChange, timeZones, ...props }: DateTimePickerProps) {
  return <div className="aq-datetime-picker"><DatePicker {...props} value={value.date} onValueChange={date => onValueChange({ ...value, date })} />
    <TimePicker label={props.label} value={value.time} onValueChange={time => onValueChange({ ...value, time })} disabled={props.disabled} invalid={props.invalid}
      timeZone={value.timeZone} timeZones={timeZones} onTimeZoneChange={timeZone => onValueChange({ ...value, timeZone })} /></div>
}
