import React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

/**
 * A full-page message: loading, or something that went wrong with a way out.
 */
const StatusScreen = ({ title, message, action }) => (
  <div className="flex min-h-screen items-center justify-center bg-sky px-4">
    <div className="cutout w-full max-w-md p-8 text-center" role={action ? 'alert' : 'status'}>
      <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border-3 border-ink bg-sun shadow-cutout-sm">
        <BookOpen size={28} strokeWidth={2.5} aria-hidden="true" />
      </span>
      <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
      {message && <p className="mt-2 font-display text-base text-ink/80">{message}</p>}
      {action && (
        <Link href={action.href} className="btn btn-sun mt-6">
          {action.label}
        </Link>
      )}
    </div>
  </div>
);

export default StatusScreen;
