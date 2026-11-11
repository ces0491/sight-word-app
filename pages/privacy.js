import React from 'react';
import Head from 'next/head';
import GrownUpPage from '../components/storybook/GrownUpPage';

/** Who answers privacy questions. Also on sheetsolved.com. */
const PRIVACY_CONTACT = 'cesaire@sheetsolved.com';

/** Change this whenever the page's content changes. */
const LAST_UPDATED = '11 November 2026';

const Section = ({ id, title, children }) => (
  <section aria-labelledby={id} className="space-y-3 rounded-2xl border-2 border-ink/15 bg-paper p-5 sm:p-6">
    <h2 id={id} className="font-display text-2xl font-semibold text-ink">
      {title}
    </h2>
    {children}
  </section>
);

const List = ({ children }) => <ul className="list-disc space-y-2 pl-5">{children}</ul>;

const ExternalLink = ({ href, children }) => (
  <a href={href} className="underline underline-offset-2 hover:text-ink/70">
    {children}
  </a>
);

const ContactLink = () => (
  <a href={`mailto:${PRIVACY_CONTACT}`} className="underline underline-offset-2 hover:text-ink/70">
    {PRIVACY_CONTACT}
  </a>
);

/**
 * What the app keeps, where it goes and how to remove it. Keep this in step
 * with the code: browser storage in lib/storyLibrary.js, lib/anthropicKey.js,
 * components/SightWordStoryGenerator.js and components/storybook/ParentGate.js,
 * share links in lib/shareLink.js, and the outside services allowed in
 * next.config.js.
 */
export default function PrivacyPage() {
  return (
    <GrownUpPage title="Privacy">
      <Head>
        <meta name="description" content="What Sight Word Stories keeps, where it goes and how to remove it." />
      </Head>
      <div className="space-y-6 text-base leading-relaxed text-ink">
        <p>
          Sight Word Stories is made by Sheet Solved. It has no accounts and no database: the stories you make and save
          stay in your browser. This page says what goes where and how to remove it. Questions go to <ContactLink />.
        </p>
        <p className="text-ink/70">Last updated {LAST_UPDATED}.</p>

        <Section id="privacy-children" title="Children">
          <p>
            Children use the app with a grown-up. The app doesn&apos;t ask for a child&apos;s name, age or school. Two
            things a grown-up chooses can still be about a child:
          </p>
          <List>
            <li>
              <strong>Learning needs</strong> (ADHD, dyslexia, autism, learning English, visual processing). These can
              say something about a child&apos;s health or development. They&apos;re saved only in your browser, left out
              of share links, and sent to Anthropic only when you make an AI story.
            </li>
            <li>
              <strong>Practice words, and stories you write yourself.</strong> A child&apos;s name typed into either is
              saved with the story, goes with it in a share link, and is sent to Anthropic for an AI story. A first name
              is enough.
            </li>
          </List>
          <p>
            If you aren&apos;t the child&apos;s parent or guardian, for example as a teacher, check with them before
            choosing learning needs.
          </p>
        </Section>

        <Section id="privacy-browser" title="What stays in your browser">
          <List>
            <li>
              Saved stories: the title, sentences, words, reading level, display settings, learning needs and the date.
              They stay until you delete them or clear this site&apos;s data.
            </li>
            <li>
              Your Anthropic API key, if you add one, until you remove it. It&apos;s sent only to Anthropic.
            </li>
            <li>The words, settings and newest unsaved story, and the grown-up check, until you close the tab.</li>
            <li>Photos you scan for words. They&apos;re read on your device and never uploaded.</li>
          </List>
          <p>
            Anyone else who uses this browser can open the saved stories and use the key, and a browser extension that
            can read this site could copy them. The grown-up check keeps a young child out, but it isn&apos;t a lock. On
            a computer other people use, remove the key when you&apos;re done. Grown-ups → AI stories explains how to
            make a key that expires, in a workspace with a monthly spend limit. The app sets no cookies.
          </p>
        </Section>

        <Section id="privacy-sharing" title="Sharing a story">
          <p>
            A share link holds the story itself: the title, sentences, words, reading level and display settings, but not
            the learning needs. The story is in the part of the link after &ldquo;#&rdquo;, which browsers don&apos;t send
            to the app&apos;s server, so the app never receives it.
          </p>
          <p>
            Anyone the link reaches can read the story, including anyone it&apos;s passed on to. Nothing about the link is
            stored, so it can&apos;t be switched off later. The app sends nothing itself: you send the link however you
            choose.
          </p>
        </Section>

        <Section id="privacy-services" title="Other services">
          <List>
            <li>
              <strong>Vercel</strong>, a United States company, hosts the app and serves its pages. Its logs of requests
              to the app include IP addresses and are kept for a limited time. See{' '}
              <ExternalLink href="https://vercel.com/legal/privacy-notice">Vercel&apos;s privacy notice</ExternalLink>.
            </li>
            <li>
              <strong>Anthropic</strong>, only when you make an AI story. Your browser sends the words, reading level and
              learning needs straight to Anthropic under your own API key, and{' '}
              <ExternalLink href="https://www.anthropic.com/legal/privacy">Anthropic&apos;s privacy policy</ExternalLink>{' '}
              applies. The app&apos;s server never sees the key or the request.
            </li>
            <li>
              <strong>jsDelivr</strong> serves the photo scanner&apos;s text-recognition engine to your browser when you
              scan a photo.
            </li>
            <li>
              <strong>Read-aloud</strong> uses your device&apos;s own voice where it has one. If it has no English voice
              of its own, the browser may use an online voice, and the browser&apos;s maker receives the text being read.
            </li>
          </List>
          <p>The app has no analytics, advertising or tracking, and its fonts are served from this site.</p>
        </Section>

        <Section id="privacy-rights" title="Your choices">
          <List>
            <li>Read, edit and delete saved stories in the story library.</li>
            <li>
              Remove your API key under Grown-ups → AI stories. That takes it out of this browser; to stop the key
              working anywhere, delete it in the Anthropic Console.
            </li>
            <li>Clear this site&apos;s data in your browser&apos;s settings to remove everything the app keeps there.</li>
            <li>
              With any question about your information, email <ContactLink />.
            </li>
            <li>
              If you&apos;re unhappy with how your information is handled, you can complain to South Africa&apos;s{' '}
              <ExternalLink href="https://inforegulator.org.za/">Information Regulator</ExternalLink>.
            </li>
          </List>
        </Section>

        <p className="text-ink/70">
          This page changes when the app changes what it keeps or which services it uses, and the date at the top shows
          the latest change.
        </p>
      </div>
    </GrownUpPage>
  );
}
