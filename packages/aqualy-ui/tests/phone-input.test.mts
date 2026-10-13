import test from "node:test"
import assert from "node:assert/strict"

import { normalizePhoneInput } from "@aqualy/ui/components/phone-input"

test("fails closed for a national number without explicit country context", () => {
  const result = normalizePhoneInput(null, "0400 123 456")

  assert.equal(result.e164, null)
  assert.equal(result.isValid, false)
})

test("canonicalizes a national number only after explicit AU selection", () => {
  const result = normalizePhoneInput("AU", "0400 123 456")

  assert.equal(result.e164, "+61400123456")
  assert.equal(result.isValid, true)
})

test("resolves an international number without preselected country", () => {
  const result = normalizePhoneInput(null, "+61400123456")

  assert.equal(result.e164, "+61400123456")
  assert.equal(result.isValid, true)
  assert.equal(result.country, "AU")
})

test("normalizes Australian national input to E.164", () => {
  assert.deepEqual(normalizePhoneInput("AU", "0400 123 456"), {
    country: "AU",
    input: "0400 123 456",
    e164: "+61400123456",
    isValid: true,
  })
})
test("normalizes formatted equivalents to the same E.164 value", () => {
  const national = normalizePhoneInput("AU", "0400 123 456")
  const international = normalizePhoneInput("AU", "+61 (400) 123-456")

  assert.equal(national.e164, international.e164)
  assert.equal(international.e164, "+61400123456")
})

test("keeps an E.164 input stable", () => {
  assert.equal(normalizePhoneInput("AU", "+61400123456").e164, "+61400123456")
})

test("normalizes valid United States and United Kingdom national inputs", () => {
  assert.equal(normalizePhoneInput("US", "415 555 2671").e164, "+14155552671")
  assert.equal(normalizePhoneInput("GB", "020 7946 0018").e164, "+442079460018")
})

test("rejects invalid phone input without an E.164 value", () => {
  const result = normalizePhoneInput("AU", "not a phone")

  assert.equal(result.isValid, false)
  assert.equal(result.e164, null)
})
