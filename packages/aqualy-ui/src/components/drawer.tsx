"use client"

import * as React from "react"
import { Drawer as Primitive } from "@base-ui/react/drawer"
import { XIcon } from "lucide-react"
import { AqualyUIPortalScope } from "#components/aqualy-ui-portal"
import { Button } from "#components/button"
import { DialogHeader, DialogFooter, DialogMedia } from "#components/dialog"
import { cn } from "#lib/utils"

// Bottom Drawer deliberately reserves gestures for the handle. Form bodies only scroll.
const DrawerGestureContext = React.createContext(true)
const DrawerSnapContext = React.createContext(false)
const DrawerModalContext = React.createContext<Primitive.Root.Props["modal"]>(true)
export type DrawerProps = Omit<Primitive.Root.Props, "swipeDirection"> & { swipeToDismiss?: boolean }
export function Drawer({ swipeToDismiss = true, modal = true, snapPoints, onOpenChange, ...props }: DrawerProps) {
  return <DrawerSnapContext.Provider value={Boolean(snapPoints?.length)}><DrawerGestureContext.Provider value={swipeToDismiss}><DrawerModalContext.Provider value={modal}><Primitive.Root {...props} snapPoints={snapPoints} modal={modal} swipeDirection="down" onOpenChange={(open, details) => {
    if (!swipeToDismiss && details.reason === "swipe") { details.cancel(); return }
    onOpenChange?.(open, details)
  }} /></DrawerModalContext.Provider></DrawerGestureContext.Provider></DrawerSnapContext.Provider>
}
export const DrawerTrigger = Primitive.Trigger
export const DrawerClose = Primitive.Close
export type DrawerContentProps = Primitive.Popup.Props & { showCloseButton?: boolean; closeLabel?: string }
export function DrawerContent({ className, children, showCloseButton = true, closeLabel = "Close drawer", ...props }: DrawerContentProps) {
  const modal = React.useContext(DrawerModalContext)
  const snaps = React.useContext(DrawerSnapContext)
  return <Primitive.Portal><AqualyUIPortalScope layer="overlay">
    {modal === true && <Primitive.Backdrop data-slot="drawer-backdrop" className="aq-alert-dialog-backdrop aq-drawer-backdrop" />}
    <Primitive.Viewport className="aq-drawer-viewport" data-modal={modal}>
      <Primitive.Popup {...props} data-slot="drawer-content" data-snap-points={snaps || undefined} className={state => cn("aq-drawer-content", typeof className === "function" ? className(state) : className)}>
        {children}{showCloseButton && <Primitive.Close render={<Button variant="ghost" size="icon-sm" />} data-base-ui-swipe-ignore className="aq-overlay-close" aria-label={closeLabel}><XIcon /></Primitive.Close>}
      </Primitive.Popup>
    </Primitive.Viewport>
  </AqualyUIPortalScope></Primitive.Portal>
}
export function DrawerHandle({ className, ...props }: Omit<React.ComponentProps<"button">, "children"> & { "aria-label": string }) {
  const swipe = React.useContext(DrawerGestureContext)
  return <button type="button" data-slot="drawer-handle" data-base-ui-swipe-ignore={!swipe ? "" : undefined} className={cn("aq-drawer-handle", className)} {...props}><span aria-hidden="true" /></button>
}
export function DrawerBody({ className, ...props }: Primitive.Content.Props) {
  return <Primitive.Content data-slot="drawer-body" data-base-ui-swipe-ignore className={state => cn("aq-dialog-body", typeof className === "function" ? className(state) : className)} {...props} />
}
export function DrawerHeader(props: React.ComponentProps<typeof DialogHeader>) { return <DialogHeader data-base-ui-swipe-ignore {...props} /> }
export function DrawerFooter(props: React.ComponentProps<typeof DialogFooter>) { return <DialogFooter data-base-ui-swipe-ignore {...props} /> }
export function DrawerTitle({ className, ...props }: Primitive.Title.Props) {
  return <Primitive.Title data-slot="drawer-title" className={state => cn("aq-dialog-title", typeof className === "function" ? className(state) : className)} {...props} />
}
export function DrawerDescription({ className, ...props }: Primitive.Description.Props) {
  return <Primitive.Description data-slot="drawer-description" className={state => cn("aq-dialog-description", typeof className === "function" ? className(state) : className)} {...props} />
}
export { DialogMedia as DrawerMedia }
