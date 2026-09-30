"use client";

import { useEffect } from "react";

/** Registers the service worker so e1-4 installs to the home screen and opens offline. */
export function InstallApp() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  }, []);
  return null;
}
