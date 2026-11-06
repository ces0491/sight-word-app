import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Camera, Plus, Trash2, LogIn, LogOut, BookOpen, BarChart } from 'lucide-react';
import WordCard from './WordCard';
import ImageUpload from '../ImageUpload';
import WordUsageDashboard from '../analytics/WordUsageDashboard';
import { DOLCH_LISTS } from '../../lib/wordLists';
import { normalizeWordInput } from '../../lib/sightWords';

/** Kindergarten to Grade 3, the span of the Dolch lists. */
const GRADES = [
  { value: 0, label: 'Kindergarten' },
  { value: 1, label: 'Grade 1' },
  { value: 2, label: 'Grade 2' },
  { value: 3, label: 'Grade 3' },
];

const ANTHROPIC_KEYS_URL = 'https://platform.claude.com/settings/keys';

const FORMATS = [
  { value: 'highlighted', label: 'Highlighted', sample: <span className="highlighted-text"><span className="highlight">see</span></span> },
  { value: 'bold', label: 'Bold', sample: <strong>see</strong> },
  { value: 'underlined', label: 'Underlined', sample: <u>see</u> },
  { value: 'normal', label: 'Plain', sample: <span>see</span> },
];

/** What each setting changes in the reader, and in AI stories. */
const LEARNING_NEEDS = [
  { key: 'adhd', label: 'ADHD', detail: 'More space between lines, and no hints around the page. AI stories use short sentences.' },
  { key: 'dyslexia', label: 'Dyslexia', detail: 'Wider spacing between letters, words and lines, and a softer marker on sight words. AI stories avoid tricky spellings.' },
  { key: 'autism', label: 'Autism', detail: 'Pages appear without sliding. AI stories use literal language and a predictable shape.' },
  { key: 'esl', label: 'Learning English', detail: 'Sight words are bold. AI stories use simple words and repeat them.' },
  { key: 'visualProcessing', label: 'Visual processing', detail: 'Bigger text and a thicker page outline. AI stories keep to one idea per sentence.' },
];

const Section = ({ id, title, children, description }) => (
  <section aria-labelledby={id} className="space-y-4 rounded-2xl border-2 border-ink/15 bg-paper p-5 sm:p-6">
    <div>
      <h2 id={id} className="font-display text-2xl font-semibold text-ink">
        {title}
      </h2>
      {description && <p className="mt-1 font-display text-base text-ink/70">{description}</p>}
    </div>
    {children}
  </section>
);

