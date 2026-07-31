"use client";

import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

interface ImageWithFallbackProps
  extends Omit<ComponentProps<typeof Image>, "src"> {
  src: ComponentProps<typeof Image>["src"] | null;
  icon?: ReactNode;
  containerClassName?: string;
}

export function ImageWithFallback({
  icon = <ImageIcon className="text-muted-foreground size-1/3" />,
  containerClassName,
  className,
  onError,
  src,
  ...imageProps
}: ImageWithFallbackProps) {
  const [errored, setErrored] = useState(false);

  return (
    <div className={`relative overflow-hidden ${containerClassName ?? ""}`}>
      <div className="bg-muted absolute inset-0 flex items-center justify-center">
        {icon}
        <div className="absolute inset-0 rounded-[inherit] border" />
      </div>
      {!errored && src != null && (
        <Image
          className={`relative ${className ?? ""}`}
          onError={(e) => {
            setErrored(true);
            onError?.(e);
          }}
          src={src}
          {...imageProps}
        />
      )}
    </div>
  );
}
