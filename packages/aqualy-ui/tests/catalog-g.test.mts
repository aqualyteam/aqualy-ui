import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { paginationItems, parsePageJump, Pagination } from '../dist/components/pagination.js'
import { capacitySummary, Progress } from '../dist/components/progress.js'
import { NumberInput } from '../dist/components/number-input.js'
import { RadioGroupField, RadioGroupOption } from '../dist/components/radio-group.js'

test('pagination bounds and collapsed windows remain valid at both ends',()=>{
 assert.deepEqual(paginationItems(1,0),[])
 assert.deepEqual(paginationItems(1,3),[1,2,3])
 assert.deepEqual(paginationItems(1,40),[1,2,3,4,'ellipsis-end',40])
 assert.deepEqual(paginationItems(20,40),[1,'ellipsis-start',19,20,21,'ellipsis-end',40])
 assert.deepEqual(paginationItems(40,40),[1,'ellipsis-start',37,38,39,40])
 assert.throws(()=>paginationItems(0,5),RangeError)
 assert.throws(()=>paginationItems(6,5),RangeError)
})
test('page jumps accept only whole in-range pages and reject coercion',()=>{
 for(const input of ['','0','-1','1.5','1e2',' 2','Infinity','NaN','99999999999999999'])assert.equal(parsePageJump(input,40),null)
 assert.equal(parsePageJump('20',40),20)
 assert.equal(parsePageJump('41',40),null)
})
test('pending and provisional places do not satisfy the configured confirmed minimum',()=>{
 const seats=[{id:'1',label:'Jamie',state:'confirmed' as const},{id:'2',label:'Sam',state:'pending' as const},{id:'3',label:'Riley',state:'provisional' as const}]
 assert.deepEqual(capacitySummary(seats,8,3),{confirmed:1,pending:1,provisional:1,available:5,minimumMet:false})
 assert.equal(capacitySummary([...seats,{id:'4',label:'Elena',state:'confirmed'},{id:'5',label:'Noah',state:'confirmed'}],8,3).minimumMet,true)
 assert.throws(()=>capacitySummary(seats,2,1),RangeError)
 assert.throws(()=>capacitySummary([...seats,seats[0]],8,3),/unique/)
 assert.throws(()=>capacitySummary(seats,8,9),RangeError)
})
test('unknown progress does not announce an invented percentage; zero remains data',()=>{
 const unknown=renderToStaticMarkup(createElement(Progress,{label:'Manifest',value:null}))
 assert.doesNotMatch(unknown,/>0 \/ 100|>0%/)
 const zero=renderToStaticMarkup(createElement(Progress,{label:'Responses',value:0,max:24}))
 assert.match(zero,/0 \/ 24/)
 const half=renderToStaticMarkup(createElement(Progress,{label:"Responses",value:12,max:24}))
 assert.match(half,/aria-valuetext="50% \(12 \/ 24\)"/)
 assert.throws(()=>renderToStaticMarkup(createElement(Progress,{label:'Invalid',value:25,max:24})),RangeError)
})
test('number field submits a raw quantity even when the visible value is formatted',()=>{
 const html=renderToStaticMarkup(createElement(NumberInput,{label:'Amount',name:'amount',defaultValue:1234.5,locale:'en-AU',format:{style:'currency',currency:'AUD'}}))
 assert.match(html,/name="amount"/)
 assert.match(html,/value="1234.5"/)
 assert.match(html,/Decrease value/)
 const empty=renderToStaticMarkup(createElement(Pagination,{label:'Empty',page:1,pageCount:0,onPageChange:()=>{}}))
 assert.doesNotMatch(empty,/aria-current="page"/)
})
test('radio groups preserve name, required and stable choice values',()=>{
 const html=renderToStaticMarkup(createElement(RadioGroupField,{label:'Format',name:'format',defaultValue:'shore',required:true},createElement(RadioGroupOption,{value:'shore',label:'Shore',description:'Meet at the jetty'}),createElement(RadioGroupOption,{value:'boat',label:'Boat'})))
 assert.match(html,/name="format"/)
 assert.match(html,/value="shore"/)
 assert.match(html,/required/)
 assert.match(html,/aria-describedby=/)
})
