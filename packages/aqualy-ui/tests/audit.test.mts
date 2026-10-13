import assert from 'node:assert/strict'
import test from 'node:test'
import {createElement as h} from 'react'
import {renderToStaticMarkup as render} from 'react-dom/server'
import {Button} from '../dist/components/button.js'
import {Select,SelectTrigger,SelectValue} from '../dist/components/select.js'
import {Tooltip,TooltipTrigger} from '../dist/components/tooltip.js'
import {NumberInput} from '../dist/components/number-input.js'
import {RadioGroupField,RadioGroupOption} from '../dist/components/radio-group.js'
import {Pagination} from '../dist/components/pagination.js'
import {AvatarGroupCount} from '../dist/components/avatar.js'
import {InputGroupButton} from '../dist/components/input-group.js'
import {Toggle} from '../dist/components/toggle.js'
import {Calendar} from '../dist/components/calendar.js'
import {useDirection} from '@base-ui/react/direction-provider'
import {AqualyUIScope} from '../dist/components/aqualy-ui-scope.js'

test('Button and Select evaluate caller state classes alongside shared classes',()=>{
 assert.match(render(h(Button,{disabled:true,className:s=>s.disabled?'caller-disabled':'caller-ready'},'Capacity')),/class="[^"]*aq-button[^"]*caller-disabled/)
 assert.match(render(h(Select,{},h(SelectTrigger,{className:s=>s.open?'caller-open':'caller-closed'},h(SelectValue,{className:()=> 'caller-value'},'Agency')))),/class="aq-select-trigger aq-control--default caller-closed"/)
 assert.match(render(h(Select,{},h(SelectTrigger,{},h(SelectValue,{className:()=> 'caller-value'},'Agency')))),/class="aq-select-value caller-value"/)
})
test('Tooltip preserves rendered and outer descriptors with a unique live tooltip ID',()=>{
 for(const custom of [h(Button,{'aria-describedby':'inner outer'}),(props:React.ComponentProps<'button'>)=>h('button',{...props,'aria-describedby':'inner outer'})]) {
  const html=render(h(Tooltip,{open:true},h(TooltipTrigger,{render:custom,'aria-describedby':'outer'},'Help')))
  const ids=html.match(/aria-describedby="([^"]+)"/)?.[1].split(' ')??[]
  assert.equal(ids.filter(id=>id==='outer').length,1);assert.ok(ids.includes('inner'));assert.equal(ids.length,3)
 }
})
test('NumberInput routes external ARIA and error guidance to its visible control',()=>{
 const html=render(h(NumberInput,{label:'Capacity',id:'capacity',defaultValue:8,description:'Minimum two',error:'Review the capacity','aria-describedby':'external','aria-invalid':true}))
 const control=html.match(/<input id="capacity"[^>]+>/)?.[0]??''
 assert.match(control,/aria-invalid="true"/);assert.match(control,/aria-describedby="external capacity-help capacity-error"/)
})
test('RadioGroupField and option preserve external descriptions and invalid state',()=>{
 const html=render(h(RadioGroupField,{label:'Session type','aria-describedby':'external','aria-invalid':true,description:'Choose a format'},h(RadioGroupOption,{value:'shore',label:'Shore',description:'Reef','aria-describedby':'external'})))
 assert.match(html,/role="radiogroup"[^>]*aria-describedby="external [^"]+-help"[^>]*aria-invalid="true"/)
 assert.match(html,/aria-describedby="external [^"]+-help"/)
})
test('Pagination honors explicit direction inside an opposite product scope',()=>{
 const html=render(h(AqualyUIScope,{dir:'ltr'},h(Pagination,{dir:'rtl',label:'Sessions',page:2,pageCount:5,onPageChange:()=>{}})))
 assert.match(html,/<nav dir="rtl"/);assert.match(html,/aria-label="Previous page of Sessions"[^>]*>[\s\S]*?lucide-chevron-right/)
})

test('Button-derived Avatar count and input actions retain state class callbacks',()=>{
 for(const Control of [AvatarGroupCount,InputGroupButton]) assert.match(render(h(Control,{className:s=>s.disabled?'caller-disabled':'caller-action'},'+3')),/class="[^"]*caller-action/)
})

test('Tooltip render-element state classes remain composed with native props',()=>{
 const html=render(h(Tooltip,{open:true},h(TooltipTrigger,{render:h(Button,{className:s=>s.disabled?'caller-disabled':'caller-help'})},'Help')))
 assert.match(html,/class="[^"]*caller-help/);assert.match(html,/class="[^"]*aq-tooltip-trigger/)
})

test('Calendar local direction reaches nested native controls without a new DOM scope',()=>{
 function Probe(){return h('span',{'data-native-direction':useDirection()},'Month')}
 const html=render(h(AqualyUIScope,{dir:'ltr'},h(Calendar,{dir:'rtl',month:new Date(2026,9,1),components:{MonthCaption:Probe}})))
 assert.match(html,/data-native-direction="rtl"/);assert.equal((html.match(/data-aqualy-ui=/g)??[]).length,1)
})

test('Tooltip leaves a rendered Toggle state callback with the Toggle owner',()=>{
 const html=render(h(Tooltip,{},h(TooltipTrigger,{render:h(Toggle,{pressed:true,className:s=>s.pressed?'caller-pressed':'caller-off'})},'Pin record')))
 assert.match(html,/class="[^"]*caller-pressed/);assert.doesNotMatch(html,/caller-off/)
})
