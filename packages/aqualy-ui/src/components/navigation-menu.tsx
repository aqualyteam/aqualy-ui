"use client"

import { NavigationMenu as Primitive } from "@base-ui/react/navigation-menu"
import { ChevronDown } from "lucide-react"
import { AqualyUIPortalScope } from "#components/aqualy-ui-portal"
import { cn } from "#lib/utils"

export function NavigationMenu<Value = string>({ className, orientation = "horizontal", ...props }: Primitive.Root.Props<Value>) {
  return <Primitive.Root {...props} orientation={orientation} data-orientation={orientation} data-slot="navigation-menu" className={state => cn("aq-site-navigation", typeof className === "function" ? className(state) : className)} />
}
export function NavigationMenuList({ className, ...props }: Primitive.List.Props) {
  return <Primitive.List {...props} className={state => cn("aq-site-navigation-list", typeof className === "function" ? className(state) : className)} />
}
export const NavigationMenuItem = Primitive.Item
export function NavigationMenuTrigger({ children, className, ...props }: Primitive.Trigger.Props) {
  return <Primitive.Trigger {...props} className={state => cn("aq-site-navigation-trigger", typeof className === "function" ? className(state) : className)}>{children}<Primitive.Icon className="aq-site-navigation-icon"><ChevronDown aria-hidden="true" /></Primitive.Icon></Primitive.Trigger>
}
export function NavigationMenuContent({ className, ...props }: Primitive.Content.Props) {
  return <Primitive.Content {...props} data-slot="navigation-menu-content" className={state => cn("aq-site-navigation-content", typeof className === "function" ? className(state) : className)} />
}
export function NavigationMenuLink({ className, closeOnClick = true, ...props }: Primitive.Link.Props) {
  return <Primitive.Link {...props} closeOnClick={closeOnClick} className={state => cn("aq-site-navigation-link", typeof className === "function" ? className(state) : className)} />
}
export function NavigationMenuViewport({ className, align = "start", sideOffset = 6, ...props }: Primitive.Popup.Props & Pick<Primitive.Positioner.Props, "align" | "sideOffset">) {
  return <Primitive.Portal><AqualyUIPortalScope><Primitive.Positioner className="aq-positioner aq-site-navigation-positioner" align={align} sideOffset={sideOffset} collisionPadding={12}>
    <Primitive.Popup {...props} data-slot="navigation-menu-popup" className={state => cn("aq-popover-content aq-site-navigation-popup", typeof className === "function" ? className(state) : className)}><Primitive.Viewport /></Primitive.Popup>
  </Primitive.Positioner></AqualyUIPortalScope></Primitive.Portal>
}
