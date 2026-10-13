"use client"

import * as React from "react"
import { Menu as Primitive } from "@base-ui/react/menu"
import { useRender } from "@base-ui/react/use-render"

export const DropdownMenu = Primitive.Root
export function DropdownMenuTrigger({ render, ...props }: Primitive.Trigger.Props) {
  return <Primitive.Trigger {...props} render={(elementProps, state) => <TriggerElement elementProps={elementProps} state={state} render={render} />} />
}
type TriggerElementProps = Parameters<Exclude<Primitive.Trigger.Props["render"], React.ReactElement | undefined>>[0]
function TriggerElement({ elementProps, state, render }: { elementProps: TriggerElementProps; state: Primitive.Trigger.State; render: Primitive.Trigger.Props["render"] }) {
  // In Base UI 1.5.0 the render state updates correctly while aria-expanded can lag.
  // Preserve its public render/ref/event composition and derive ARIA from that state.
  return useRender({ defaultTagName: "button", render, state: { ...state }, props: { ...elementProps, "aria-expanded": state.open } })
}
export const DropdownMenuGroup = Primitive.Group
export const DropdownMenuRadioGroup = Primitive.RadioGroup
export {
  ActionMenuContent as DropdownMenuContent,
  ActionMenuSub as DropdownMenuSub,
  ActionMenuSubContent as DropdownMenuSubContent,
  ActionMenuItem as DropdownMenuItem,
  ActionMenuSubTrigger as DropdownMenuSubTrigger,
  ActionMenuCheckboxItem as DropdownMenuCheckboxItem,
  ActionMenuRadioItem as DropdownMenuRadioItem,
  ActionMenuLabel as DropdownMenuLabel,
  ActionMenuSeparator as DropdownMenuSeparator,
  ActionMenuShortcut as DropdownMenuShortcut,
  ActionMenuItemDescription as DropdownMenuItemDescription,
  type ActionMenuContentProps as DropdownMenuContentProps,
} from "#lib/action-menu"
