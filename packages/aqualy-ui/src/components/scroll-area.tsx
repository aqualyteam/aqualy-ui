"use client"

import * as React from "react"
import { cn } from "#lib/utils"
export type ScrollAreaProps = Omit<React.ComponentProps<"div">, "aria-label" | "role"> & { label: string; orientation?: "vertical" | "horizontal" | "both"; scrollbar?: "thin" | "hidden"; overscroll?: "auto" | "contain" }
// Native scrolling keeps wheel, touch, keyboard, sticky content and RTL behavior in the browser.
export function ScrollArea({ label, orientation = "vertical", scrollbar = "thin", overscroll = "contain", tabIndex = 0, className, ...props }: ScrollAreaProps) {
  return <div {...props} role="region" aria-label={label} tabIndex={tabIndex} data-slot="scroll-area" data-orientation={orientation} data-scrollbar={scrollbar} data-overscroll={overscroll} className={cn("aq-scroll-area", className)} />
}
export function scrollAreaPosition(element: HTMLElement, orientation: "vertical" | "horizontal" = "vertical") {
  const value = orientation === "vertical" ? element.scrollTop : Math.abs(element.scrollLeft), max = orientation === "vertical" ? element.scrollHeight - element.clientHeight : element.scrollWidth - element.clientWidth
  return value < 2 ? "start" : value >= max - 2 ? "end" : "middle"
}
export function scrollAreaToStart(element: HTMLElement, behavior: ScrollBehavior = "smooth") {
  const reduce = element.ownerDocument.defaultView?.matchMedia("(prefers-reduced-motion: reduce)").matches
  element.scrollTo({ top: 0, left: 0, behavior: reduce ? "instant" : behavior })
}
