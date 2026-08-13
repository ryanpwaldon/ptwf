"use client";

import { useEffect } from "react";
import { ConvexError } from "convex/values";

import { toast } from "@acme/ui/toast";

const UNCAUGHT_ERROR_TOAST_ID = "uncaught-error";
const UNCAUGHT_ERROR_TOAST_COOLDOWN_MS = 4000;

let lastUncaughtErrorToastTimestamp = 0;

function notifyUncaughtError(
  message = "Something went wrong. Please try again.",
) {
  const now = Date.now();
  const elapsed = now - lastUncaughtErrorToastTimestamp;

  if (elapsed < UNCAUGHT_ERROR_TOAST_COOLDOWN_MS) {
    return;
  }

  lastUncaughtErrorToastTimestamp = now;
  toast.error(message, {
    id: UNCAUGHT_ERROR_TOAST_ID,
  });
}

function extractConvexErrorMessage(error: unknown): string | undefined {
  if (error instanceof ConvexError && typeof error.data === "string") {
    return error.data;
  }
}

export function UncaughtErrorToastListener() {
  useEffect(() => {
    const onWindowError = (event: ErrorEvent) => {
      notifyUncaughtError(extractConvexErrorMessage(event.error));
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      notifyUncaughtError(extractConvexErrorMessage(event.reason));
    };

    window.addEventListener("error", onWindowError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onWindowError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
