"use client";

import type { Transition } from "motion/react";
import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";

import { cn } from "@acme/ui";
import { toggleVariants } from "@acme/ui/toggle";

interface ToggleGroupContextValue {
  indicatorLayoutId: string;
  indicatorTransition: Transition;
  value: string;
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(
  null,
);

type ToggleGroupProps = Omit<
  React.ComponentProps<typeof ToggleGroupPrimitive.Root>,
  "defaultValue" | "onValueChange" | "type" | "value"
> & {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  value?: string;
};

function ToggleGroup({
  className,
  defaultValue = "",
  value,
  onValueChange,
  children,
  ...props
}: ToggleGroupProps) {
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState(defaultValue);
  const indicatorLayoutId = React.useId();
  const shouldReduceMotion = useReducedMotion();
  const selectedValue = value ?? uncontrolledValue;
  const indicatorTransition: Transition = shouldReduceMotion
    ? { duration: 0 }
    : {
        type: "tween",
        duration: 0.25,
        ease: [0.4, 0, 0.2, 1],
      };

  return (
    <ToggleGroupPrimitive.Root
      type="single"
      value={selectedValue}
      data-slot="toggle-group"
      className={cn(
        "bg-control-track relative grid w-fit auto-cols-fr grid-flow-col items-center gap-0.5 rounded-md p-[3px]",
        className,
      )}
      onValueChange={(nextValue) => {
        if (value === undefined) setUncontrolledValue(nextValue);
        onValueChange?.(nextValue);
      }}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{
          indicatorLayoutId,
          indicatorTransition,
          value: selectedValue,
        }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({
  className,
  children,
  value,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  const context = React.useContext(ToggleGroupContext);
  const isSelected = context?.value === value;

  return (
    <ToggleGroupPrimitive.Item
      value={value}
      data-slot="toggle-group-item"
      className={cn(
        toggleVariants({ size: "sm" }),
        "text-muted-foreground/60 hover:text-muted-foreground/60 data-[state=on]:text-foreground relative h-7 min-w-9 rounded-sm bg-transparent px-2.5 text-xs font-medium transition-[color] duration-200 hover:bg-transparent data-[state=on]:bg-transparent data-[state=on]:hover:bg-transparent",
        className,
      )}
      {...props}
    >
      {isSelected ? (
        <motion.span
          aria-hidden
          layoutId={context.indicatorLayoutId}
          className="border-border bg-card pointer-events-none absolute inset-0 z-0 rounded-sm border"
          transition={context.indicatorTransition}
        />
      ) : null}
      <span className="relative z-10 flex items-center justify-center gap-1">
        {children}
      </span>
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };
