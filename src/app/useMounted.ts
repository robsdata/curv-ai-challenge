'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

// Returns false during SSR and the first hydration render, then true on the
// client. This is the hydration-safe way to defer client-only UI (charts,
// localStorage-backed data) without calling setState inside an effect.
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true, // client
    () => false, // server
  );
}
