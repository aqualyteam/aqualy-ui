"use client"

import type * as React from "react"
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"
import { Button } from "#components/button"
import { cn } from "#lib/utils"

type AvatarSize = "xs" | "sm" | "default" | "lg" | "xl"

function Avatar({ className, size = "default", ...props }: AvatarPrimitive.Root.Props & { size?: AvatarSize }) {
  return <AvatarPrimitive.Root data-slot="avatar" data-size={size} className={state => cn("aq-avatar", `aq-avatar--${size}`, typeof className === "function" ? className(state) : className)} {...props} />
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return <AvatarPrimitive.Image data-slot="avatar-image" className={state => cn("aq-avatar-image", typeof className === "function" ? className(state) : className)} {...props} />
}

function AvatarFallback({ className, ...props }: AvatarPrimitive.Fallback.Props) {
  return <AvatarPrimitive.Fallback data-slot="avatar-fallback" className={state => cn("aq-avatar-fallback", typeof className === "function" ? className(state) : className)} {...props} />
}

function AvatarBadge({ className, tone = "success", children, ...props }: React.ComponentProps<"span"> & { tone?: "success" | "warning" | "danger" | "info" | "neutral" }) {
  return <span data-slot="avatar-badge" data-tone={tone} data-has-icon={children ? "true" : "false"} aria-hidden="true" className={cn("aq-avatar-badge", className)} {...props}>{children}</span>
}

function AvatarGroup({ className, size = "default", spacing = "overlap", ...props }: React.ComponentProps<"div"> & { size?: AvatarSize; spacing?: "overlap" | "separated" }) {
  return <div data-slot="avatar-group" data-spacing={spacing} role="group" className={cn("aq-avatar-group", `aq-avatar--${size}`, className)} {...props} />
}

function AvatarGroupCount({ className, size, children, ...props }: Omit<React.ComponentProps<typeof Button>, "variant" | "size"> & { size?: AvatarSize }) {
  return <Button variant="ghost" size="icon" data-slot="avatar-group-count" className={cn("aq-avatar-count", size && `aq-avatar--${size}`, typeof className === "function" ? className({ disabled: props.disabled ?? false }) : className)} {...props}><bdi>{children}</bdi></Button>
}

export { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount, type AvatarSize }
