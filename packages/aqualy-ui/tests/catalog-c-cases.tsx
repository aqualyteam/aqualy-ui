import assert from "node:assert/strict"
import test from "node:test"
import React from "react"
import {renderToStaticMarkup} from "react-dom/server"
import {Checkbox,CheckboxField} from "../dist/components/checkbox.js"
import {Combobox} from "../dist/components/combobox.js"
import {ChartData,DataChart} from "../dist/components/chart.js"
import {Command} from "../dist/components/command.js"
import {readTableUrl,writeTableUrl,validCalendarDate} from "../dist/lib/data-table-url.js"
import {facetFilter,numericRangeFilter,dateRangeFilter,booleanFilter,type DataTableState,type FilterSpec} from "../dist/lib/data-table-model.js"
import type {Row} from "@tanstack/react-table"
const defaults:DataTableState={globalFilter:"",columnFilters:[],sorting:[],pagination:{pageIndex:0,pageSize:10},columnVisibility:{},rowSelection:{}}
const filters:FilterSpec[]=[{kind:"facet",columnId:"agency",label:"Agency",options:[{value:"PADI",label:"PADI"},{value:"SSI",label:"SSI"}]},{kind:"date",columnId:"visit",label:"Visit"},{kind:"number",columnId:"dives",label:"Dives",min:0,max:1000},{kind:"boolean",columnId:"followUp",label:"Follow-up"},{kind:"text",columnId:"name",label:"Name"}]
const config={namespace:"customers",filters,defaults,sortableColumns:["name","visit"],pageSizes:[5,10,20]}

test("Checkbox native submission, mixed semantics and required error description",()=>{
 const markup=renderToStaticMarkup(<CheckboxField id="waiver" label="Participation waiver" name="document" value="waiver" required error="Confirm consent" description="Participation terms" defaultChecked/>)
 assert.match(markup,/name="document"/);assert.match(markup,/value="waiver"/);assert.match(markup,/aria-describedby="waiver-description waiver-error"/)
 assert.ok(markup.indexOf("Participation terms")<markup.indexOf("Confirm consent"))
 const mixed=renderToStaticMarkup(<Checkbox aria-label="Select documents" indeterminate/>);assert.match(mixed,/aria-checked="mixed"/)
})
test("Combobox submits identifiers and exposes required/disabled field semantics",()=>{
 const markup=renderToStaticMarkup(<Combobox options={[{value:"padi",label:"PADI"}]} name="agency" label="Agency" value="padi" onValueChange={()=>{}} required/>);
 assert.match(markup,/value="padi"/);assert.match(markup,/aria-required="true"/);assert.match(markup,/role="combobox"/)
 const disabled=renderToStaticMarkup(<Combobox options={[]} label="Sites" multiple value={[]} onValueChange={()=>{}} disabled/>);assert.match(disabled,/disabled/)
})
test("Chart data provides a caption and associated animated accordion",()=>{
 const markup=renderToStaticMarkup(<ChartData data={[{day:"Monday",sessions:3}]} columns={[{key:"day",label:"Day"},{key:"sessions",label:"Sessions"}]} caption="Scheduled sessions"/>);
 assert.match(markup,/View data/);assert.match(markup,/aria-expanded="false"/)
})
test("Chart empty and error states keep human-readable context",()=>{
 assert.match(renderToStaticMarkup(<DataChart type="area" data={[]} categoryKey="day" config={{}} label="Sessions"/>),/No data for this period/)
 assert.match(renderToStaticMarkup(<DataChart type="bar" status="error" data={[]} categoryKey="day" config={{}} label="Sessions" onRetry={()=>{}}/>),/Chart unavailable/)
})
test("Command entries are grouped and disabled callbacks are not invoked by render",()=>{
 let calls=0;const markup=renderToStaticMarkup(<Command items={[{id:"course",label:"Publish course",group:"Actions",disabled:true,onSelect:()=>calls++}]}/>);
 assert.match(markup,/data-disabled/);assert.match(markup,/Actions/);assert.equal(calls,0)
})
test("URL round trip retains unrelated parameters and serializes all supported filters",()=>{
 const state={...defaults,globalFilter:"Leila",columnFilters:[{id:"agency",value:["PADI","SSI"]},{id:"visit",value:{from:"2026-10-01",to:"2026-10-09"}},{id:"dives",value:{min:2,max:80}},{id:"followUp",value:false},{id:"name",value:"Hassan"}],sorting:[{id:"name",desc:true}],pagination:{pageIndex:2,pageSize:5}};
 const params=writeTableUrl(new URLSearchParams("product=diver&campaign=reef"),state,config)
 assert.equal(params.get("product"),"diver");assert.equal(params.get("campaign"),"reef");assert.deepEqual(readTableUrl(params,config),state)
})
test("URL malformed values are ignored without admitting unknown fields",()=>{
 const state=readTableUrl(new URLSearchParams("customers.filter.agency=unknown&customers.filter.visit.from=2026-02-30&customers.filter.dives.min=NaN&customers.filter.followUp=yes&customers.sort=unknown:asc,name:desc,name:asc&customers.page=-1&customers.size=999"),config)
 assert.deepEqual(state.columnFilters,[]);assert.deepEqual(state.sorting,[{id:"name",desc:true}]);assert.deepEqual(state.pagination,defaults.pagination)
 assert.equal(validCalendarDate("2024-02-29"),true);assert.equal(validCalendarDate("2025-02-29"),false)
})
test("Inclusive range and facet predicates keep false boolean filters active",()=>{
 const row={getValue:(key:string)=>({agency:"PADI",dives:8,visit:"2026-10-09",followUp:false}[key])} as unknown as Row<unknown>
 assert.equal(facetFilter(row,"agency",["PADI"]),true);assert.equal(facetFilter(row,"agency",["SSI"]),false)
 assert.equal(numericRangeFilter(row,"dives",{min:2,max:8}),true);assert.equal(numericRangeFilter(row,"dives",{min:9}),false)
 assert.equal(dateRangeFilter(row,"visit",{from:"2026-10-01",to:"2026-10-09"}),true);assert.equal(booleanFilter(row,"followUp",false),true)
})
