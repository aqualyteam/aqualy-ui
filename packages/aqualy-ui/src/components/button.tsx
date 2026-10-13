import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "#lib/utils"

const buttonVariants = cva("aq-button", {
  variants: {
    variant: {
      default: "aq-button--default", outline: "aq-button--outline",
      secondary: "aq-button--secondary", ghost: "aq-button--ghost",
      destructive: "aq-button--destructive", link: "aq-button--link", marine: "aq-button--marine",
    },
    size: {
      xs: "aq-control--xs", sm: "aq-control--sm", default: "aq-control--default",
      lg: "aq-control--lg", xl: "aq-control--xl",
      icon: "aq-control--default aq-button--icon", "icon-xs": "aq-control--xs aq-button--icon",
      "icon-sm": "aq-control--sm aq-button--icon", "icon-lg": "aq-control--lg aq-button--icon",
      "icon-xl": "aq-control--xl aq-button--icon",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
})

function Button({ className, variant = "default", size = "default", ...props }:
  ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return <ButtonPrimitive data-slot="button" data-variant={variant} data-size={size}
    className={cn(buttonVariants({ variant, size }), typeof className === "function" ? className({ disabled: props.disabled ?? false }) : className)} {...props} />
}

export { Button, buttonVariants }
