"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/** False during SSR and the hydration render, true on the client afterwards. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
