# @aqualy/ui

Unpublished MIT UI distribution. Tested React/React DOM19.2.1, Next16.0.10, Node24.18.0, pnpm10.24.0; ESM/declarations/precompiled scoped CSS and OFL fonts. No root barrel, consumer Tailwind or source transpilation required.

```tsx
import "@aqualy/ui/styles.css"
import { AqualyUIScope } from "@aqualy/ui/components/aqualy-ui-scope"
import { Button } from "@aqualy/ui/components/button"

<AqualyUIScope product="workspace" theme="light" dir="ltr">
  <Button variant="marine" size="sm">Prepare dive session</Button>
</AqualyUIScope>
```

Scope: workspace/professional/diver; light/dark; ltr/rtl, nested settings and native direction travel through portals. Host appearance and routing are consumer-owned. Fixed canvas #F8FAFB; white content surfaces, quiet border hierarchy, licensed Aqualy Geist/Mono families and ss02/ss04/ss06/ss08. Focus uses ring, data uses tabular figures.

Button: default/outline/secondary/ghost/destructive/link/marine; xs/sm/default/lg/xl and icon variants. Input uses controlSize to preserve native HTML size. Checkbox/Switch use onCheckedChange; value controls use onValueChange. Native ref/disabled/readOnly/required/ARIA semantics remain intact. Errors belong with the field label/description and must be associated with controls.
PhoneInput preserves {country,input,e164,isValid}; unknown national country context is not guessed. Currency/country pickers support search. FileUpload/OTP handlers, validation, records and transport are injected by the consumer. Tables, chart data, URL synchronization and Next route interception are consumer policy.

Loading: label, description, appearance(mark/wordmark), size(page/section), motion and identity. The default is a neutral three-bar page identity, separate from Spinner. A client adapter may pass identity(state) receiving appearance, motion (including reduced-motion preference) and unique clipId. Official Q/wordmark artwork is not part of this MIT package.
Static tools/buttonVariants remain server-compatible. Interaction components carry their own use-client directive; pass callbacks from client adapters, not server props. Imports/types are resolved per subpath. Official artwork is governed independently by BRAND_USAGE.md, not by an extra restriction on MIT code.

The generated `config/public-api.json` in the source distribution lists all public subpaths and exported symbols. Full declarations ship with each module. Refer to the self-contained consumer and tests for executable composition/keyboard/RTL examples. Browser/runtime support limits are recorded in SUPPORT.md.

Release status: `0.1.0-next.0` is an unpublished candidate. MIT applies to code/tokens/CSS; official Aqualy marks are excluded. Publication and product adoption require independent approval.

## Public subpaths

- @aqualy/ui/components/accordion
- @aqualy/ui/components/address-input
- @aqualy/ui/components/alert
- @aqualy/ui/components/alert-dialog
- @aqualy/ui/components/aqualy-ui-portal
- @aqualy/ui/components/aqualy-ui-scope
- @aqualy/ui/components/aspect-ratio
- @aqualy/ui/components/avatar
- @aqualy/ui/components/badge
- @aqualy/ui/components/breadcrumb
- @aqualy/ui/components/button
- @aqualy/ui/components/calendar
- @aqualy/ui/components/card
- @aqualy/ui/components/carousel
- @aqualy/ui/components/chart
- @aqualy/ui/components/checkbox
- @aqualy/ui/components/combobox
- @aqualy/ui/components/command
- @aqualy/ui/components/context-menu
- @aqualy/ui/components/currency-input
- @aqualy/ui/components/data-table
- @aqualy/ui/components/description-list
- @aqualy/ui/components/dialog
- @aqualy/ui/components/drawer
- @aqualy/ui/components/dropdown-menu
- @aqualy/ui/components/empty
- @aqualy/ui/components/error-state
- @aqualy/ui/components/field
- @aqualy/ui/components/file-upload
- @aqualy/ui/components/hover-card
- @aqualy/ui/components/input
- @aqualy/ui/components/input-group
- @aqualy/ui/components/input-otp
- @aqualy/ui/components/label
- @aqualy/ui/components/loading
- @aqualy/ui/components/menubar
- @aqualy/ui/components/metric-card
- @aqualy/ui/components/multi-select
- @aqualy/ui/components/navigation-menu
- @aqualy/ui/components/number-input
- @aqualy/ui/components/pagination
- @aqualy/ui/components/phone-input
- @aqualy/ui/components/popover
- @aqualy/ui/components/progress
- @aqualy/ui/components/radio-group
- @aqualy/ui/components/resizable
- @aqualy/ui/components/scroll-area
- @aqualy/ui/components/search
- @aqualy/ui/components/select
- @aqualy/ui/components/separator
- @aqualy/ui/components/sheet
- @aqualy/ui/components/sidebar
- @aqualy/ui/components/skeleton
- @aqualy/ui/components/slider
- @aqualy/ui/components/spinner
- @aqualy/ui/components/switch
- @aqualy/ui/components/tabs
- @aqualy/ui/components/textarea
- @aqualy/ui/components/timeline
- @aqualy/ui/components/toast
- @aqualy/ui/components/toggle
- @aqualy/ui/components/toggle-group
- @aqualy/ui/components/tooltip
- @aqualy/ui/components/tree
- @aqualy/ui/lib/utils
- @aqualy/ui/styles.css
