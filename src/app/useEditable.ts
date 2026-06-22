'use client';

import { useState, useEffect, useCallback } from 'react';

// A small reusable record store backed by localStorage.
//
// - Renders the seed data on first paint (server + client match), then swaps in
//   any saved edits after mount — so it never causes a hydration mismatch.
// - `commitField` writes one field immediately (inline dropdowns).
// - `updateRecord` merges a set of fields (the drawer's Save).
// - `reset` clears the override and reverts to the original seed data.
export function useEditable<T extends { id: string;[k: string]: unknown }>(storageKey: string, seed: T[]) {
  const [records, setRecords] = useState<T[]>(seed);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setRecords(JSON.parse(saved));
    } catch {
      /* ignore malformed storage */
    }
    setMounted(true);
  }, [storageKey]);

  const update = useCallback((fn: (prev: T[]) => T[]) => {
    setRecords((prev) => {
      const next = fn(prev);
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  const commitField = useCallback((id: string, field: keyof T, value: unknown) => {
    update((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }, [update]);

  const updateRecord = useCallback((id: string, partial: Partial<T>) => {
    update((prev) => prev.map((r) => (r.id === id ? { ...r, ...partial } : r)));
  }, [update]);

  const reset = useCallback(() => {
    localStorage.removeItem(storageKey);
    setRecords(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, seed]);

  return { records, mounted, commitField, updateRecord, reset };
}
