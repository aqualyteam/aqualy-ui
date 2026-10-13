export function parseCalendarDate(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new RangeError("Use a YYYY-MM-DD calendar date")
  const result = new Date(`${value}T12:00:00Z`)
  if (!Number.isFinite(result.getTime()) || result.toISOString().slice(0, 10) !== value) throw new RangeError("Invalid calendar date")
  return result
}
export const calendarDate = (date: Date) => date.toISOString().slice(0, 10)
export function shiftCalendarDate(value: string, days: number) {
  const date = parseCalendarDate(value)
  date.setUTCDate(date.getUTCDate() + days)
  return calendarDate(date)
}
export function shiftCalendarMonth(value: string, months: number) {
  const date = parseCalendarDate(value), day = date.getUTCDate()
  date.setUTCDate(1)
  date.setUTCMonth(date.getUTCMonth() + months)
  const last = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate()
  date.setUTCDate(Math.min(day, last))
  return calendarDate(date)
}
export function calendarWeekStart(value: string, weekStartsOn = 1) {
  return shiftCalendarDate(value, -((parseCalendarDate(value).getUTCDay() - weekStartsOn + 7) % 7))
}
export function calendarMonthDays(value: string, weekStartsOn = 1) {
  const first = calendarWeekStart(`${value.slice(0, 7)}-01`, weekStartsOn)
  return Array.from({ length: 42 }, (_, index) => shiftCalendarDate(first, index))
}
export const calendarDateLabel = (value: string, locale = "en-GB", options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) =>
  new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).format(parseCalendarDate(value))
export function timeMinutes(value: string) {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new RangeError("Use a valid HH:mm wall-clock time")
  return Number(value.slice(0, 2)) * 60 + Number(value.slice(3))
}
export type CalendarEvent = {
  id: string; title: string; startDate: string; endDate?: string
  allDay?: boolean; startTime?: string; endTime?: string
  tone?: "neutral" | "info" | "success" | "warning" | "danger"
  category?: string; location?: string; description?: string
}
export function validateCalendarEvent(event: CalendarEvent) {
  parseCalendarDate(event.startDate)
  const end = event.endDate ?? event.startDate
  parseCalendarDate(end)
  if (end < event.startDate) throw new RangeError("Event end date precedes its start date")
  if (!event.allDay) {
    if (!event.startTime || !event.endTime) throw new RangeError("Timed events require startTime and endTime")
    const startTime = timeMinutes(event.startTime), endTime = timeMinutes(event.endTime)
    if (end === event.startDate && endTime <= startTime) throw new RangeError("Event end must follow its start")
  }
}
export const eventsOnDate = (events: CalendarEvent[], date: string) => events.filter(event => event.startDate <= date && (event.endDate ?? event.startDate) >= date && (event.allDay || event.endTime !== "00:00" || (event.endDate ?? event.startDate) !== date))
export function calendarSpanLayout(days: string[], events: CalendarEvent[]) {
  const lanes: number[] = []
  return events.filter(event => event.allDay || (event.endDate ?? event.startDate) > event.startDate)
    .map(event => ({ event, start: Math.max(0, days.findIndex(date => date >= event.startDate)),
      end: days.findLastIndex(date => date <= (!event.allDay && event.endTime === "00:00" ? shiftCalendarDate(event.endDate ?? event.startDate, -1) : event.endDate ?? event.startDate)) }))
    .filter(segment => segment.end >= 0 && segment.event.startDate <= days[days.length - 1])
    .sort((a, b) => a.start - b.start || b.end - a.end || a.event.id.localeCompare(b.event.id))
    .map(segment => {
      let lane = lanes.findIndex(end => end < segment.start)
      if (lane < 0) lane = lanes.length
      lanes[lane] = segment.end
      return { ...segment, lane, continuesBefore: segment.event.startDate < days[0], continuesAfter: (segment.event.endDate ?? segment.event.startDate) > days[days.length - 1] }
    })
}
export function calendarTimedLayout(events: CalendarEvent[], date: string, startHour = 0, endHour = 24) {
  const segments = eventsOnDate(events, date).filter(event => !event.allDay).map(event => ({ event,
    start: Math.max(startHour * 60, event.startDate === date ? timeMinutes(event.startTime!) : 0),
    end: Math.min(endHour * 60, (event.endDate ?? event.startDate) === date ? timeMinutes(event.endTime!) : 1440),
  })).filter(segment => segment.end > segment.start).sort((a, b) => a.start - b.start || a.end - b.end)
  const result: (typeof segments[number] & { lane: number; lanes: number })[] = []
  let cluster: typeof segments = [], latestEnd = 0
  const flush = () => {
    const ends: number[] = []
    const placed = cluster.map(segment => {
      let lane = ends.findIndex(end => end <= segment.start)
      if (lane < 0) lane = ends.length
      ends[lane] = segment.end
      return { ...segment, lane }
    })
    result.push(...placed.map(segment => ({ ...segment, lanes: ends.length })))
    cluster = []
  }
  for (const segment of segments) {
    if (cluster.length && segment.start >= latestEnd) { flush(); latestEnd = 0 }
    cluster.push(segment); latestEnd = Math.max(latestEnd, segment.end)
  }
  if (cluster.length) flush()
  return result
}
