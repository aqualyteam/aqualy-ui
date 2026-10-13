"use client"

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { ChevronDown } from "lucide-react"
import { cn } from "#lib/utils"

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props<string>) {
  return <AccordionPrimitive.Root data-slot="accordion" className={state => cn("aq-accordion", typeof className === "function" ? className(state) : className)} {...props} />
}

function AccordionItem({ className, ...props }: Omit<AccordionPrimitive.Item.Props, "value"> & { value: string }) {
  return <AccordionPrimitive.Item data-slot="accordion-item" className={state => cn("aq-accordion-item", typeof className === "function" ? className(state) : className)} {...props} />
}

function AccordionTrigger({ className, children, headingLevel = 3, ...props }: AccordionPrimitive.Trigger.Props & { headingLevel?: 2 | 3 | 4 | 5 | 6 }) {
  const headings = { 2: "h2", 3: "h3", 4: "h4", 5: "h5", 6: "h6" } as const
  const Heading = headings[headingLevel]
  return <AccordionPrimitive.Header className="aq-accordion-header" render={<Heading />}>
    <AccordionPrimitive.Trigger data-slot="accordion-trigger" className={state => cn("aq-accordion-trigger", typeof className === "function" ? className(state) : className)} {...props}>
      <span className="aq-accordion-label">{children}</span>
      <span className="aq-accordion-chevron" aria-hidden="true"><ChevronDown strokeWidth={1.6} /></span>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
}

function AccordionContent({ className, children, contentClassName, render, ...props }: AccordionPrimitive.Panel.Props & { contentClassName?: string }) {
  return <AccordionPrimitive.Panel data-slot="accordion-content" render={render ?? ((elementProps, state) => <div {...elementProps} inert={!state.open} />)} className={state => cn("aq-accordion-content", typeof className === "function" ? className(state) : className)} {...props}>
    <div className={cn("aq-accordion-body", contentClassName)}>{children}</div>
  </AccordionPrimitive.Panel>
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
