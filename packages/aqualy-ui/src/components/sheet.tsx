"use client"

import * as React from "react"
import { Dialog as Primitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"
import { AqualyUIPortalScope } from "#components/aqualy-ui-portal"
import { Button } from "#components/button"
import { DialogHeader, DialogBody, DialogFooter, DialogTitle, DialogDescription, DialogMedia } from "#components/dialog"
import { cn } from "#lib/utils"

const SheetModalContext = React.createContext<Primitive.Root.Props["modal"]>(true)
export function Sheet({ modal = true, disablePointerDismissal = true, ...props }: Primitive.Root.Props) {
  return <SheetModalContext.Provider value={modal}><Primitive.Root modal={modal} disablePointerDismissal={disablePointerDismissal} {...props} /></SheetModalContext.Provider>
}
export const SheetTrigger = Primitive.Trigger
export const SheetClose = Primitive.Close
export type SheetContentProps = Primitive.Popup.Props & {
  side?: "start" | "end" | "top" | "bottom"; size?: "small" | "default" | "wide"
  showCloseButton?: boolean; closeLabel?: string
}
export function SheetContent({ className, children, side = "end", size = "default", showCloseButton = true, closeLabel = "Close sheet", ...props }: SheetContentProps) {
  const modal = React.useContext(SheetModalContext)
  return <Primitive.Portal><AqualyUIPortalScope layer="overlay">
    {modal === true && <Primitive.Backdrop data-slot="sheet-backdrop" className="aq-alert-dialog-backdrop" />}
    <Primitive.Viewport className="aq-sheet-viewport" data-modal={modal}>
      <Primitive.Popup {...props} data-slot="sheet-content" data-side={side} data-size={size} className={state => cn("aq-sheet-content", typeof className === "function" ? className(state) : className)}>
        {children}{showCloseButton && <Primitive.Close render={<Button variant="ghost" size="icon-sm" />} className="aq-overlay-close" aria-label={closeLabel}><XIcon /></Primitive.Close>}
      </Primitive.Popup>
    </Primitive.Viewport>
  </AqualyUIPortalScope></Primitive.Portal>
}
export { DialogHeader as SheetHeader, DialogBody as SheetBody, DialogFooter as SheetFooter, DialogTitle as SheetTitle, DialogDescription as SheetDescription, DialogMedia as SheetMedia }
