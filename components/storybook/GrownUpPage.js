import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AppHeader from './AppHeader';

/**
 * Layout for grown-up pages (the story library and editor): the app
 * header, a back link, a title and the page's content.
 */
const GrownUpPage = ({ title, back = { href: '/', label: 'Story time' }, actions, children }) => (
  <div className="min-h-screen bg-sky">
    <Head>
      <title>{`${title} | Sight Word Stories`}</title>
    </Head>
    <AppHeader>
      <Link href={back.href} className="btn btn-paper whitespace-nowrap px-3 text-base sm:px-5 sm:text-lg">
        <ArrowLeft size={20} strokeWidth={2.5} aria-hidden="true" /> {back.label}
      </Link>
    </AppHeader>
    <main className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </main>
  </div>
);

export default GrownUpPage;
