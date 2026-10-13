"use client"
import { Tabs as Primitive } from "@base-ui/react/tabs"
import { cn } from "#lib/utils"
export function Tabs({ className, ...props }: Primitive.Root.Props) {
  return <Primitive.Root {...props} data-slot="tabs" className={state => cn("aq-tabs", typeof className === "function" ? className(state) : className)} />
}
export type TabsListProps = Primitive.List.Props & { variant?: "underline" | "pills"; size?: "sm" | "default" | "lg" }
export function TabsList({ className, variant = "underline", size = "default", activateOnFocus = true, onKeyDownCapture, ...props }: TabsListProps) {
  return <Primitive.List {...props} activateOnFocus={activateOnFocus} data-slot="tabs-list" data-variant={variant} data-size={size}
    onKeyDownCapture={event => {
      onKeyDownCapture?.(event)
      if (event.defaultPrevented) return
      const list = event.currentTarget, vertical = list.dataset.orientation === "vertical", rtl = getComputedStyle(list).direction === "rtl"
      const nextKey = vertical ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight", previousKey = vertical ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft"
      if (![nextKey, previousKey, "Home", "End"].includes(event.key)) return
      const tabs = [...list.querySelectorAll<HTMLElement>('[role="tab"]')].filter(tab => tab.getAttribute("aria-disabled") !== "true" && tab.closest('[role="tablist"]') === list)
      if (!tabs.length) return
      const current = tabs.indexOf(document.activeElement instanceof HTMLElement ? document.activeElement : tabs[0])
      const index = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : props.loopFocus === false
        ? Math.max(0, Math.min(tabs.length - 1, current + (event.key === nextKey ? 1 : -1))) : (current + (event.key === nextKey ? 1 : -1) + tabs.length) % tabs.length
      // Pinned Base UI makes disabled tabs focusable; the approved catalog skips them.
      event.preventDefault(); event.stopPropagation(); tabs[index]?.focus()
    }}
    className={state => cn("aq-tabs-list", typeof className === "function" ? className(state) : className)} />
}
export function TabsTrigger({ className, ...props }: Primitive.Tab.Props) {
  return <Primitive.Tab {...props} data-slot="tabs-trigger" className={state => cn("aq-tabs-trigger", typeof className === "function" ? className(state) : className)} />
}
export function TabsContent({ className, ...props }: Primitive.Panel.Props) {
  return <Primitive.Panel {...props} data-slot="tabs-content" className={state => cn("aq-tabs-content", typeof className === "function" ? className(state) : className)} />
}
