import React from 'react';
import Head from 'next/head';
import GrownUpPage from '../components/storybook/GrownUpPage';
import { RATE_LIMITS } from '../lib/limits';

/** Who answers privacy requests. Also on sheetsolved.com. */
const PRIVACY_CONTACT = 'cesaire@sheetsolved.com';

/** Change this whenever the page's content changes. */
const LAST_UPDATED = '6 November 2026';

/** A rate-limit count is deleted when its window ends, so the longest window is how long one can last. */
const longestWindowHours = Math.max(...Object.values(RATE_LIMITS).map(({ windowMs }) => windowMs)) / (60 * 60 * 1000);
const COUNT_LIFETIME = longestWindowHours === 1 ? 'an hour' : `${longestWindowHours} hours`;

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
 * with the code: the models in models/, browser storage in lib/anthropicKey.js,
 * components/SightWordStoryGenerator.js and components/storybook/ParentGate.js,
 * and the outside services allowed in next.config.js.
 */
export default function PrivacyPage() {
  return (
    <GrownUpPage title="Privacy">
      <Head>
        <meta name="description" content="What Sight Word Stories keeps, where it goes and how to remove it." />
      </Head>
      <div className="space-y-6 text-base leading-relaxed text-ink">
        <p>
          Sight Word Stories is made by Sheet Solved, which is responsible for the information the app keeps. This page
          says what that is, where it goes and how to remove it. Questions go to <ContactLink />.
        </p>
        <p className="text-ink/70">Last updated {LAST_UPDATED}.</p>

        <Section id="privacy-children" title="Children">
          <p>
            Children use the app with a grown-up and never have accounts. The app doesn&apos;t ask for a child&apos;s
            name, age or school. Two things a grown-up saves can still be about a child:
          </p>
          <List>
            <li>
              <strong>Learning needs</strong> (ADHD, dyslexia, autism, learning English, visual processing). These can
              say something about a child&apos;s health or development, so only the account that saved the story can
              see them, and they&apos;re left out when a story is shared.
            </li>
            <li>
              <strong>Practice words, and stories you write yourself.</strong> A child&apos;s name typed into either is
              saved with the story. A first name is enough.
            </li>
          </List>
          <p>
            If you aren&apos;t the child&apos;s parent or guardian, for example as a teacher, check with them before
            saving learning needs.
          </p>
        </Section>

        <Section id="privacy-kept" title="What the app keeps">
          <p>
            Without an account, Classic stories are made and read in your browser, and nothing about them reaches the
            app&apos;s server.
          </p>
          <p>With an account, the app&apos;s database keeps:</p>
          <List>
            <li>your name and email address</li>
            <li>your password, stored only as a bcrypt hash, so it can&apos;t be read back</li>
            <li>
              your saved stories: the title, sentences, words, reading level, display settings, learning needs and the
              date
            </li>
            <li>the email addresses you share a story with, until you stop sharing it or delete it</li>
          </List>
          <p>
            To stop misuse, it also counts sign-ups and sign-ins by IP address, sign-ins by a hash of the email address,
            and saves and shares by account. Each count is deleted once its time window, at most {COUNT_LIFETIME}, has
            passed.
          </p>
          <p>
            When you make a story while signed in, its words go to the server, which counts the Dolch sight words among
            them for the word usage dashboard and keeps none of the others. The counts aren&apos;t linked to anyone.
          </p>
        </Section>

        <Section id="privacy-browser" title="What stays in your browser">
          <List>
            <li>
              A cookie that keeps you signed in. It lasts 30 days and is removed when you sign out. Signing in also uses
              two short-lived cookies of its own. The app sets no advertising or tracking cookies.
            </li>
            <li>
              Your Anthropic API key, if you add one. It&apos;s kept in this browser for your account, removed when you
              sign out, and sent only to Anthropic.
            </li>
            <li>The words, settings and newest unsaved story, and the grown-up check, until you close the tab.</li>
            <li>Photos you scan for words. They&apos;re read on your device and never uploaded.</li>
          </List>
        </Section>

        <Section id="privacy-services" title="Other services">
          <List>
            <li>
              <strong>Vercel</strong> runs the app&apos;s server code in the United States (Washington, D.C.), so
              requests to the app, including the stories you save, pass through there. Vercel keeps logs of requests for
              a limited time. See{' '}
              <ExternalLink href="https://vercel.com/legal/privacy-notice">Vercel&apos;s privacy notice</ExternalLink>.
            </li>
            <li>
              <strong>MongoDB Atlas</strong> holds the database, in South Africa (Cape Town). See{' '}
              <ExternalLink href="https://www.mongodb.com/legal/privacy/privacy-policy">
                MongoDB&apos;s privacy policy
              </ExternalLink>
              .
            </li>
            <li>
              <strong>Resend</strong> sends share emails. It receives the recipient&apos;s address, your name, the
              story&apos;s title and reading level, your message and the link, and keeps its records of each email in the
              United States. See <ExternalLink href="https://resend.com/legal/privacy-policy">Resend&apos;s privacy policy</ExternalLink>.
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
          <p>
            The app has no analytics, advertising or tracking, and its fonts are served from this site. Sheet Solved
            doesn&apos;t sell your information or use it for marketing.
          </p>
        </Section>

        <Section id="privacy-retention" title="How long it's kept">
          <List>
            <li>
              Your account and stories, until you delete them. Deleting your account deletes its stories with it.
            </li>
            <li>The addresses a story was shared with, until you stop sharing it or delete it.</li>
            <li>Misuse counts, for at most {COUNT_LIFETIME}.</li>
            <li>Word usage counts are kept, as they aren&apos;t linked to anyone.</li>
            <li>Request logs, for as long as Vercel keeps them.</li>
          </List>
        </Section>

        <Section id="privacy-rights" title="Your choices">
          <List>
            <li>See, edit and delete your saved stories in the story library, and stop sharing any of them.</li>
            <li>Delete your account under Grown-ups → Account. Its stories go with it.</li>
            <li>
              For a copy of what the app holds about you, to correct your name or email address, or with any other
              question about your information, email <ContactLink />.
            </li>
            <li>
              If you&apos;re unhappy with how your information is handled, you can complain to South Africa&apos;s{' '}
              <ExternalLink href="https://inforegulator.org.za/">Information Regulator</ExternalLink>.
            </li>
          </List>
        </Section>

        <Section id="privacy-security" title="Keeping it safe">
          <p>
            The app is served over HTTPS, passwords are hashed, each account can reach only its own stories, and a share
            link carries a random token that stops working when you stop sharing the story.
          </p>
        </Section>

        <p className="text-ink/70">
          This page changes when the app changes what it keeps or which services it uses, and the date at the top shows
          the latest change.
        </p>
      </div>
    </GrownUpPage>
  );
}
