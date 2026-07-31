import type { Dispatch, SetStateAction } from "react";
import { useEffect, useRef, useState } from "react";

export function useDebouncedValue<T>(
  value: T,
  delay: number,
): [T, Dispatch<SetStateAction<T>>] {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, delay]);

  return [debouncedValue, setDebouncedValue];
}
