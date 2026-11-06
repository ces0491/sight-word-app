import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Volume2, Square, X, Star, Search, RotateCcw, Save, Printer, Share2, Check } from 'lucide-react';
import StoryIllustration from '../EnhancedIllustration';
import StoryText from '../story/StoryText';
import ReaderText from './ReaderText';
import WordHunt from './WordHunt';
import { useSpeech } from '../../hooks/useSpeech';
import { planIllustrations } from '../../lib/imageGeneration';

const isTyping = (target) => ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName);

/** Classes on <body> that styles/learningAdaptations.css reads. */
const NEED_CLASSES = {
  adhd: 'adhd-enabled',
  dyslexia: 'dyslexia-enabled',
  autism: 'autism-enabled',
  esl: 'esl-enabled',
  visualProcessing: 'visual-processing-enabled',
};

/**
 * Read a story like a picture book: one page at a time, tap any word to
 * hear it, "Read to me" reads the page aloud, and the story ends with a
 * word hunt.
 *
 * @param {object} props
 * @param {object} props.story
 * @param {() => void} props.onClose
 * @param {string} [props.closeLabel]
 * @param {{ onSave?: () => void, onPrint?: () => void, onShare?: () => void, isSaving?: boolean, isSaved?: boolean }} [props.actions]
 *   Grown-up actions offered on the last page
 */
