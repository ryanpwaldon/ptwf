"use client";

import type * as React from "react";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from "@acme/ui/command";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";

const CommandPicker = Dialog;

const CommandPickerTrigger = DialogTrigger;

function CommandPickerContent({
  title,
  className,
  children,
  ...commandProps
}: React.ComponentProps<typeof Command> & {
  title: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => {
      ref.current?.style.setProperty(
        "--visual-viewport-height",
        `${viewport.height}px`,
      );
    };

    update();
    viewport.addEventListener("resize", update);
    return () => viewport.removeEventListener("resize", update);
  }, []);

  return (
    <DialogContent
      ref={ref}
      showCloseButton={false}
      onOpenAutoFocus={(event) => {
        // Prevent auto-focus on touch devices to avoid opening the on-screen keyboard.
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
          event.preventDefault();
        }
      }}
      className="bg-muted inset-0 h-(--visual-viewport-height,100dvh) max-h-none w-full max-w-full! translate-0 rounded-none p-0 ring-0 sm:p-0"
    >
      <DialogTitle className="sr-only">{title}</DialogTitle>
      <div className="mx-auto flex h-full min-h-0 w-full max-w-xl min-w-0 flex-col sm:p-4">
        <Command
          className={cn("bg-background! rounded-none! p-0!", className)}
          {...commandProps}
        >
          {children}
        </Command>
      </div>
    </DialogContent>
  );
}

function CommandPickerInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandInput>) {
  return (
    <div className="border-input flex h-16 items-center border-b">
      <div className="flex-1 **:data-[slot=command-input]:h-full! **:data-[slot=command-input-wrapper]:p-0! **:data-[slot=input-group]:h-16! **:data-[slot=input-group]:rounded-none! **:data-[slot=input-group]:rounded-r-none! **:data-[slot=input-group]:border-0! **:data-[slot=input-group]:bg-transparent! **:data-[slot=input-group-addon]:**:size-5! **:data-[slot=input-group-addon]:h-full! **:data-[slot=input-group-addon]:pl-6!">
        <CommandInput className={cn("text-base", className)} {...props} />
      </div>
      <DialogClose asChild>
        <div className="flex h-16 w-16 shrink-0 items-center justify-center">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Close"
            className="size-12"
          >
            <X className="size-5" />
          </Button>
        </div>
      </DialogClose>
    </div>
  );
}

function CommandPickerList({
  className,
  ...props
}: React.ComponentProps<typeof CommandList>) {
  return (
    <CommandList
      className={cn("h-0! max-h-none! min-h-0! flex-1 px-4 pb-12", className)}
      {...props}
    />
  );
}

function CommandPickerGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandGroup>) {
  return <CommandGroup className={cn("px-0 py-4", className)} {...props} />;
}

function CommandPickerItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandItem>) {
  return <CommandItem className={cn("gap-3 p-3", className)} {...props} />;
}

const CommandPickerEmpty = CommandEmpty;

const CommandPickerLoading = CommandLoading;

export {
  CommandPicker,
  CommandPickerTrigger,
  CommandPickerContent,
  CommandPickerInput,
  CommandPickerList,
  CommandPickerGroup,
  CommandPickerItem,
  CommandPickerEmpty,
  CommandPickerLoading,
};
