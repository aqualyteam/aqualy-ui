import assert from "node:assert/strict"
import test from "node:test"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { validateUploadFiles, formatFileSize } from "../dist/components/file-upload.js"
import { normalizeOTP, InputOTP } from "../dist/components/input-otp.js"
import { InputField } from "../dist/components/input-group.js"
import { ErrorState } from "../dist/components/error-state.js"
import { AddressInput } from "../dist/components/address-input.js"

const file = (name: string, content = "sample", type = "application/pdf", lastModified = 1) => new File([content], name, { type, lastModified })
test("upload selection and drop share per-file policy with deterministic partial acceptance", () => {
 const entries = [file("waiver.pdf"), file("photo.PNG", "image", "image/png"), file("note.txt", "text", "text/plain"), file("empty.pdf", ""), file("large.pdf", "1234567890")]
 const result = validateUploadFiles(entries, [], { accept: ".pdf,image/*", multiple: true, maxFiles: 3, maxSize: 8 })
 assert.deepEqual(result.accepted.map(entry => entry.name), ["waiver.pdf", "photo.PNG"])
 assert.deepEqual(result.rejected.map(entry => entry.code), ["type", "empty", "size"])
})
test("upload detects duplicates in the existing queue and same selection; modified files are independent", () => {
 const existing = file("waiver.pdf")
 const result = validateUploadFiles([file("waiver.pdf"), file("waiver.pdf", "sample", "application/pdf", 2), file("other.pdf"), file("other.pdf")], [existing], { multiple:true, maxFiles:4 })
 assert.deepEqual(result.accepted.map(entry => entry.lastModified), [2,1])
 assert.deepEqual(result.rejected.map(entry => entry.code), ["duplicate","duplicate"])
})
test("single selection never exceeds one; multi queue count includes existing entries", () => {
 assert.equal(validateUploadFiles([file("a.pdf"),file("b.pdf")],[],{maxFiles:20}).rejected[0]?.code,"count")
 assert.equal(validateUploadFiles([file("new.pdf")],[file("a.pdf"),file("b.pdf")],{multiple:true,maxFiles:2}).rejected[0]?.code,"count")
 for(const policy of [{multiple:true,maxFiles:0},{multiple:true,maxFiles:1.5},{maxSize:NaN},{maxSize:-1}])assert.throws(()=>validateUploadFiles([],[],policy),RangeError)
})
test("byte display and exact limit boundary do not lose validation precision", () => {
 assert.deepEqual([0,1023,1024,1048576].map(formatFileSize),["0 B","1023 B","1 KB","1 MB"])
 assert.equal(validateUploadFiles([file("boundary.pdf","12345678")],[],{maxSize:8}).accepted.length,1)
})
test("OTP normalizes numeric paste and regional digits without retaining alphabetic content", () => {
 assert.equal(normalizeOTP("408 216",6),"408216")
 assert.equal(normalizeOTP("４０８٢١۶",6),"408216")
 assert.equal(normalizeOTP("A-12345678",4),"1234")
 for(const length of [0,13,1.5,NaN])assert.throws(()=>normalizeOTP("123",length),RangeError)
})
test("OTP renders one native form control; slots are supplementary and error is associated above it", () => {
 const html=renderToStaticMarkup(<InputOTP id="test-code" label="Verification code" name="code" length={8} value="1234" required error="Code expired" description="Check your latest email."/>)
 assert.equal((html.match(/<input /g)??[]).length,1)
 assert.equal((html.match(/class="aq-otp-slot"/g)??[]).length,8)
 assert.match(html,/name="code"/);assert.match(html,/autoComplete="one-time-code"/);assert.match(html,/pattern="\[0-9\]\{8\}"/)
 assert.match(html,/aria-invalid="true"/);assert.match(html,/aria-describedby="test-code-help test-code-error test-code-instruction"/)
 assert.ok(html.indexOf('id="test-code-error"')<html.indexOf('id="test-code"'))
})
test("InputField emits safe text and associates required/error/help while keeping input-size attribute", () => {
 const html=renderToStaticMarkup(<InputField id="email" label="Email" type="email" required description="Contact address" error={'<script>invalid</script>'} prefix="AQ-" suffix="/ 2026" defaultValue="jamie@" size={24} controlSize="lg" />)
 assert.match(html,/<bdi>AQ-<\/bdi>/);assert.match(html,/<bdi>\/ 2026<\/bdi>/);
 assert.match(html,/aria-describedby="email-help email-error"/);assert.match(html,/size="24"/);assert.match(html,/&lt;script&gt;invalid&lt;\/script&gt;/)
 assert.ok(html.indexOf('id="email-error"')<html.indexOf('id="email"'))
})
test("ErrorState reuses Empty semantics and does not claim an empty result or start retries on render", () => {
 let calls=0
 const html=renderToStaticMarkup(<ErrorState title="Documents unavailable" description="Try loading this region again." media={false} retry={{label:"Retry documents",pending:true,onRetry:()=>{calls++}}}/>)
 assert.equal(calls,0);assert.match(html,/aria-busy="true"/);assert.match(html,/disabled=""/);assert.match(html,/Retrying…/)
 assert.doesNotMatch(html,/data-slot="empty-media"|role="alert"/)
})
test("read-only addresses retain country in form data without exposing an editable selector", () => {
 const html=renderToStaticMarkup(<AddressInput readOnly value={{line1:"18 Ocean Road",line2:"",locality:"Adelaide",region:"SA",postalCode:"5000",country:"AU"}} countryOptions={[{value:"AU",label:"Australia"}]} onValueChange={()=>{}}/>)
 assert.match(html,/type="hidden" name="address.country" value="AU"/);assert.match(html,/autoComplete="postal-code"/)
})
