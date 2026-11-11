import React, { useMemo, useState } from 'react';
import { Save, X, ArrowLeft } from 'lucide-react';
import { normalizeWordInput } from '../../lib/sightWords';
import { addWordsWithinLimit, checkStoryForSave } from '../../lib/storyChecks';
import { STORY_LIMITS } from '../../lib/limits';
import { useLeaveWarning, LEAVE_MESSAGE } from '../../hooks/useLeaveWarning';

const NO_NEEDS = { adhd: false, dyslexia: false, autism: false, esl: false, visualProcessing: false };

const FORMATS = [
  { value: 'highlighted', label: 'Highlighted words' },
  { value: 'bold', label: 'Bold words' },
  { value: 'underlined', label: 'Underlined words' },
  { value: 'normal', label: 'Plain text (no marking)' },
];

const NEEDS = [
  { key: 'adhd', label: 'ADHD' },
  { key: 'dyslexia', label: 'Dyslexia' },
  { key: 'autism', label: 'Autism' },
  { key: 'esl', label: 'Learning English' },
  { key: 'visualProcessing', label: 'Visual processing' },
];

/**
 * Edit a story's title, sentences, sight words and settings, or write a new
 * one. `onSave` receives the tidied story and may throw an Error whose
 * message is shown. Leaving with unsaved changes asks first.
 *
 * @param {object} props
 * @param {object} [props.story] - The story to edit; none for a new story
 * @param {(story: object) => Promise<void> | void} props.onSave
 * @param {() => void} props.onCancel
 */
