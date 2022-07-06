import { useCallback, useEffect, useRef } from "react";

export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
) {
  const ref = useRef(callback);
  useEffect(() => {
    ref.current = callback;
  });

  return useCallback(
    (...args: any[]) => ref.current(...args),
    []
  ) as unknown as T;
}
