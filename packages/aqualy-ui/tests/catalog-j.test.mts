import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup as render } from 'react-dom/server'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../dist/components/tabs.js'
import { TextareaField } from '../dist/components/textarea.js'
import { Timeline, TimelineItem, TimelineIndicator, TimelineTitle, TimelineTime } from '../dist/components/timeline.js'
import { ToastProvider, ToastPreview } from '../dist/components/toast.js'
import { Toggle } from '../dist/components/toggle.js'
import { ToggleGroup, ToggleGroupItem, SegmentedControl, SegmentedControlItem } from '../dist/components/toggle-group.js'
test('Tabs SSR selects the initial view, keeps hidden panels inert and disables unavailable tabs',()=>{
 const html=render(createElement(Tabs,{defaultValue:'overview'},createElement(TabsList,{'aria-label':'Views'},createElement(TabsTrigger,{value:'overview'},'Overview'),createElement(TabsTrigger,{value:'billing',disabled:true},'Billing')),createElement(TabsContent,{value:'overview'},'Session AQ-104'),createElement(TabsContent,{value:'billing',keepMounted:true},'Unavailable')))
 assert.match(html,/role="tablist"/);assert.match(html,/aria-selected="true"/);assert.match(html,/role="tabpanel"/);assert.match(html,/disabled=""/);assert.match(html,/hidden=""/)
})
test('Textarea Field uses a single existing InputGroup border and errors follow help',()=>{
 const html=render(createElement(TextareaField,{label:'Briefing',description:'Meeting point',error:'Required',name:'briefing',required:true,maxLength:240,defaultValue:'Meet at the jetty.'}))
 assert.equal((html.match(/data-slot="input-group"/g)??[]).length,1);assert.match(html,/class="aq-group-control aq-group-textarea aq-textarea"/);assert.match(html,/aria-invalid="true"/);assert.match(html,/maxLength="240"/);assert.ok(html.indexOf('Required')>html.indexOf('Meeting point'));assert.ok(html.indexOf('Required')<html.indexOf('<textarea'))
 assert.match(html,/<bdi dir="ltr">18 \/ 240 characters<\/bdi>/)
})
test('Textarea defaults, native readonly/disabled and plain-text escaping are preserved',()=>{
 const html=render(createElement(TextareaField,{label:'Notes',controlSize:'lg',defaultValue:'<script>alert(1)</script>',readOnly:true,name:'notes'}))
 assert.match(html,/rows="6"/);assert.match(html,/readOnly=""/);assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>/)
})
test('Timeline is an ordered list with machine-readable timestamps and decorative indicators',()=>{
 const html=render(createElement(Timeline,{compact:true,'aria-label':'Activities'},createElement(TimelineItem,null,createElement(TimelineIndicator,null,'icon'),createElement(TimelineTitle,null,'Waiver received'),createElement(TimelineTime,{dateTime:'2026-10-09T09:12:00+10:30'},'09 Oct · 09:12'))))
 assert.match(html,/<ol/);assert.match(html,/<li/);assert.match(html,/aria-hidden="true"/);assert.match(html,/dateTime="2026-10-09/);assert.match(html,/dir="ltr"/)
})
test('Toggle reuses Button sizes with pressed/disabled/busy semantics',()=>{
 const html=render(createElement(Toggle,{size:'sm',variant:'marine',defaultPressed:true,busy:true,'aria-label':'Reminders'},'Reminders'))
 assert.match(html,/aria-pressed="true"/);assert.match(html,/aria-busy="true"/);assert.match(html,/disabled=""/);assert.match(html,/aq-control--sm/)
})
test('optional multiple ToggleGroup and required SegmentedControl expose different semantics',()=>{
 const multi=render(createElement(ToggleGroup,{multiple:true,defaultValue:['shore'],'aria-label':'Formats'},createElement(ToggleGroupItem,{value:'shore'},'Shore'),createElement(ToggleGroupItem,{value:'boat'},'Boat')))
 assert.match(multi,/aria-pressed="true"/);assert.doesNotMatch(multi,/role="radio"/)
 const single=render(createElement(SegmentedControl,{defaultValue:'week',name:'mode','aria-label':'Mode'},createElement(SegmentedControlItem,{value:'day'},'Day'),createElement(SegmentedControlItem,{value:'week'},'Week')))
 assert.match(single,/role="radiogroup"/);assert.match(single,/role="radio"/);assert.match(single,/aria-checked="true"/);assert.match(single,/name="mode"/)
})
test('Toast static previews share variants without misleading live regions or close buttons',()=>{
 const html=render(createElement(ToastPreview,{variant:'error',title:'Could not load preview',description:'Retry the document.'}))
 assert.match(html,/data-variant="error"/);assert.doesNotMatch(html,/role="alert"|<button/)
})
test('Toast provider renders consumer content during SSR without global mutation',()=>{
 const html=render(createElement(ToastProvider,{limit:3},createElement('p',null,'Session AQ-104')))
 assert.match(html,/Session AQ-104/);assert.doesNotMatch(html,/data-slot="toast"/)
})
