"use client"

import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog"
import { AqualyUIPortalScope } from "#components/aqualy-ui-portal"
import { Button } from "#components/button"
import { cn } from "#lib/utils"

function AlertDialog(props: AlertDialogPrimitive.Root.Props) {
  return <AlertDialogPrimitive.Root {...props} />
}

function AlertDialogTrigger(props: AlertDialogPrimitive.Trigger.Props) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}

function AlertDialogContent({ className, size = "default", ...props }: AlertDialogPrimitive.Popup.Props & { size?: "default" | "small" }) {
  return <AlertDialogPrimitive.Portal>
    <AqualyUIPortalScope layer="overlay">
      <AlertDialogPrimitive.Backdrop data-slot="alert-dialog-backdrop" className="aq-alert-dialog-backdrop" />
      <AlertDialogPrimitive.Viewport className="aq-alert-dialog-viewport">
        <AlertDialogPrimitive.Popup data-slot="alert-dialog-content" data-size={size} className={state => cn("aq-alert-dialog-content", typeof className === "function" ? className(state) : className)} {...props} />
      </AlertDialogPrimitive.Viewport>
    </AqualyUIPortalScope>
  </AlertDialogPrimitive.Portal>
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-header" className={cn("aq-alert-dialog-header", className)} {...props} />
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-footer" className={cn("aq-alert-dialog-footer", className)} {...props} />
}

function AlertDialogMedia({ className, tone = "neutral", ...props }: React.ComponentProps<"div"> & { tone?: "neutral" | "warning" | "danger" | "info" }) {
  return <div data-slot="alert-dialog-media" data-tone={tone} aria-hidden="true" className={cn("aq-alert-dialog-media", className)} {...props} />
}

function AlertDialogTitle({ className, ...props }: AlertDialogPrimitive.Title.Props) {
  return <AlertDialogPrimitive.Title data-slot="alert-dialog-title" className={state => cn("aq-alert-dialog-title", typeof className === "function" ? className(state) : className)} {...props} />
}

function AlertDialogDescription({ className, ...props }: AlertDialogPrimitive.Description.Props) {
  return <AlertDialogPrimitive.Description data-slot="alert-dialog-description" className={state => cn("aq-alert-dialog-description", typeof className === "function" ? className(state) : className)} {...props} />
}

type AlertDialogButtonProps = AlertDialogPrimitive.Close.Props & Pick<React.ComponentProps<typeof Button>, "variant" | "size">

function AlertDialogCancel({ variant = "outline", size = "default", render, ...props }: AlertDialogButtonProps) {
  return <AlertDialogPrimitive.Close data-slot="alert-dialog-cancel" render={render ?? <Button variant={variant} size={size} />} {...props} />
}

function AlertDialogAction({ variant = "default", size = "default", render, ...props }: AlertDialogButtonProps) {
  return <AlertDialogPrimitive.Close data-slot="alert-dialog-action" render={render ?? <Button variant={variant} size={size} />} {...props} />
}

export { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogMedia, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction }
