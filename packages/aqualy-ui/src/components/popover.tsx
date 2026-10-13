"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { AqualyUIPortalScope } from "#components/aqualy-ui-portal"
import { cn } from "#lib/utils"

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  collisionPadding = 12,
  size,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<
    PopoverPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "collisionPadding"
  > & { size?: "sm" | "default" | "lg" }) {
  return (
    <PopoverPrimitive.Portal>
      <AqualyUIPortalScope>
        <PopoverPrimitive.Positioner
          align={align}
          alignOffset={alignOffset}
          side={side}
          sideOffset={sideOffset}
          collisionPadding={collisionPadding}
          className="aq-positioner"
        >
          <PopoverPrimitive.Popup
            data-slot="popover-content"
            data-popover-size={size}
            className={state => cn(
              "aq-popover-content",
              typeof className === "function" ? className(state) : className
            )}
            {...props}
            {...(props["aria-label"] ? { "aria-labelledby": props["aria-labelledby"] } : {})}
          />
        </PopoverPrimitive.Positioner>
      </AqualyUIPortalScope>
    </PopoverPrimitive.Portal>
  )
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("aq-popover-header", className)}
      {...props}
    />
  )
}

const PopoverClose = PopoverPrimitive.Close
function PopoverFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="popover-footer" className={cn("aq-popover-footer", className)} {...props} />
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={state => cn("aq-popover-title", typeof className === "function" ? className(state) : className)}
      {...props}
    />
  )
}

function PopoverDescription({
  className,
  ...props
}: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={state => cn("aq-popover-description", typeof className === "function" ? className(state) : className)}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  PopoverClose,
  PopoverFooter,
}
