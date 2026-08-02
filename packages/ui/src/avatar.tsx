"use client";

import type * as React from "react";
import { Avatar as AvatarPrimitive } from "radix-ui";

import { cn } from "@acme/ui";

import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

function Avatar({
  className,
  size = "default",
  tooltip,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: "2xs" | "xs" | "default" | "sm" | "lg";
  tooltip?: React.ReactNode;
}) {
  const avatar = (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative flex size-8 shrink-0 rounded-full select-none data-[size=2xs]:size-4 data-[size=lg]:size-10 data-[size=sm]:size-6 data-[size=xs]:size-5",
        className,
      )}
      {...props}
    />
  );

  if (!tooltip) return avatar;

  return (
    <Tooltip disableHoverableContent>
      <TooltipTrigger asChild>{avatar}</TooltipTrigger>
      <TooltipContent className="pointer-events-none">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full rounded-full", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted text-muted-foreground flex size-full items-center justify-center rounded-full text-sm group-data-[size=2xs]/avatar:text-[8px] group-data-[size=sm]/avatar:text-xs group-data-[size=xs]/avatar:text-[10px]",
        className,
      )}
      {...props}
    />
  );
}

type AvatarBadgePosition =
  | "top-left"
  | "top"
  | "top-right"
  | "left"
  | "right"
  | "bottom-left"
  | "bottom"
  | "bottom-right";

const badgePositionClasses: Record<AvatarBadgePosition, string> = {
  "top-left": "top-0 left-0",
  top: "top-0 left-1/2 -translate-x-1/2",
  "top-right": "top-0 right-0",
  left: "top-1/2 left-0 -translate-y-1/2",
  right: "top-1/2 right-0 -translate-y-1/2",
  "bottom-left": "bottom-0 left-0",
  bottom: "bottom-0 left-1/2 -translate-x-1/2",
  "bottom-right": "bottom-0 right-0",
};

function AvatarBadge({
  className,
  position = "bottom-right",
  ...props
}: React.ComponentProps<"span"> & { position?: AvatarBadgePosition }) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "bg-primary text-primary-foreground ring-background absolute z-10 inline-flex items-center justify-center rounded-full ring-2 select-none",
        badgePositionClasses[position],
        "group-data-[size=2xs]/avatar:size-1 group-data-[size=2xs]/avatar:[&>svg]:hidden",
        "group-data-[size=xs]/avatar:size-1.5 group-data-[size=xs]/avatar:[&>svg]:hidden",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-4 group-data-[size=lg]/avatar:[&>svg]:size-2.5",
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "*:data-[slot=avatar]:ring-background group/avatar-group flex -space-x-2 has-data-[size=2xs]:-space-x-1 *:data-[slot=avatar]:ring-2",
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "bg-muted text-muted-foreground ring-background relative flex size-8 shrink-0 items-center justify-center rounded-full text-sm ring-2 group-has-data-[size=2xs]/avatar-group:size-4 group-has-data-[size=2xs]/avatar-group:text-[8px] group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 group-has-data-[size=xs]/avatar-group:size-5 group-has-data-[size=xs]/avatar-group:text-[10px] [&>svg]:size-4 group-has-data-[size=2xs]/avatar-group:[&>svg]:size-2 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3 group-has-data-[size=xs]/avatar-group:[&>svg]:size-2.5",
        className,
      )}
      {...props}
    />
  );
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
};
