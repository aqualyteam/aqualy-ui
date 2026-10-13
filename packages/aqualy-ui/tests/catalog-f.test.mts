import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { renderToStaticMarkup } from "react-dom/server"
import { createElement } from "react"
import { MetricCard, compareMetric } from "../dist/components/metric-card.js"
import { normalizeSelections } from "../dist/components/multi-select.js"
import { Loading } from "../dist/components/loading.js"

test("metric comparisons use business meaning; points and zero/missing baselines are distinct", () => {
  assert.equal(compareMetric(4, { previous: 7, label: "yesterday", favorable: "decrease" }).tone, "positive")
  assert.equal(compareMetric(23, { previous: 20, label: "last week" }).tone, "neutral")
  assert.equal(compareMetric(85, { previous: 75, label: "last week", mode: "points" }).percent, null)
  assert.equal(compareMetric(3, { previous: 0, label: "last week" }).percent, null)
  assert.equal(compareMetric(3, { previous: null, label: "last week" }).delta, null)
  assert.equal(compareMetric(12, { previous: 12, label: "yesterday", favorable: "increase" }).tone, "neutral")
  assert.equal(compareMetric(-8, { previous: -10, label: "last week" }).percent, 20)
  assert.throws(() => compareMetric(Infinity, { previous: 1, label: "previous" }), RangeError)
})
test("multi-select values preserve ordering, deduplicate and exclude unavailable/unknown IDs", () => {
  const options = [{ value: "reef", label: "Reef" }, { value: "pool", label: "Pool" }, { value: "closed", label: "Closed", disabled: true }]
  assert.deepEqual(normalizeSelections(["pool", "reef", "pool", "closed", "unknown"], options), ["pool", "reef"])
  assert.deepEqual(normalizeSelections(["pool", "reef"], options, 1), ["pool"])
  assert.throws(() => normalizeSelections([], options, 0), RangeError)
})
test("metric zero is real data; missing values render empty without an invented value", () => {
  const zero = renderToStaticMarkup(createElement(MetricCard, { label: "Records", value: 0, period: "Today" }))
  const empty = renderToStaticMarkup(createElement(MetricCard, { label: "Records", value: null, period: "Today" }))
  assert.match(zero, /data-state="ready"/)
  assert.match(zero, /<bdi>0<\/bdi>/)
  assert.match(empty, /data-state="empty"/)
  assert.doesNotMatch(empty, /aq-metric-value/)
  const pending = renderToStaticMarkup(createElement(MetricCard, { label: "Records", value: null, period: "Today", status: "loading" }))
  assert.equal([...pending.matchAll(/role="status"/g)].length, 1, "Decorative spinner must not duplicate its loading announcement")
})
test("neutral loading preserves status and motion while accepting consumer identity", () => {
 const html=renderToStaticMarkup(createElement(Loading,{label:"Preparing workspace"}))
 assert.match(html,/role="status"/);assert.match(html,/aq-loading-neutral/);assert.doesNotMatch(html,/animateMotion|aq-logo-orbit/)
 const custom=renderToStaticMarkup(createElement(Loading,{label:"Preparing",identity:state=>createElement("span",{"data-identity":state.appearance},"Consumer identity")}))
 assert.match(custom,/Consumer identity/);assert.doesNotMatch(custom,/aq-loading-neutral/)
})

test("menu families reuse the existing primitives and own no app context or request shortcuts", () => {
  const menu = readFileSync(new URL("../src/components/menubar.tsx", import.meta.url), "utf8")
  const navigation = readFileSync(new URL("../src/components/navigation-menu.tsx", import.meta.url), "utf8")
  assert.match(menu, /#lib\/action-menu/)
  assert.match(menu, /#components\/dropdown-menu/)
  assert.match(navigation, /@base-ui\/react\/navigation-menu/)
  assert.match(navigation, /AqualyUIPortalScope/)
  assert.doesNotMatch(menu + navigation, /next\/|fetch\(|document\.addEventListener/)
})
