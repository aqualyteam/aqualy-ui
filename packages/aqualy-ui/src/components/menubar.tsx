"use client"

import { Menubar as Primitive } from "@base-ui/react/menubar"
import { Menu } from "@base-ui/react/menu"
import { createContext, useContext } from "react"
import { DropdownMenuTrigger } from "#components/dropdown-menu"
import { Button } from "#components/button"
import { cn } from "#lib/utils"

const MenubarSize = createContext<"sm" | "default">("default")
export function Menubar({ className, size = "default", variant = "default", ...props }: Primitive.Props & { size?: "sm" | "default"; variant?: "default" | "bare" }) {
  return <MenubarSize.Provider value={size}><Primitive {...props} data-slot="menubar" data-size={size} data-variant={variant} className={state => cn("aq-menubar", typeof className === "function" ? className(state) : className)} /></MenubarSize.Provider>
}
export const MenubarMenu = Menu.Root
export function MenubarTrigger({ render, className, ...props }: Menu.Trigger.Props) {
  const size = useContext(MenubarSize)
  return <DropdownMenuTrigger {...props} render={render ?? <Button variant="ghost" size={size} />} className={state => cn("aq-menubar-trigger", typeof className === "function" ? className(state) : className)} />
}
export const MenubarGroup = Menu.Group
export const MenubarRadioGroup = Menu.RadioGroup
export {
  ActionMenuContent as MenubarContent, ActionMenuSub as MenubarSub,
  ActionMenuSubContent as MenubarSubContent, ActionMenuSubTrigger as MenubarSubTrigger,
  ActionMenuItem as MenubarItem, ActionMenuCheckboxItem as MenubarCheckboxItem,
  ActionMenuRadioItem as MenubarRadioItem, ActionMenuLabel as MenubarLabel,
  ActionMenuSeparator as MenubarSeparator, ActionMenuShortcut as MenubarShortcut,
  ActionMenuItemDescription as MenubarItemDescription,
  type ActionMenuContentProps as MenubarContentProps,
} from "#lib/action-menu"
