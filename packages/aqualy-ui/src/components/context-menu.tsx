"use client"

import type * as React from "react"
import { ContextMenu as Primitive } from "@base-ui/react/context-menu"

export const ContextMenu = Primitive.Root
// Base UI 1.5.0 delegates native contextmenu events but does not implement Shift+F10.
// Normalize keyboard entry through the same primitive event, retaining its positioning/focus.
export function ContextMenuTrigger({ onKeyDown, ...props }: React.ComponentProps<typeof Primitive.Trigger>) {
  return <Primitive.Trigger {...props} onKeyDown={event => {
    onKeyDown?.(event)
    if (event.defaultPrevented || !(event.key === "ContextMenu" || (event.shiftKey && event.key === "F10"))) return
    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    event.currentTarget.dispatchEvent(new MouseEvent("contextmenu", {
      bubbles: true, cancelable: true, button: 2,
      clientX: Math.max(12, Math.min(window.innerWidth - 12, rect.left + 16)),
      clientY: Math.max(12, Math.min(window.innerHeight - 12, rect.top + 16)),
    }))
  }} />
}
export const ContextMenuGroup = Primitive.Group
export const ContextMenuRadioGroup = Primitive.RadioGroup
export {
  ActionMenuContent as ContextMenuContent,
  ActionMenuSub as ContextMenuSub,
  ActionMenuSubContent as ContextMenuSubContent,
  ActionMenuItem as ContextMenuItem,
  ActionMenuSubTrigger as ContextMenuSubTrigger,
  ActionMenuCheckboxItem as ContextMenuCheckboxItem,
  ActionMenuRadioItem as ContextMenuRadioItem,
  ActionMenuLabel as ContextMenuLabel,
  ActionMenuSeparator as ContextMenuSeparator,
  ActionMenuShortcut as ContextMenuShortcut,
  ActionMenuItemDescription as ContextMenuItemDescription,
  type ActionMenuContentProps as ContextMenuContentProps,
} from "#lib/action-menu"
