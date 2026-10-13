"use client"

import * as React from "react"
import { Menu as Primitive } from "@base-ui/react/menu"
import { CheckIcon, ChevronRightIcon, ChevronLeftIcon, CircleIcon } from "lucide-react"
import { AqualyUIPortalScope } from "#components/aqualy-ui-portal"
import { useAqualyUIScope } from "#components/aqualy-ui-scope"
import { cn } from "#lib/utils"

const ParentPopup = React.createContext<React.RefObject<HTMLDivElement | null> | null>(null)
const SubActions = React.createContext<React.RefObject<Primitive.Root.Actions | null> | null>(null)
function useNarrowMenu() {
  const [narrow, setNarrow] = React.useState(false)
  React.useEffect(() => { const media = window.matchMedia("(max-width:600px)"); const update = () => setNarrow(media.matches); update(); media.addEventListener("change", update); return () => media.removeEventListener("change", update) }, [])
  return narrow
}
export type ActionMenuContentProps = React.ComponentProps<typeof Primitive.Popup> & Pick<Primitive.Positioner.Props, "align" | "side" | "sideOffset" | "alignOffset" | "collisionPadding"> & { size?: "sm" | "default" }
export function ActionMenuContent({ className, size = "default", align = "start", side = "bottom", sideOffset = 4, alignOffset = 0, collisionPadding = 12, ref, ...props }: ActionMenuContentProps) {
  const popup = React.useRef<HTMLDivElement>(null)
  const setPopupRef = React.useCallback((element: HTMLDivElement | null) => {
    popup.current = element
    const cleanup = typeof ref === "function" ? ref(element) : undefined
    if (ref && typeof ref !== "function") ref.current = element
    if (!element) return
    return () => {
      popup.current = null
      if (typeof cleanup === "function") cleanup()
      else if (typeof ref === "function") ref(null)
      else if (ref) ref.current = null
    }
  }, [ref])
  // An explicit name takes precedence over Base UI's default trigger label.
  return <Primitive.Portal><AqualyUIPortalScope><Primitive.Positioner className="aq-positioner" align={align} side={side} sideOffset={sideOffset} alignOffset={alignOffset} collisionPadding={collisionPadding}>
    <ParentPopup.Provider value={popup}><Primitive.Popup {...props} {...(props["aria-label"] && !props["aria-labelledby"] ? { "aria-labelledby": undefined } : {})} ref={setPopupRef} data-slot="menu-content" data-size={size} className={state => cn("aq-popover-content aq-action-menu", typeof className === "function" ? className(state) : className)} /></ParentPopup.Provider>
  </Primitive.Positioner></AqualyUIPortalScope></Primitive.Portal>
}
export function ActionMenuSub(props: Omit<Primitive.SubmenuRoot.Props, "actionsRef">) {
  const actions = React.useRef<Primitive.Root.Actions>(null)
  return <SubActions.Provider value={actions}><Primitive.SubmenuRoot actionsRef={actions} {...props} /></SubActions.Provider>
}
export function ActionMenuSubContent({ className, children, backLabel = "Back", size = "default", ...props }: React.ComponentProps<typeof Primitive.Popup> & { backLabel?: string; size?: "sm" | "default" }) {
  const parent = React.useContext(ParentPopup)
  const actions = React.useContext(SubActions)
  const narrow = useNarrowMenu()
  const { dir } = useAqualyUIScope()
  // A zero-height virtual anchor at the parent's top preserves stacking without
  // negative offsets bypassing collision bounds after scroll/keyboard movement.
  const stackedAnchor = React.useMemo(() => ({ getBoundingClientRect() {
    const rect = parent?.current?.getBoundingClientRect()
    return new DOMRect(rect?.x ?? 12, rect?.y ?? 12, rect?.width ?? 240, 0)
  } }), [parent])
  return <Primitive.Portal><AqualyUIPortalScope><Primitive.Positioner className="aq-positioner" collisionPadding={12} sticky={narrow} collisionAvoidance={narrow ? { side: "shift", align: "shift", fallbackAxisSide: "none" } : undefined} side={narrow ? "bottom" : "inline-end"} align="start" sideOffset={narrow ? 0 : 4} anchor={narrow ? stackedAnchor : undefined}>
    <Primitive.Popup {...props} {...(props["aria-label"] && !props["aria-labelledby"] ? { "aria-labelledby": undefined } : {})} data-slot="menu-sub-content" data-size={size} data-mobile-stack={narrow || undefined} className={state => cn("aq-popover-content aq-action-menu", typeof className === "function" ? className(state) : className)}>
      {narrow && <Primitive.Item className="aq-action-menu-item aq-action-menu-back" closeOnClick={false} onClick={() => actions?.current?.close()}>{dir === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}<span>{backLabel}</span></Primitive.Item>}{children}
    </Primitive.Popup>
  </Primitive.Positioner></AqualyUIPortalScope></Primitive.Portal>
}
export function ActionMenuItem({ className, variant = "default", inset = false, ...props }: Primitive.Item.Props & { variant?: "default" | "destructive"; inset?: boolean }) {
  return <Primitive.Item {...props} data-slot="menu-item" data-variant={variant} data-inset={inset || undefined} className={state => cn("aq-action-menu-item", typeof className === "function" ? className(state) : className)} />
}
export function ActionMenuSubTrigger({ className, children, ...props }: Primitive.SubmenuTrigger.Props) {
  return <Primitive.SubmenuTrigger {...props} data-slot="menu-sub-trigger" className={state => cn("aq-action-menu-item", typeof className === "function" ? className(state) : className)}>{children}<ChevronRightIcon className="aq-menu-sub-arrow" aria-hidden="true" /></Primitive.SubmenuTrigger>
}
export function ActionMenuCheckboxItem({ className, children, ...props }: Primitive.CheckboxItem.Props) {
  return <Primitive.CheckboxItem {...props} data-slot="menu-checkbox-item" className={state => cn("aq-action-menu-item aq-action-menu-selectable", typeof className === "function" ? className(state) : className)}><Primitive.CheckboxItemIndicator className="aq-menu-indicator"><CheckIcon /></Primitive.CheckboxItemIndicator>{children}</Primitive.CheckboxItem>
}
export function ActionMenuRadioItem({ className, children, ...props }: Primitive.RadioItem.Props) {
  return <Primitive.RadioItem {...props} data-slot="menu-radio-item" className={state => cn("aq-action-menu-item aq-action-menu-selectable", typeof className === "function" ? className(state) : className)}><Primitive.RadioItemIndicator className="aq-menu-indicator"><CircleIcon /></Primitive.RadioItemIndicator>{children}</Primitive.RadioItem>
}
export function ActionMenuLabel({ className, ...props }: Primitive.GroupLabel.Props) {
  return <Primitive.GroupLabel {...props} data-slot="menu-label" className={state => cn("aq-action-menu-label", typeof className === "function" ? className(state) : className)} />
}
export function ActionMenuSeparator({ className, ...props }: Primitive.Separator.Props) {
  return <Primitive.Separator {...props} data-slot="menu-separator" className={state => cn("aq-action-menu-separator", typeof className === "function" ? className(state) : className)} />
}
export function ActionMenuShortcut({ className, ...props }: React.ComponentProps<"kbd">) { return <kbd data-slot="menu-shortcut" className={cn("aq-action-menu-shortcut", className)} {...props} /> }
export function ActionMenuItemDescription({ className, ...props }: React.ComponentProps<"span">) { return <span data-slot="menu-item-description" className={cn("aq-action-menu-description", className)} {...props} /> }