const StoryEditor = ({ story, onSave, onCancel }) => {
  const initial = useMemo(
    () => ({
      title: story?.title ?? '',
      content: story?.content ?? [],
      words: story?.words ?? [],
      format: story?.format ?? 'highlighted',
      includeImages: story?.includeImages ?? true,
      grade: story?.grade ?? 1,
      learningNeeds: { ...NO_NEEDS, ...story?.learningNeeds },
    }),
    [story]
  );
  const [draft, setDraft] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [newWords, setNewWords] = useState('');
  const [problem, setProblem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved);
  useLeaveWarning(isDirty && !isSaving);

  const update = (changes) => setDraft((current) => ({ ...current, ...changes }));
  const setSentence = (index, value) => update({ content: draft.content.map((s, i) => (i === index ? value : s)) });

  const addWords = () => {
    const { words, skipped } = addWordsWithinLimit(draft.words, normalizeWordInput(newWords));
    update({ words });
    setNewWords('');
    setProblem(skipped ? `Stories can use up to ${STORY_LIMITS.maxWords} sight words, so ${skipped} weren't added.` : null);
  };

  const cancel = () => {
    if (isDirty && !window.confirm(LEAVE_MESSAGE)) return;
    onCancel();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { story: tidy, problem: reason } = checkStoryForSave(draft);
    if (reason) {
      setProblem(reason);
      return;
    }

    setProblem(null);
    setIsSaving(true);
    const toSave = { ...draft, ...tidy };
    try {
      await onSave(toSave);
      setDraft(toSave);
      setSaved(toSave);
    } catch (error) {
      console.error('Error saving story:', error);
      setProblem(error.message || 'The story could not be saved. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border-2 border-ink/15 bg-paper p-6" noValidate>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center">
          <button type="button" onClick={cancel} className="mr-3 rounded-full p-2 hover:bg-ink/10" aria-label="Back to the library">
            <ArrowLeft size={20} className="text-ink/70" aria-hidden="true" />
          </button>
          <h2 className="text-2xl font-bold text-ink">{story ? 'Edit story' : 'New story'}</h2>
        </div>
        <button type="submit" disabled={isSaving} className="flex items-center gap-2 rounded-xl bg-leaf px-4 py-2 text-white disabled:opacity-50">
          <Save size={18} aria-hidden="true" />
          {isSaving ? 'Saving…' : 'Save story'}
        </button>
      </div>

      {problem && (
        <p role="alert" className="rounded-xl bg-berry/15 p-3 text-ink">
          {problem}
        </p>
      )}

      <div>
        <label htmlFor="story-title" className="mb-1 block text-sm font-medium text-ink">
          Title
        </label>
        <input
          type="text"
          id="story-title"
          value={draft.title}
          onChange={(e) => update({ title: e.target.value })}
          maxLength={STORY_LIMITS.maxTitleLength}
          className="w-full rounded-xl border border-ink/25 px-3 py-2"
        />
      </div>

      <fieldset>
        <div className="mb-2 flex items-center justify-between">
          <legend className="text-sm font-medium text-ink">Sentences</legend>
          <button type="button" onClick={() => update({ content: [...draft.content, ''] })} className="text-sm text-ink hover:text-ink/70">
            + Add sentence
          </button>
        </div>
        {draft.content.length === 0 ? (
          <p className="mb-2 italic text-ink/70">No sentences yet. Add the first one.</p>
        ) : (
          <div className="space-y-3">
            {draft.content.map((sentence, index) => (
              <div key={index} className="flex items-start gap-2">
                <textarea
                  value={sentence}
                  onChange={(e) => setSentence(index, e.target.value)}
                  aria-label={`Sentence ${index + 1}`}
                  maxLength={STORY_LIMITS.maxSentenceLength}
                  className="min-h-[80px] grow rounded-xl border border-ink/25 px-3 py-2"
                />
                <button
                  type="button"
                  onClick={() => update({ content: draft.content.filter((_, i) => i !== index) })}
                  className="rounded-xl p-2 text-berry hover:bg-berry/10"
                  aria-label={`Remove sentence ${index + 1}`}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
      </fieldset>

      <fieldset>
        <div className="mb-2 flex items-center justify-between">
          <legend className="text-sm font-medium text-ink">Sight words</legend>
          <span className="text-sm text-ink/70">
            {draft.words.length} of up to {STORY_LIMITS.maxWords}
          </span>
        </div>
        <ul className="mb-3 flex flex-wrap gap-2" aria-label="Sight words in this story">
          {draft.words.map((word) => (
            <li key={word} className="flex items-center rounded-full bg-mist px-3 py-1">
              <span className="mr-2 text-ink">{word}</span>
              <button
                type="button"
                onClick={() => update({ words: draft.words.filter((w) => w !== word) })}
                className="text-ink hover:text-ink/70"
                aria-label={`Remove ${word}`}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
          {draft.words.length === 0 && <li className="italic text-ink/70">No words yet.</li>}
        </ul>
        <div className="flex gap-2">
          <label htmlFor="story-new-words" className="sr-only">
            Words to add, separated by spaces or commas
          </label>
          <input
            id="story-new-words"
            type="text"
            value={newWords}
            onChange={(e) => setNewWords(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addWords();
              }
            }}
            placeholder="e.g. the, see, can"
            autoComplete="off"
            className="grow rounded-xl border border-ink/25 px-3 py-2"
          />
          <button type="button" onClick={addWords} disabled={!newWords.trim()} className="rounded-xl bg-ink px-3 py-2 text-white disabled:opacity-50">
            Add
          </button>
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <fieldset>
            <legend className="mb-2 block text-sm font-medium text-ink">How sight words look</legend>
            <div className="space-y-2">
              {FORMATS.map((f) => (
                <label key={f.value} className="flex items-center">
                  <input
                    type="radio"
                    name="story-format"
                    value={f.value}
                    checked={draft.format === f.value}
                    onChange={() => update({ format: f.value })}
                    className="h-4 w-4"
                  />
                  <span className="ml-2 text-sm text-ink">{f.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={draft.includeImages}
              onChange={(e) => update({ includeImages: e.target.checked })}
              className="h-4 w-4 rounded-sm border-ink/25"
            />
            <span className="ml-2 text-sm text-ink">Show a picture on every page</span>
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="story-grade" className="mb-2 block text-sm font-medium text-ink">
              Reading level
            </label>
            <select
              id="story-grade"
              value={draft.grade}
              onChange={(e) => update({ grade: Number(e.target.value) })}
              className="w-full rounded-xl border border-ink/25 px-3 py-2 text-ink"
            >
              <option value={0}>Kindergarten</option>
              <option value={1}>Grade 1</option>
              <option value={2}>Grade 2</option>
              <option value={3}>Grade 3</option>
            </select>
          </div>

          <fieldset>
            <legend className="mb-2 block text-sm font-medium text-ink">Learning needs, used when this story is read</legend>
            <div className="space-y-2">
              {NEEDS.map((need) => (
                <label key={need.key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={draft.learningNeeds[need.key]}
                    onChange={(e) => update({ learningNeeds: { ...draft.learningNeeds, [need.key]: e.target.checked } })}
                    className="h-4 w-4 rounded-sm border-ink/25"
                  />
                  <span className="ml-2 text-sm text-ink">{need.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </div>
    </form>
  );
};

export default StoryEditor;
