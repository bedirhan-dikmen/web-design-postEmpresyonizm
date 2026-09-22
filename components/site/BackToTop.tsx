'use client';

import { scrollToAnchor } from './scrollTo';

/** Back to the top of the current page (#ust exists on both pages): smooth unless reduced motion, focus follows. */
export default function BackToTop() {
  return (
    <a
      href="#ust"
      onClick={scrollToAnchor}
      className="group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold tracking-wide text-[#b9cbe3] ring-1 ring-white/10 transition-colors hover:bg-white/5 hover:text-white"
    >
      Yukarı çık
      <span aria-hidden className="transition-transform duration-200 group-hover:-translate-y-0.5">
        ↑
      </span>
    </a>
  );
}
