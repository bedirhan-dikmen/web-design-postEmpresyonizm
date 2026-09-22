'use client';

/**
 * The copyright year, computed in the reader's browser so a static build stays correct after New Year.
 * (The prerendered HTML carries the build year; hydration updates it without a warning.)
 */
export default function CurrentYear() {
  return <span suppressHydrationWarning>{new Date().getFullYear()}</span>;
}
