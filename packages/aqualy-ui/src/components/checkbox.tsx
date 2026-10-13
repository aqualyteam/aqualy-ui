"use client"

import * as React from "react"
import { Checkbox as Primitive } from "@base-ui/react/checkbox"
import { CheckboxGroup as Group } from "@base-ui/react/checkbox-group"
import { Check, Minus } from "lucide-react"
import { Field, FieldHeader, FieldLabel, FieldDescription, FieldError } from "#components/field"
import { cn } from "#lib/utils"

export type CheckboxProps = Primitive.Root.Props & { size?: "xs" | "sm" | "default" | "lg"; variant?: "neutral" | "marine" }
export function Checkbox({ size="default", variant="neutral", className, ...props }: CheckboxProps) {
  return <Primitive.Root nativeButton render={<button type="button" />} {...props} data-slot="checkbox" data-size={size} data-variant={variant}
    className={state=>cn("aq-checkbox",typeof className==="function"?className(state):className)}>
    <Primitive.Indicator className="aq-checkbox-indicator" render={(elementProps,state)=><span {...elementProps}>{state.indeterminate?<Minus/>:<Check/>}</span>}/>
  </Primitive.Root>
}
export function CheckboxGroup({className,...props}:Group.Props) {
  return <Group {...props} className={state=>cn("aq-checkbox-group",typeof className==="function"?className(state):className)}/>
}
export type CheckboxFieldProps = Omit<CheckboxProps,"children"> & { label: React.ReactNode; description?: React.ReactNode; error?: React.ReactNode; trailing?: boolean; icon?: React.ReactNode; badge?: React.ReactNode }
export function CheckboxField({id:providedId,label,description,error,trailing=false,icon,badge,...props}:CheckboxFieldProps) {
  const generatedId=React.useId(),id=providedId??generatedId
  const described=[description?`${id}-description`:null,error?`${id}-error`:null,props["aria-describedby"]].filter(Boolean).join(" ")||undefined
  return <Field orientation="horizontal" data-invalid={Boolean(error)||undefined} data-disabled={props.disabled||undefined} className={cn("aq-checkbox-field",trailing&&"aq-checkbox-field--trailing")}>
    <Checkbox {...props} id={id} aria-labelledby={`${id}-label`} aria-describedby={described} aria-invalid={error?true:props["aria-invalid"]}/>
    {icon&&<span className="aq-checkbox-field-icon" aria-hidden="true">{icon}</span>}
    <FieldHeader><FieldLabel htmlFor={id} id={`${id}-label`}>{label}{props.required&&<span aria-hidden="true"> *</span>}{badge}</FieldLabel>
      {description&&<FieldDescription id={`${id}-description`}>{description}</FieldDescription>}
      {error&&<FieldError id={`${id}-error`}>{error}</FieldError>}
    </FieldHeader>
  </Field>
}
