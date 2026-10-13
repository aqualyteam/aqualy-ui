import test from "node:test"
import assert from "node:assert/strict"

test("canonical package exports resolve without exposing source paths", async () => {
  const modules = await Promise.all([
    import("@aqualy/ui/components/button"),
    import("@aqualy/ui/components/input"),
    import("@aqualy/ui/components/field"),
    import("@aqualy/ui/components/select"),
    import("@aqualy/ui/components/phone-input"),
    import("@aqualy/ui/components/aqualy-ui-portal"),
    import("@aqualy/ui/lib/utils"),
  ])

  assert.equal(typeof modules[0].Button, "function")
  assert.equal(typeof modules[1].Input, "function")
  assert.equal(typeof modules[2].Field, "function")
  assert.equal(typeof modules[3].Select, "function")
  assert.equal(typeof modules[4].PhoneInput, "object")
  assert.equal(typeof modules[5].AqualyUIPortalScope, "function")
  assert.equal(typeof modules[6].cn, "function")
})
