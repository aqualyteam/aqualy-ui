import assert from "node:assert/strict"
import test from "node:test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { DatePicker } from "../dist/components/calendar.js"
import { TZDate } from "react-day-picker"
import { Badge } from "../dist/components/badge.js"
import { Card, CardTitle, CardDescription } from "../dist/components/card.js"
import { parseCalendarDate, shiftCalendarDate, shiftCalendarMonth, calendarSpanLayout, calendarTimedLayout, validateCalendarEvent, eventsOnDate, type CalendarEvent } from "../src/lib/calendar-date.js"

test("badge is quiet, non-focusable status metadata with decorative processing icon", () => {
  const markup=renderToStaticMarkup(createElement(Badge,{size:"xs",variant:"warning",loading:true},"Payment processing"))
  assert.match(markup,/data-size="xs"/);assert.match(markup,/data-variant="warning"/)
  assert.match(markup,/Payment processing/);assert.match(markup,/aria-hidden="true"/)
  assert.doesNotMatch(markup,/tabindex|role="(?:status|alert)"/)
})
test("card composition preserves semantic title and description without imposing navigation", () => {
  const markup=renderToStaticMarkup(createElement(Card,{size:"sm"},createElement(CardTitle,null,"Open Water Diver"),createElement(CardDescription,null,"PADI · 4 components")))
  assert.match(markup,/<h3[^>]*>Open Water Diver<\/h3>/);assert.match(markup,/<p[^>]*>PADI/)
  assert.doesNotMatch(markup,/role="button"|tabindex/)
})
test("calendar arithmetic validates dates and crosses leap years and month ends correctly", () => {
  assert.throws(()=>parseCalendarDate("2026-02-29"),RangeError)
  assert.throws(()=>parseCalendarDate("10/12/2026"),RangeError)
  assert.equal(shiftCalendarDate("2024-02-28",1),"2024-02-29")
  assert.equal(shiftCalendarDate("2026-12-31",1),"2027-01-01")
  assert.equal(shiftCalendarMonth("2026-01-31",1),"2026-02-28")
})
test("spanning all-day events preserve continuation and allocate non-overlapping lanes", () => {
  const days=["2026-10-12","2026-10-13","2026-10-14"]
  const events:CalendarEvent[]=[{id:"a",title:"Training",startDate:"2026-10-10",endDate:"2026-10-13",allDay:true},{id:"b",title:"Vessel",startDate:"2026-10-13",endDate:"2026-10-16",allDay:true},{id:"outside",title:"Outside",startDate:"2026-11-01",allDay:true}]
  const result=calendarSpanLayout(days,events)
  assert.equal(result.length,2);assert.equal(result[0].continuesBefore,true);assert.equal(result[1].continuesAfter,true)
  assert.notEqual(result[0].lane,result[1].lane);assert.equal(result[1].end,2)
})
test("overnight watch and concurrent sessions keep their visible day portions and lanes", () => {
  const events:CalendarEvent[]=[{id:"night",title:"Watch",startDate:"2026-10-17",endDate:"2026-10-18",startTime:"22:00",endTime:"06:00"},
    {id:"overlap",title:"Handover",startDate:"2026-10-18",startTime:"05:00",endTime:"07:00"}]
  events.forEach(validateCalendarEvent)
  const first=calendarTimedLayout(events,"2026-10-17");assert.equal(first[0].start,1320);assert.equal(first[0].end,1440)
  const second=calendarTimedLayout(events,"2026-10-18");assert.equal(second[0].start,0);assert.equal(second[0].end,360)
  assert.equal(second[0].lanes,2);assert.notEqual(second[0].lane,second[1].lane)
  const clipped=calendarTimedLayout(events,"2026-10-18",6,18);assert.equal(clipped.length,1);assert.equal(clipped[0].event.id,"overlap")
  const midnight:CalendarEvent={id:"midnight",title:"Watch ends",startDate:"2026-10-17",endDate:"2026-10-18",startTime:"22:00",endTime:"00:00"}
  assert.equal(eventsOnDate([midnight],"2026-10-18").length,0)
  assert.equal(eventsOnDate([{...midnight,allDay:true}],"2026-10-18").length,1)
})
test("date picker trigger uses the calendar zone instead of shifting a date across midnight", () => {
  const markup = renderToStaticMarkup(createElement(DatePicker, {label:"Certification date", value:new TZDate(2026,9,12,"Pacific/Fiji"), calendarProps:{timeZone:"Pacific/Fiji"}, onValueChange:()=>{}}))
  assert.match(markup,/12 Oct 2026/)
  assert.match(markup,/<bdi>12 Oct 2026<\/bdi>/)
  assert.doesNotMatch(markup,/11 Oct 2026/)
})

test("invalid event duration is rejected instead of silently wrapping overnight", () => {
  assert.throws(()=>validateCalendarEvent({id:"invalid",title:"Session",startDate:"2026-10-12",startTime:"11:00",endTime:"08:30"}),RangeError)
  assert.throws(()=>validateCalendarEvent({id:"invalid",title:"Session",startDate:"2026-10-12",startTime:"25:00",endTime:"26:00"}),RangeError)
})
