import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { clampSplit, splitFromPointer, splitFromKey, ResizablePanels } from '../dist/components/resizable.js'
import { ScrollArea } from '../dist/components/scroll-area.js'
import { SearchField } from '../dist/components/search.js'
import { SelectField } from '../dist/components/select.js'
import { Separator, LabeledSeparator } from '../dist/components/separator.js'

test('two-panel split validates bounds and never collapses a panel by accident',()=>{
 assert.equal(clampSplit(5),25);assert.equal(clampSplit(95),75);assert.equal(clampSplit(45.27),45.3)
 assert.equal(clampSplit(0,25.04,75.06),25.04);assert.equal(clampSplit(100,25.04,75.06),75.06)
 const invalid:[number,number,number][]=[[NaN,25,75],[45,0,75],[45,25,100],[45,75,25]]
 for(const [value,min,max] of invalid)assert.throws(()=>clampSplit(value,min,max),RangeError)
})
test('pointer split accounts for the handle and mirrors logical horizontal coordinates',()=>{
 assert.equal(splitFromPointer(300,600),50);assert.equal(splitFromPointer(300,600,true),50)
 assert.ok(Math.abs(splitFromPointer(200,600)!+splitFromPointer(200,600,true)!-100)<1e-10)
 assert.equal(splitFromPointer(1,7),null);assert.equal(splitFromPointer(20,100,false,NaN),null);assert.equal(splitFromPointer(20,100,false,-1),null)
})
test('keyboard splits use orientation, RTL, bounds and larger Shift increments',()=>{
 assert.equal(splitFromKey('ArrowRight',45,'horizontal',false),47)
 assert.equal(splitFromKey('ArrowLeft',45,'horizontal',true),47)
 assert.equal(splitFromKey('ArrowDown',45,'vertical',true),47)
 assert.equal(splitFromKey('ArrowUp',26,'vertical',false),25)
 assert.equal(splitFromKey('ArrowLeft',45,'horizontal',true,25,75,true),55)
 assert.equal(splitFromKey('Home',45,'horizontal',true),25);assert.equal(splitFromKey('End',45,'vertical',false),75)
 assert.equal(splitFromKey('Enter',45,'horizontal',false),null)
})
test('SSR resizable handles expose accurate controlled values and panel relationships',()=>{
 const html=renderToStaticMarkup(createElement(ResizablePanels,{label:'Resize documents',start:{label:'Documents',content:'List'},end:{label:'Preview',content:'Agreement'},value:60}))
 assert.match(html,/aria-valuenow="60"/);assert.match(html,/aria-controls=/);assert.match(html,/aria-orientation="vertical"/)
 const area=renderToStaticMarkup(createElement(ScrollArea,{label:'Document activity',scrollbar:'hidden'}))
 assert.match(area,/role="region"/);assert.match(area,/tabindex="0"/);assert.match(area,/data-scrollbar="hidden"/)
})
test('search has one input, native constraints and error description before its control',()=>{
 const html=renderToStaticMarkup(createElement(SearchField,{label:'Dive sites',name:'query',value:'reef',onValueChange:()=>{},mode:'submit',onSearch:()=>{},required:true,error:'Choose a search term.'}))
 assert.equal((html.match(/<input /g)??[]).length,1);assert.match(html,/type="search"/);assert.match(html,/name="query"/);assert.match(html,/aria-invalid="true"/)
 assert.ok(html.indexOf('Choose a search term.')<html.indexOf('<input '));assert.match(html,/Clear search/)
})
test('select keeps stable IDs and rejects duplicates; decorative lines have no separator role',()=>{
 const groups=[{label:'Locations',options:[{value:'pool',label:'Training pool'}]}]
 const html=renderToStaticMarkup(createElement(SelectField,{label:'Resource',name:'resource',groups,value:'pool',onValueChange:()=>{},required:true}))
 assert.match(html,/name="resource"/);assert.match(html,/value="pool"/)
 assert.throws(()=>renderToStaticMarkup(createElement(SelectField,{label:'Resource',groups:[...groups,...groups],value:null,onValueChange:()=>{}})),/unique/)
 const decorative=renderToStaticMarkup(createElement(Separator,{decorative:true}));assert.match(decorative,/role="presentation"/);assert.match(decorative,/aria-hidden="true"/)
 const labeled=renderToStaticMarkup(createElement(LabeledSeparator,{label:'Related documents',as:'h3'}));assert.match(labeled,/<h3>Related documents<\/h3>/)
})