const StoryReader = ({ story, onClose, closeLabel = 'Done', actions = {} }) => {
  const pages = useMemo(() => (Array.isArray(story?.content) ? story.content : []), [story]);
  const plan = useMemo(() => planIllustrations(story), [story]);
  const words = story?.usedWords?.length ? story.usedWords : story?.words ?? [];
  const format = story?.format || 'highlighted';

  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [stage, setStage] = useState('pages'); // pages | end | hunt
  const speech = useSpeech();
  const { speak, stop, speaking, charIndex, supported } = speech;

  const goTo = useCallback(
    (index) => {
      stop();
      if (index >= pages.length) {
        setStage('end');
        return;
      }
      setDirection(index > pageIndex ? 1 : -1);
      setPageIndex(Math.max(0, index));
      setStage('pages');
    },
    [pages.length, pageIndex, stop]
  );

  // Arrow keys turn the pages
  useEffect(() => {
    const onKey = (event) => {
      if (stage !== 'pages' || isTyping(event.target)) return;
      if (event.key === 'ArrowRight') goTo(pageIndex + 1);
      if (event.key === 'ArrowLeft' && pageIndex > 0) goTo(pageIndex - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stage, pageIndex, goTo]);

  // Stop reading aloud when the reader closes
  useEffect(() => stop, [stop]);

  // The story is read with the learning needs saved with it
  useEffect(() => {
    const { classList } = document.body;
    Object.entries(NEED_CLASSES).forEach(([need, className]) => {
      classList.toggle(className, !!story?.learningNeeds?.[need]);
    });
    return () => Object.values(NEED_CLASSES).forEach((className) => classList.remove(className));
  }, [story]);

  // The button that was pressed goes away when the stage changes, so move
  // focus to what replaced it: the page, or "The end!" (the word hunt focuses itself)
  const pageRef = useRef(null);
  const endRef = useRef(null);
  useEffect(() => {
    if (stage === 'pages') pageRef.current?.focus();
    if (stage === 'end') endRef.current?.focus();
  }, [stage]);

  if (pages.length === 0) return null;

  const sentence = pages[pageIndex];
  const readAloud = () => (speaking ? stop() : speak(sentence, { trackWords: true }));
  const progress = stage === 'pages' ? (pageIndex + 1) / pages.length : 1;

  return (
    <div className="min-h-screen bg-sky pb-10">
      {/* Top bar */}
      <div className="no-print mx-auto flex max-w-5xl items-center gap-4 px-4 py-4 sm:px-6">
        <button type="button" onClick={onClose} className="btn btn-paper shrink-0">
          <X size={22} strokeWidth={2.5} aria-hidden="true" /> {closeLabel}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-center font-display text-lg font-semibold text-ink">{story.title}</p>
          <div
            className="mt-1 h-3 overflow-hidden rounded-full border-2 border-ink bg-paper"
            role="progressbar"
            aria-label="Story progress"
            aria-valuemin={1}
            aria-valuemax={pages.length}
            aria-valuenow={stage === 'pages' ? pageIndex + 1 : pages.length}
            aria-valuetext={stage === 'pages' ? `Page ${pageIndex + 1} of ${pages.length}` : 'The end'}
          >
            <div className="h-full bg-leaf transition-[width] duration-300" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      </div>

      <main className="no-print mx-auto max-w-5xl px-4 sm:px-6">
        {stage === 'pages' && (
          <>
            <p className="sr-only" aria-live="polite">
              Page {pageIndex + 1} of {pages.length}
            </p>
            <article
              key={pageIndex}
              ref={pageRef}
              tabIndex={-1}
              className="reader-page cutout animate-page-in mx-auto max-w-3xl overflow-hidden focus:outline-hidden"
              style={{ '--page-from': `${direction * 32}px` }}
              aria-label={`Page ${pageIndex + 1} of ${pages.length}`}
            >
              {story.includeImages !== false && (
                <div className="aspect-2/1 w-full border-b-3 border-ink bg-mist">
                  <StoryIllustration
                    sentence={sentence}
                    options={plan[pageIndex]}
                    width="100%"
                    height="100%"
                    alt=""
                  />
                </div>
              )}
              <div className="px-6 py-8 sm:px-12 sm:py-10">
                <ReaderText
                  sentence={sentence}
                  words={words}
                  format={format}
                  onWordTap={supported ? (word) => speak(word) : undefined}
                  spokenIndex={speaking ? charIndex : null}
                />
              </div>
            </article>

            <nav className="mx-auto mt-6 grid max-w-3xl grid-cols-[auto_1fr_auto] items-center gap-3" aria-label="Pages">
              <button
                type="button"
                onClick={() => goTo(pageIndex - 1)}
                disabled={pageIndex === 0}
                className="btn btn-paper btn-big"
              >
                <ArrowLeft size={30} strokeWidth={2.5} aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">Back</span>
              </button>
              {supported && (
                <button type="button" onClick={readAloud} className="btn btn-sun btn-big justify-self-center" aria-pressed={speaking}>
                  {speaking ? (
                    <Square size={26} strokeWidth={2.5} aria-hidden="true" />
                  ) : (
                    <Volume2 size={30} strokeWidth={2.5} aria-hidden="true" />
                  )}
                  {speaking ? 'Stop' : 'Read to me'}
                </button>
              )}
              <button type="button" onClick={() => goTo(pageIndex + 1)} className="btn btn-leaf btn-big col-start-3">
                <span className="sr-only sm:not-sr-only">Next</span>
                <ArrowRight size={30} strokeWidth={2.5} aria-hidden="true" />
              </button>
            </nav>
            {supported && (
              <p className="reader-chrome-extra mt-4 text-center font-display text-lg text-ink/70">Tap any word to hear it.</p>
            )}
          </>
        )}

        {stage === 'end' && (
          <section className="mx-auto max-w-2xl space-y-8 py-6 text-center" aria-labelledby="the-end">
            <div className="flex justify-center gap-3" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <Star
                  key={i}
                  size={i === 1 ? 72 : 56}
                  strokeWidth={2.5}
                  className="animate-rise fill-berry text-ink"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </div>
            <h2 id="the-end" ref={endRef} tabIndex={-1} className="font-display text-5xl font-bold text-ink focus:outline-hidden sm:text-6xl">
              The end!
            </h2>
            <p className="font-display text-xl text-ink/80">You read &ldquo;{story.title}&rdquo;.</p>
            <div className="flex flex-wrap justify-center gap-3">
              {words.length > 0 && (
                <button type="button" onClick={() => setStage('hunt')} className="btn btn-sun btn-big">
                  <Search size={28} strokeWidth={2.5} aria-hidden="true" /> Word hunt
                </button>
              )}
              <button type="button" onClick={() => goTo(0)} className="btn btn-paper btn-big">
                <RotateCcw size={26} strokeWidth={2.5} aria-hidden="true" /> Read again
              </button>
            </div>

            {(actions.onSave || actions.onPrint || actions.onShare) && (
              <div className="mx-auto max-w-md rounded-2xl bg-paper/70 p-4">
                <p className="mb-3 font-display text-base text-ink/70">For grown-ups</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {actions.onSave && (
                    <button
                      type="button"
                      onClick={actions.onSave}
                      disabled={actions.isSaving || actions.isSaved}
                      className="btn-quiet"
                    >
                      {actions.isSaved ? <Check size={18} aria-hidden="true" /> : <Save size={18} aria-hidden="true" />}
                      {actions.isSaved ? 'Saved' : actions.isSaving ? 'Saving…' : 'Save'}
                    </button>
                  )}
                  {actions.onPrint && (
                    <button type="button" onClick={actions.onPrint} className="btn-quiet">
                      <Printer size={18} aria-hidden="true" /> Print
                    </button>
                  )}
                  {actions.onShare && (
                    <button type="button" onClick={actions.onShare} className="btn-quiet">
                      <Share2 size={18} aria-hidden="true" /> Share
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {stage === 'hunt' && (
          <div className="py-6">
            <WordHunt words={words} speech={speech} onDone={() => setStage('end')} />
          </div>
        )}
      </main>

      {/* Printing shows every page */}
      <div className="print-only px-8">
        <h1 className="mb-6 font-display text-3xl font-bold">{story.title}</h1>
        {pages.map((page, index) => (
          <div key={index} className="print-page">
            {story.includeImages !== false && (
              <StoryIllustration sentence={page} options={plan[index]} width="100%" height={260} alt="" />
            )}
            <p className="reader-text mt-3 text-ink">
              <StoryText sentence={page} words={words} format={format} />
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryReader;
