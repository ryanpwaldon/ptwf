"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Clipboard } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@acme/ui/tooltip";

export function InviteCodeField({ code }: { code: string }) {
  const [copiedOpen, setCopiedOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedOpen(true);

      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }

      closeTimerRef.current = setTimeout(() => {
        setCopiedOpen(false);
      }, 1200);
    } catch {
      // No-op: clipboard may be unavailable in some contexts.
    }
  };

  return (
    <div className="flex w-full items-center gap-2">
      <div
        role="textbox"
        aria-label="Game code"
        className="border-input flex h-12 w-full cursor-default items-center justify-center rounded-md border bg-transparent px-3 font-mono text-xl select-text"
      >
        {code}
      </div>
      <Tooltip open={copiedOpen}>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="default"
            aria-label="Copy invite code"
            className="size-12"
            onClick={handleCopy}
          >
            {copiedOpen ? (
              <Check className="size-5" />
            ) : (
              <Clipboard className="size-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Copied!</TooltipContent>
      </Tooltip>
    </div>
  );
}
