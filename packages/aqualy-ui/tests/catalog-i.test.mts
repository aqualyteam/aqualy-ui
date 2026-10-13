import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarMenuButton, SidebarDisclosure } from '../dist/components/sidebar.js'
import { Skeleton, SkeletonRegion } from '../dist/components/skeleton.js'
import { SliderField } from '../dist/components/slider.js'
import { SwitchField } from '../dist/components/switch.js'
import { Spinner } from '../dist/components/spinner.js'
const render=renderToStaticMarkup

test('Sidebar SSR has stable controlled collapse semantics and hidden panel is inert',()=>{
 const html=render(createElement(SidebarProvider,{open:false,collapsible:'offcanvas'},createElement(Sidebar,{label:'Workspace'},createElement(SidebarTrigger))))
 assert.match(html,/data-state="collapsed"/);assert.match(html,/inert=""/);assert.match(html,/aria-hidden="true"/);assert.match(html,/aria-label="Expand navigation"/)
 assert.match(html,/aria-expanded="false"/);assert.match(html,/aria-controls=/)
 const fixed=render(createElement(SidebarProvider,{collapsible:'none'},createElement(SidebarTrigger)))
 assert.match(fixed,/disabled=""/)
})
test('rail items retain names, current-page state and square shared button size',()=>{
 const html=render(createElement(SidebarProvider,{defaultOpen:false},createElement(Sidebar,{label:'Navigation'},createElement(SidebarMenuButton,{label:'Documents',active:true,badge:'3'}))))
 assert.match(html,/aria-label="Documents"/);assert.match(html,/aria-current="page"/);assert.match(html,/data-size="icon"/)
 const collapsed=render(createElement(SidebarProvider,{defaultOpen:false},createElement(SidebarDisclosure,{label:'Settings',children:'Profile'})))
 assert.match(collapsed,/inert=""/);assert.match(collapsed,/aria-expanded="false"/)
})
test('skeleton blocks are decorative and one region names the loading content',()=>{
 const html=render(createElement(SkeletonRegion,{label:'Loading customer rows'},createElement(Skeleton,{variant:'avatar'})))
 assert.match(html,/aria-busy="true"/);assert.match(html,/aria-label="Loading customer rows"/);assert.match(html,/role="status"/)
 assert.match(html,/data-slot="skeleton" data-variant="avatar" data-animated="true" aria-hidden="true"/)
})
test('range Slider SSR exposes both named values and native range inputs',()=>{
 const html=render(createElement(SliderField<number[]>,{label:'Duration',name:'duration',defaultValue:[30,75],thumbLabels:['Minimum duration','Maximum duration'],min:10,max:120,step:5,error:'Review range'}))
 assert.equal((html.match(/<input[^>]*type="range"/g)??[]).length,2);assert.match(html,/aria-label="Minimum duration"/);assert.match(html,/aria-label="Maximum duration"/)
 assert.match(html,/value="30"/);assert.match(html,/value="75"/);assert.match(html,/aria-invalid="true"/);assert.ok(html.indexOf('Review range')<html.indexOf('type="range"'))
})
test('switch saving preserves state, prevents repeats and puts error before control',()=>{
 const html=render(createElement(SwitchField,{label:'Updates',name:'updates',checked:true,status:'saving',statusText:'Saving preference',error:'Retry saving'}))
 assert.match(html,/aria-busy="true"/);assert.match(html,/aria-checked="true"/);assert.match(html,/disabled=""/);assert.match(html,/name="updates"/)
 assert.ok(html.indexOf('Retry saving')<html.indexOf('role="switch"'))
})
test('Spinner retains SVG passthrough, optional size and decorative silence',()=>{
 const named=render(createElement(Spinner,{size:'xl','aria-label':'Preparing preview'}))
 assert.match(named,/data-size="xl"/);assert.match(named,/role="status"/);assert.match(named,/aria-label="Preparing preview"/)
 const decorative=render(createElement(Spinner,{'aria-hidden':true}));assert.match(decorative,/aria-hidden="true"/);assert.doesNotMatch(decorative,/role="status"|aria-label=/)
 const original=render(createElement(Spinner));assert.doesNotMatch(original,/data-size=/);assert.match(original,/aria-label="Loading"/)
})
