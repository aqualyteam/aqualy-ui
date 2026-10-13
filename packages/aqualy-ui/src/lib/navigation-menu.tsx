"use client"

import type * as React from "react"
import { Menu } from "@base-ui/react/menu"
import { AqualyUIPortalScope } from "#components/aqualy-ui-portal"
import { cn } from "#lib/utils"

// Shared internal navigation/record menu. Base UI owns focus, dismissal and keys.
export const NavigationMenu = Menu.Root
export const NavigationMenuTrigger = Menu.Trigger
export function NavigationMenuContent({ className, ...props }: Menu.Popup.Props) {
  return <Menu.Portal><AqualyUIPortalScope><Menu.Positioner className="aq-positioner" align="start" sideOffset={4}>
    <Menu.Popup {...props} className={state => cn("aq-popover-content aq-navigation-menu", typeof className === "function" ? className(state) : className)} />
  </Menu.Positioner></AqualyUIPortalScope></Menu.Portal>
}
export function NavigationMenuItem({ className, ...props }: Menu.Item.Props) {
  return <Menu.Item {...props} className={state => cn("aq-navigation-menu-item", typeof className === "function" ? className(state) : className)} />
}
export function NavigationMenuLabel({ className, ...props }: React.ComponentProps<"div">) {
  return <div {...props} className={cn("aq-navigation-menu-label", className)} />
}
