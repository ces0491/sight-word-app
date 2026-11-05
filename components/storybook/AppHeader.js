import React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

/**
 * The bar across the top: the app's name on the left, and whatever the
 * page needs on the right (the Grown-ups button, a back link).
 */
const AppHeader = ({ children, homeHref = '/' }) => (
  <header className="no-print mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
    <Link href={homeHref} className="flex items-center gap-2 rounded-xl font-display text-lg font-bold text-ink sm:text-2xl">
      <span className="grid h-11 w-11 place-items-center rounded-xl border-3 border-ink bg-sun shadow-cutout-sm">
        <BookOpen size={22} strokeWidth={2.5} aria-hidden="true" />
      </span>
      <span className="leading-tight">Sight Word Stories</span>
    </Link>
    <div className="flex items-center gap-2">{children}</div>
  </header>
);

export default AppHeader;
