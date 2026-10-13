import test from "node:test"
import assert from "node:assert/strict"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { AspectRatio } from "@aqualy/ui/components/aspect-ratio"
import { Alert, AlertTitle, AlertDescription } from "@aqualy/ui/components/alert"

test("aspect ratio reserves SSR space and rejects unusable ratios", () => {
  const html = renderToStaticMarkup(createElement(AspectRatio, { ratio: 16 / 9, fit: "contain" }, createElement("img", { src: "example.svg", alt: "Briefing" })))
  assert.match(html, /aspect-ratio:1\.7777777777777777/)
  assert.match(html, /data-fit="contain"/)
  for (const ratio of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => renderToStaticMarkup(createElement(AspectRatio, { ratio })), RangeError)
  }
})

test("static alerts stay quiet while consumers can announce urgent dynamic errors", () => {
  const children = [createElement(AlertTitle, { key: "title" }, "Upload failed"), createElement(AlertDescription, { key: "description" }, "The existing certification record is unchanged.")]
  assert.match(renderToStaticMarkup(createElement(Alert, { variant: "danger" }, children)), /role="note"/)
  const dynamic = renderToStaticMarkup(createElement(Alert, { variant: "danger", role: "alert" }, children))
  assert.match(dynamic, /role="alert"/)
  assert.match(dynamic, /Upload failed/)
  assert.match(dynamic, /The existing certification record is unchanged/)
})
