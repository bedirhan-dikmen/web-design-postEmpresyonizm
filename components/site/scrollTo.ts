import type { MouseEvent } from 'react';

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * In-page navigation that never restarts the film: the film is a pure function of the scroll position, so
 * scrolling to an anchor simply lands the playhead there. Smooth unless the reader prefers reduced motion;
 * focus moves to the target so keyboard and screen-reader users arrive where they asked to go.
 * The links keep real hrefs (#iletisim, #nexa, #ust), so they also work without JavaScript.
 */
export function scrollToAnchor(e: MouseEvent<HTMLAnchorElement>) {
  const href = e.currentTarget.getAttribute('href');
  if (!href || !href.startsWith('#')) return;
  const target = document.getElementById(href.slice(1));
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
  history.replaceState(null, '', href);
  const focusable = target.matches('[tabindex]') ? target : target.querySelector<HTMLElement>('[tabindex="-1"]');
  focusable?.focus({ preventScroll: true });
}

export const scrollToContact = scrollToAnchor;
