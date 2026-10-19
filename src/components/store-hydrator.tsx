"use client";

import { useEffect } from "react";
import { useFluxStore } from "@/lib/store";

// Rehydrates the persisted store after the first client render, so the
// server HTML and the first client render match.
export function StoreHydrator() {
  useEffect(() => {
    useFluxStore.persist.rehydrate();
  }, []);
  return null;
}
