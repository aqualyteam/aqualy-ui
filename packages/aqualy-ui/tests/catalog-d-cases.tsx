import assert from "node:assert/strict"
import test from "node:test"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { AqualyUIScope } from "../dist/components/aqualy-ui-scope.js"
import { DescriptionList, DescriptionListItem, DescriptionListTerm, DescriptionListDetail, DescriptionListValue, DescriptionListDescription } from "../dist/components/description-list.js"
import { DialogSteps } from "../dist/components/dialog.js"
import { EmptyState } from "../dist/components/empty.js"
import { Button } from "../dist/components/button.js"

const render=(node:React.ReactNode)=>renderToStaticMarkup(node)
test("DescriptionList preserves native definition semantics and safely renders composed values",()=>{
 const html=render(<DescriptionList layout="grid" columns={3} surface="bordered"><DescriptionListItem><DescriptionListTerm>Reference</DescriptionListTerm><DescriptionListDetail><DescriptionListValue actions={<Button size="xs">Copy reference</Button>}><bdi>{'<script>unsafe</script>'}</bdi></DescriptionListValue><DescriptionListDescription>Customer-supplied credential.</DescriptionListDescription></DescriptionListDetail></DescriptionListItem></DescriptionList>)
 assert.match(html,/<dl[^>]*data-layout="grid"/);assert.match(html,/<dt/);assert.match(html,/<dd/);assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>/);assert.match(html,/Copy reference/);assert.match(html,/data-columns="3"/)
})
test("DialogSteps identifies the current step and only offers completed steps for return",()=>{
 const steps=[{id:"details",label:"Details"},{id:"review",label:"Review"},{id:"finish",label:"Finish"}]
 const html=render(<DialogSteps steps={steps} currentStep="review" onStepChange={()=>{}}/>)
 assert.equal((html.match(/<button/g)||[]).length,1);assert.equal((html.match(/aria-current="step"/g)||[]).length,1);assert.match(html,/Completed/);assert.match(html,/Current step/);assert.match(html,/Next step/)
 assert.throws(()=>render(<DialogSteps steps={steps} currentStep="missing"/>),/valid currentStep/)
 assert.throws(()=>render(<DialogSteps steps={[steps[0],steps[0]]} currentStep="details"/>),/unique step ids/)
})
test("EmptyState requires explicit wording, respects heading hierarchy and optional composition",()=>{
 const html=render(<AqualyUIScope product="diver" theme="dark" dir="rtl"><EmptyState headingLevel="h4" title="No certifications recorded" description="Credentials added by the diver will appear here." size="sm" align="start"/></AqualyUIScope>)
 assert.match(html,/<h4/);assert.match(html,/No certifications recorded/);assert.match(html,/data-align="start"/);assert.doesNotMatch(html,/empty-media|empty-content|<button/);assert.doesNotMatch(html,/role="alert"/)
})
test("EmptyState keeps caller actions and accessible names intact",()=>{
 const html=render(<EmptyState title="No matching sessions" description="Reset the date filter." media={<svg/>} actions={<Button variant="outline" size="sm">Reset dates</Button>}/>)
 assert.match(html,/aria-hidden="true"/);assert.match(html,/Reset dates/);assert.match(html,/data-variant="outline"/)
})