/** Pick words from the Dolch lists, one level at a time. */
const WordListPicker = ({ words, onAddWords, onRemoveWord }) => {
  const [levelId, setLevelId] = useState(DOLCH_LISTS[0].id);
  const level = DOLCH_LISTS.find((l) => l.id === levelId);
  const chosen = new Set(words.map((w) => w.toLowerCase()));
  const missing = level.words.filter((w) => !chosen.has(w.toLowerCase()));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Word list level">
        {DOLCH_LISTS.map((l) => (
          <button
            key={l.id}
            type="button"
            role="tab"
            aria-selected={l.id === levelId}
            onClick={() => setLevelId(l.id)}
            className={`rounded-full border-2 px-4 py-2 font-display text-base ${
              l.id === levelId ? 'border-ink bg-ink text-paper' : 'border-ink/20 bg-paper text-ink hover:border-ink/50'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" aria-label={`${level.label} words`} className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {level.words.map((word) => {
            const on = chosen.has(word.toLowerCase());
            return (
              <button
                key={word}
                type="button"
                aria-pressed={on}
                onClick={() => (on ? onRemoveWord(word.toLowerCase()) : onAddWords([word.toLowerCase()]))}
                className={`rounded-xl border-2 px-3 py-1 font-read text-lg ${
                  on ? 'border-ink bg-card-sun text-ink' : 'border-ink/20 bg-paper text-ink hover:border-ink/50'
                }`}
              >
                {word}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="btn-quiet"
          disabled={missing.length === 0}
          onClick={() => onAddWords(missing.map((w) => w.toLowerCase()))}
        >
          <Plus size={18} aria-hidden="true" /> Add all {level.label.toLowerCase()} words
        </button>
      </div>
    </div>
  );
};

/** Add or remove the grown-up's own Anthropic API key, used for AI stories. */
const AnthropicKeySettings = ({ keyHint, onSave, onRemove }) => {
  const [draft, setDraft] = useState('');

  const save = (event) => {
    event.preventDefault();
    if (onSave(draft)) setDraft('');
  };

  return (
    <div className="space-y-3 border-t-2 border-ink/10 pt-4">
      <h3 className="font-display text-xl font-semibold text-ink">Anthropic API key</h3>
      <p className="font-display text-base text-ink/70">
        AI stories use your own Anthropic API key, and Anthropic bills your account for each one. The key is saved in this
        browser and goes straight to Anthropic when a story is made. Signing out removes it.
      </p>
      {keyHint ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-display text-base text-ink">A key ending in {keyHint} is saved in this browser.</p>
          <button type="button" onClick={onRemove} className="btn-quiet">
            <Trash2 size={18} aria-hidden="true" /> Remove key
          </button>
        </div>
      ) : (
        <form onSubmit={save} className="flex gap-2">
          <label htmlFor="anthropic-key" className="sr-only">
            Anthropic API key
          </label>
          <input
            id="anthropic-key"
            type="password"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="field"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit" disabled={!draft.trim()} className="btn btn-sun shrink-0">
            Save key
          </button>
        </form>
      )}
      <p className="font-display text-sm text-ink/70">
        Create a key in the{' '}
        <a href={ANTHROPIC_KEYS_URL} target="_blank" rel="noopener noreferrer" className="underline">
          Anthropic Console
        </a>
        .
      </p>
    </div>
  );
};

/**
 * Everything a parent or teacher sets up: the words, the story options,
 * learning needs, saved stories and the account.
 */
const GrownUps = ({
  words,
  onAddWords,
  onRemoveWord,
  onClearWords,
  grade,
  onGradeChange,
  useAI,
  onUseAIChange,
  includeImages,
  onIncludeImagesChange,
  storyFormat,
  onStoryFormatChange,
  learningNeeds,
  onLearningNeedsChange,
  isSignedIn,
  userName,
  anthropicKeyHint,
  onSaveAnthropicKey,
  onRemoveAnthropicKey,
  savedStories,
  isLoadingStories,
  onOpenStory,
  onSignIn,
  onSignOut,
  onBack,
}) => {
  const [typed, setTyped] = useState('');
  const [addMode, setAddMode] = useState('type'); // type | upload | photo
  const canUseAI = isSignedIn && !!anthropicKeyHint;

  const addTyped = (event) => {
    event.preventDefault();
    const newWords = normalizeWordInput(typed);
    if (newWords.length > 0) onAddWords(newWords);
    setTyped('');
  };

  const uploadList = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => onAddWords(normalizeWordInput(String(e.target.result ?? '')));
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
      <div className="max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Grown-ups</h1>
          <button type="button" onClick={onBack} className="btn btn-sun">
            <ArrowLeft size={22} strokeWidth={2.5} aria-hidden="true" /> Back to story time
          </button>
        </div>

        <Section id="words-title" title="Words to practise" description="Stories are built around these words. Tap a word list below, or add your own.">
          {words.length > 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {words.map((word, index) => (
                  <WordCard key={word} word={word} index={index} size="sm" onRemove={onRemoveWord} />
                ))}
              </div>
              <button type="button" onClick={onClearWords} className="btn-quiet">
                <Trash2 size={18} aria-hidden="true" /> Clear all words
              </button>
            </div>
          ) : (
            <p className="font-display text-base text-ink/70">No words yet.</p>
          )}

          <div className="flex flex-wrap gap-2" role="group" aria-label="Ways to add words">
            {[
              { id: 'type', label: 'Type words', icon: Plus },
              { id: 'upload', label: 'Upload a list', icon: Upload },
              { id: 'photo', label: 'Scan a page', icon: Camera },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={addMode === id}
                onClick={() => setAddMode(id)}
                className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 font-display text-base ${
                  addMode === id ? 'border-ink bg-ink text-paper' : 'border-ink/20 bg-paper text-ink hover:border-ink/50'
                }`}
              >
                <Icon size={18} aria-hidden="true" /> {label}
              </button>
            ))}
          </div>

          {addMode === 'type' && (
            <form onSubmit={addTyped} className="flex gap-2">
              <label htmlFor="add-words" className="sr-only">
                Words to add, separated by spaces or commas
              </label>
              <input
                id="add-words"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder="e.g. the, see, can"
                className="field"
                autoComplete="off"
              />
              <button type="submit" className="btn btn-sun shrink-0">
                Add
              </button>
            </form>
          )}
          {addMode === 'upload' && (
            <div>
              <label htmlFor="upload-words" className="mb-2 block font-display text-base text-ink">
                A .txt or .csv file with the words separated by spaces, commas or new lines
              </label>
              <input id="upload-words" type="file" accept=".txt,.csv" onChange={uploadList} className="font-display text-base text-ink" />
            </div>
          )}
          {addMode === 'photo' && <ImageUpload onWordsDetected={onAddWords} />}

          <div className="border-t-2 border-ink/10 pt-4">
            <h3 className="mb-3 font-display text-xl font-semibold text-ink">Sight word lists</h3>
            <WordListPicker words={words} onAddWords={onAddWords} onRemoveWord={onRemoveWord} />
          </div>
        </Section>

        <Section id="story-title" title="Story">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="grade" className="mb-2 block font-display text-base font-medium text-ink">
                Reading level
              </label>
              <select
                id="grade"
                value={grade}
                onChange={(e) => onGradeChange(Number(e.target.value))}
                aria-describedby="grade-help"
                className="field"
              >
                {GRADES.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
              <p id="grade-help" className="mt-2 font-display text-sm text-ink/70">
                {useAI
                  ? 'Claude writes the story for this level.'
                  : 'Classic stories are the same at every level. The level is saved with the story, so you can sort your library by it.'}
              </p>
            </div>
            <fieldset>
              <legend className="mb-2 block font-display text-base font-medium text-ink">Story maker</legend>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  aria-pressed={!useAI}
                  onClick={() => onUseAIChange(false)}
                  className={`rounded-xl border-2 px-3 py-3 font-display text-base ${!useAI ? 'border-ink bg-card-sun' : 'border-ink/20 bg-paper'}`}
                >
                  Classic
                </button>
                <button
                  type="button"
                  aria-pressed={useAI}
                  disabled={!canUseAI}
                  onClick={() => onUseAIChange(true)}
                  className={`rounded-xl border-2 px-3 py-3 font-display text-base disabled:cursor-not-allowed disabled:opacity-50 ${useAI ? 'border-ink bg-card-sun' : 'border-ink/20 bg-paper'}`}
                >
                  AI
                </button>
              </div>
              <p className="mt-2 font-display text-sm text-ink/70">
                {!isSignedIn
                  ? 'Sign in to use AI stories.'
                  : !canUseAI
                    ? 'Add your Anthropic API key under Account to use AI stories.'
                    : useAI
                      ? 'Claude writes a new story around the words, billed to your Anthropic account.'
                      : 'Builds a day-in-the-life story from written scenes, in this browser.'}
              </p>
            </fieldset>
          </div>

          <fieldset>
            <legend className="mb-2 block font-display text-base font-medium text-ink">How sight words look</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {FORMATS.map((f) => (
                <label
                  key={f.value}
                  className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 text-center ${
                    storyFormat === f.value ? 'border-ink bg-mist' : 'border-ink/20 bg-paper'
                  }`}
                >
                  <input
                    type="radio"
                    name="story-format"
                    value={f.value}
                    checked={storyFormat === f.value}
                    onChange={() => onStoryFormatChange(f.value)}
                    className="sr-only"
                  />
                  <span className="font-read text-2xl text-ink">{f.sample}</span>
                  <span className="font-display text-sm text-ink">{f.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={includeImages}
              onChange={(e) => onIncludeImagesChange(e.target.checked)}
              className="h-6 w-6 accent-[#233059]"
            />
            <span className="font-display text-base text-ink">Show a picture on every page</span>
          </label>
        </Section>

        <Section id="needs-title" title="Learning needs" description="These change how a story looks while it's read.">
          <div className="space-y-2">
            {LEARNING_NEEDS.map((need) => (
              <label key={need.key} className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-ink/10 p-3 hover:border-ink/30">
                <input
                  type="checkbox"
                  checked={!!learningNeeds[need.key]}
                  onChange={() => onLearningNeedsChange({ ...learningNeeds, [need.key]: !learningNeeds[need.key] })}
                  className="mt-1 h-6 w-6 shrink-0 accent-[#233059]"
                />
                <span>
                  <span className="block font-display text-lg font-medium text-ink">{need.label}</span>
                  <span className="block font-display text-sm text-ink/70">{need.detail}</span>
                </span>
              </label>
            ))}
          </div>
        </Section>

        <Section id="saved-title" title="Saved stories">
          {!isSignedIn ? (
            <p className="font-display text-base text-ink/70">Sign in to save stories and read them again on any device.</p>
          ) : isLoadingStories ? (
            <p className="font-display text-base text-ink/70">Loading your stories…</p>
          ) : savedStories.length === 0 ? (
            <p className="font-display text-base text-ink/70">No saved stories yet. Save one from the last page of a story.</p>
          ) : (
            <ul className="divide-y-2 divide-ink/10">
              {savedStories.slice(0, 8).map((story) => (
                <li key={story._id} className="flex items-center justify-between gap-3 py-3">
                  <span className="min-w-0">
                    <span className="block truncate font-display text-lg text-ink">{story.title}</span>
                    <span className="block font-display text-sm text-ink/60">
                      {new Date(story.createdAt).toLocaleDateString()} · {story.words?.length ?? 0} words
                    </span>
                  </span>
                  <button type="button" onClick={() => onOpenStory(story)} className="btn-quiet shrink-0">
                    <BookOpen size={18} aria-hidden="true" /> Read
                  </button>
                </li>
              ))}
            </ul>
          )}
          {isSignedIn && (
            <Link href="/stories" className="btn-quiet">
              Open the story library
            </Link>
          )}
        </Section>

        {isSignedIn && (
          <Section
            id="usage-title"
            title="Word usage"
            description="Counted across everyone who uses this app, not only your account."
          >
            <details className="group">
              <summary className="inline-flex cursor-pointer items-center gap-2 font-display text-base text-ink">
                <BarChart size={18} aria-hidden="true" /> Show which words come up most
              </summary>
              <div className="mt-4">
                <WordUsageDashboard />
              </div>
            </details>
          </Section>
        )}

        <Section id="account-title" title="Account">
          {isSignedIn ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-display text-base text-ink">Signed in{userName ? ` as ${userName}` : ''}.</p>
                <button type="button" onClick={onSignOut} className="btn-quiet">
                  <LogOut size={18} aria-hidden="true" /> Sign out
                </button>
              </div>
              <AnthropicKeySettings keyHint={anthropicKeyHint} onSave={onSaveAnthropicKey} onRemove={onRemoveAnthropicKey} />
            </>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-display text-base text-ink/70">
                An account lets you save and share stories, and make AI stories with your own Anthropic API key.
              </p>
              <button type="button" onClick={onSignIn} className="btn btn-sun">
                <LogIn size={20} strokeWidth={2.5} aria-hidden="true" /> Sign in
              </button>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
};

export default GrownUps;
