"use client";

import type { SessionId } from "convex-helpers/server/sessions";
import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import { SessionProvider } from "convex-helpers/react/sessions";
import {
  ConvexProvider as ConvexProviderPrimitive,
  ConvexReactClient,
} from "convex/react";

import { env } from "~/env";

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL);

function useLocalStorage(key: string, initialValue: SessionId | undefined) {
  const [value, setValueInternal] = useState(() => {
    if (typeof localStorage !== "undefined") {
      const existing = localStorage.getItem(key);
      if (existing && existing !== "undefined") {
        return existing as SessionId;
      }
      if (initialValue !== undefined) localStorage.setItem(key, initialValue);
    }
    return initialValue;
  });
  const setValue = useCallback(
    (value: SessionId | undefined) => {
      if (value === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
      setValueInternal(value);
    },
    [key],
  );
  return [value, setValue] as const;
}

// Fall back when crypto.randomUUID is unavailable, such as on an unsecured local network.
function generateSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function ConvexProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderPrimitive client={convex}>
      <SessionProvider
        useStorage={useLocalStorage}
        storageKey="ptwf-session-id"
        idGenerator={generateSessionId}
      >
        {children}
      </SessionProvider>
    </ConvexProviderPrimitive>
  );
}
