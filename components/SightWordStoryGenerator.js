import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Settings, Sparkles, Send } from 'lucide-react';

import AppHeader from './storybook/AppHeader';
import WordCard from './storybook/WordCard';
import StoryReader from './storybook/StoryReader';
import StoryShelf from './storybook/StoryShelf';
import GrownUps from './storybook/GrownUps';
import ParentGate, { grownUpChecked } from './storybook/ParentGate';
import Modal from './storybook/Modal';
import AuthDialog from './auth/AuthDialog';
import { ToastContainer } from './Toast';

import { generateStory } from '../lib/storyGeneration';
import { trackWordUsage } from '../lib/WordAnalytics';
import { STARTER_WORDS } from '../lib/wordLists';
import {
  loadAnthropicKey,
  storeAnthropicKey,
  forgetAnthropicKey,
  cleanAnthropicKey,
  anthropicKeyHint,
} from '../lib/anthropicKey';
import { addWordsWithinLimit, responseProblem } from '../lib/storyChecks';
import { STORY_LIMITS } from '../lib/limits';
import { useToast } from '../hooks/useToast';
import { useSpeech } from '../hooks/useSpeech';

/** Fields the stories API accepts when saving. */
const toSavePayload = (story) => ({
  title: story.title,
  content: story.content,
  scenes: story.scenes,
  words: story.words,
  format: story.format,
  includeImages: story.includeImages,
  grade: story.grade,
  learningNeeds: story.learningNeeds,
});

/**
 * Write an AI story with the grown-up's own key. The Anthropic SDK loads
 * only when an AI story is asked for.
 */
const requestAiStory = async (params) => {
  const { writeAiStory } = await import('../lib/aiStory');
  return writeAiStory(params);
};

/** Many words on the home screen get smaller cards. */
const LARGE_CARD_LIMIT = 12;

/** This tab's words, settings and newest unsaved story, kept across a reload or a trip to the library. */
const HOME_STATE_KEY = 'sightwords:home';

const isStory = (value) =>
  !!value && typeof value.title === 'string' && Array.isArray(value.content) && value.content.every((s) => typeof s === 'string');

/** What was kept for this tab, or null. */
const loadHomeState = () => {
  try {
    const state = JSON.parse(window.sessionStorage.getItem(HOME_STATE_KEY) ?? 'null');
    return state && typeof state === 'object' ? state : null;
  } catch {
    return null;
  }
};

/**
 * The app: story time for the child, the reader, and the grown-ups area.
 */
const SightWordStoryGenerator = () => {
  const { data: session } = useSession();
  const isSignedIn = !!session?.user;
  const userId = session?.user?.id;
  const toast = useToast();
  const speech = useSpeech();

  // What the story is made from
  const [words, setWords] = useState([]);
  const [grade, setGrade] = useState(1);
  const [learningNeeds, setLearningNeeds] = useState({
    adhd: false,
    dyslexia: false,
    autism: false,
    esl: false,
    visualProcessing: false,
  });
  const [useAI, setUseAI] = useState(false);
  // The signed-in grown-up's own Anthropic API key, for AI stories
  const [anthropicKey, setAnthropicKey] = useState(null);
  const [includeImages, setIncludeImages] = useState(true);
  const [storyFormat, setStoryFormat] = useState('highlighted');

  // Stories
  const [generatedStory, setGeneratedStory] = useState(null);
  const [readingStory, setReadingStory] = useState(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [savedStories, setSavedStories] = useState([]);
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  const [storiesError, setStoriesError] = useState(false);
  const [isSavingStory, setIsSavingStory] = useState(false);
  // False until this tab's kept state has been read, so defaults don't overwrite it
  const [restored, setRestored] = useState(false);

  // Screens and dialogs
  const [view, setView] = useState('home'); // home | reader | grownups
  const [showGate, setShowGate] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  // Set when sign-in starts from Save or Share, so that carries on once the session arrives
  const [saveAfterSignIn, setSaveAfterSignIn] = useState(false);
  const [shareAfterSignIn, setShareAfterSignIn] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  const fetchSavedStories = async () => {
    try {
      setIsLoadingStories(true);
      setStoriesError(false);
      const response = await fetch('/api/stories');
      if (!response.ok) throw new Error(`Stories request failed: ${response.status}`);
      const fetched = await response.json();
      // Keep stories saved here while the list was loading, which it may not include
      setSavedStories((current) => {
        const fetchedIds = new Set(fetched.map((story) => story._id));
        return [...current.filter((story) => story._id && !fetchedIds.has(story._id)), ...fetched];
      });
    } catch (error) {
      console.error('Error fetching stories:', error);
      setStoriesError(true);
    } finally {
      setIsLoadingStories(false);
    }
  };

  // Load saved stories when a user signs in
  useEffect(() => {
    if (isSignedIn) {
      fetchSavedStories();
    } else {
      setSavedStories([]);
      setStoriesError(false);
    }
  }, [isSignedIn]);

  // Bring back this tab's words, settings and unsaved story after a reload or a trip to the library
  useEffect(() => {
    const kept = loadHomeState();
    if (kept) {
      if (Array.isArray(kept.words)) {
        setWords(addWordsWithinLimit([], kept.words.filter((w) => typeof w === 'string')).words);
      }
      if (Number.isInteger(kept.grade) && kept.grade >= 0 && kept.grade <= 3) setGrade(kept.grade);
      if (kept.learningNeeds && typeof kept.learningNeeds === 'object') {
        setLearningNeeds((current) =>
          Object.fromEntries(Object.keys(current).map((need) => [need, !!kept.learningNeeds[need]]))
        );
      }
      if (typeof kept.includeImages === 'boolean') setIncludeImages(kept.includeImages);
      if (['highlighted', 'bold', 'underlined', 'normal'].includes(kept.storyFormat)) setStoryFormat(kept.storyFormat);
      if (isStory(kept.generatedStory)) setGeneratedStory(kept.generatedStory);
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      window.sessionStorage.setItem(
        HOME_STATE_KEY,
        JSON.stringify({
          words,
          grade,
          learningNeeds,
          includeImages,
          storyFormat,
          // Saved stories are in the account already
          generatedStory: generatedStory && !generatedStory._id ? generatedStory : null,
        })
      );
    } catch {
      // Storage full or blocked: the state just isn't kept
    }
  }, [restored, words, grade, learningNeeds, includeImages, storyFormat, generatedStory]);

  // Each account keeps its own key in this browser
  useEffect(() => {
    setAnthropicKey(loadAnthropicKey(userId));
  }, [userId]);

  // AI stories need an account and a key; switch back to Classic without them
  useEffect(() => {
    if (!isSignedIn || !anthropicKey) setUseAI(false);
  }, [isSignedIn, anthropicKey]);

  const addWords = (newWords) => {
    const { words: next, skipped } = addWordsWithinLimit(words, newWords);
    setWords(next);
    if (skipped > 0) {
      toast.warning(`Stories can use up to ${STORY_LIMITS.maxWords} words, so ${skipped} weren't added.`);
    }
  };
  const removeWord = (word) => setWords((current) => current.filter((w) => w !== word.toLowerCase()));

  /** Save a pasted API key. Returns false if it was rejected. */
  const saveAnthropicKey = (input) => {
    const key = cleanAnthropicKey(input);
    if (!key) {
      toast.error("That doesn't look like an API key. Paste it again without spaces.");
      return false;
    }
    setAnthropicKey(key);
    if (storeAnthropicKey(userId, key)) {
      toast.success('API key saved in this browser.');
    } else {
      toast.warning("This browser won't keep the key, so you'll need to add it again next visit.");
    }
    return true;
  };

  const removeAnthropicKey = () => {
    forgetAnthropicKey(userId);
    setAnthropicKey(null);
    toast.success('API key removed from this browser.');
  };

  const handleSignOut = () => {
    forgetAnthropicKey(userId);
    setAnthropicKey(null);
    signOut({ redirect: false });
  };

  const openGrownUps = () => {
    if (grownUpChecked()) {
      setView('grownups');
    } else {
      setShowGate(true);
    }
  };

  const openStory = (story) => {
    speech.stop();
    setReadingStory(story);
    setView('reader');
  };

  /** Make a story from the words, with AI when chosen, else (or on failure) Classic. */
  const handleGenerateStory = async () => {
    if (words.length === 0 || isGeneratingStory) return;
    setIsGeneratingStory(true);
    speech.stop();

    try {
      let storyData;
      if (useAI && isSignedIn && anthropicKey) {
        try {
          storyData = await requestAiStory({ apiKey: anthropicKey, words, grade, learningNeeds });
        } catch (aiError) {
          console.error('AI story generation failed:', aiError);
          // AiStoryError messages are written for the grown-up; anything else (a failed import) isn't
          const message = aiError?.name === 'AiStoryError' ? aiError.message : "The AI story didn't work.";
          toast.warning(`${message} Using Classic mode instead.`);
        }
      }
      storyData ??= generateStory(words, grade, learningNeeds);

      // Unsaved story: no _id until the stories API returns one
      const story = {
        title: storyData.title,
        content: storyData.content,
        // Classic stories record the scene behind each sentence; AI stories have none
        scenes: storyData.scenes ?? [],
        words: [...words],
        usedWords: storyData.usedWords || words,
        format: storyFormat,
        includeImages,
        grade,
        learningNeeds: { ...learningNeeds },
        timestamp: new Date().toISOString(),
      };

      setGeneratedStory(story);
      openStory(story);

      if (isSignedIn) {
        await trackWordUsage(words, grade);
      }
    } catch (error) {
      console.error('Error generating story:', error);
      toast.error('The story could not be made. Please try again.');
    } finally {
      setIsGeneratingStory(false);
    }
  };

  /** Save the story being read. Returns the saved story, or null. */
  const saveStory = useCallback(async () => {
    if (!readingStory) return null;
    if (readingStory._id) return readingStory;

    if (!isSignedIn) {
      setSaveAfterSignIn(true);
      setShowAuthDialog(true);
      return null;
    }

    try {
      setIsSavingStory(true);
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toSavePayload(readingStory)),
      });

      if (response.ok) {
        const savedStory = await response.json();
        setSavedStories((current) => [savedStory, ...current]);
        setReadingStory(savedStory);
        setGeneratedStory((current) => (current === readingStory ? savedStory : current));
        toast.success('Story saved.');
        return savedStory;
      }
      toast.error(await responseProblem(response, 'The story could not be saved. Please try again.'));
      return null;
    } catch (error) {
      console.error('Error saving story:', error);
      toast.error('The story could not be saved. Please try again.');
      return null;
    } finally {
      setIsSavingStory(false);
    }
  }, [readingStory, isSignedIn, toast]);

  // Finish a save that was interrupted by the sign-in dialog. The flag is
  // cleared before saving, so re-running when saveStory changes is harmless.
  useEffect(() => {
    if (saveAfterSignIn && isSignedIn) {
      setSaveAfterSignIn(false);
      saveStory();
    }
  }, [saveAfterSignIn, isSignedIn, saveStory]);

  /** Share asks for an account first, then opens the share form once signed in. */
  const openShare = () => {
    if (isSignedIn) {
      setShowShareDialog(true);
    } else {
      setShareAfterSignIn(true);
      setShowAuthDialog(true);
    }
  };

  useEffect(() => {
    if (shareAfterSignIn && isSignedIn) {
      setShareAfterSignIn(false);
      setShowShareDialog(true);
    }
  }, [shareAfterSignIn, isSignedIn]);

  /** Share by email. Unsaved stories are saved first: the link points at the stored copy. */
  const shareStory = async (event) => {
    event.preventDefault();
    if (!shareEmail.trim() || !readingStory) return;

    try {
      setIsSharing(true);
      const storyToShare = await saveStory();
      if (!storyToShare?._id) return;

      const response = await fetch(`/api/stories/${storyToShare._id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: shareEmail.trim() }),
      });

      if (response.ok) {
        toast.success(`Story shared with ${shareEmail.trim()}.`);
        setShareEmail('');
        setShowShareDialog(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.code === 'EMAIL_NOT_CONFIGURED') {
          toast.warning('Email sharing is not set up on this site yet.');
        } else {
          toast.error(
            response.status === 401
              ? "You've been signed out. Sign in again, then share."
              : errorData.message || 'The story could not be shared. Please try again.'
          );
        }
      }
    } catch (error) {
      console.error('Error sharing story:', error);
      toast.error('The story could not be shared. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  // Stories to read again: the newest one made here, then saved ones
  const shelf = useMemo(() => {
    const list = generatedStory && !generatedStory._id ? [generatedStory] : [];
    return [...list, ...savedStories];
  }, [generatedStory, savedStories]);

  const dialogs = (
    <>
      {showGate && (
        <ParentGate
          onClose={() => setShowGate(false)}
          onPass={() => {
            setShowGate(false);
            setView('grownups');
          }}
        />
      )}
      {showAuthDialog && (
        <AuthDialog
          onClose={() => {
            setShowAuthDialog(false);
            setSaveAfterSignIn(false);
            setShareAfterSignIn(false);
          }}
          // A save or share interrupted by sign-in resumes from the effects above
          onSuccess={() => setShowAuthDialog(false)}
        />
      )}
      {showShareDialog && (
        <Modal title="Share this story" onClose={() => setShowShareDialog(false)} labelledBy="share-title">
          <form onSubmit={shareStory} className="space-y-4">
            <label htmlFor="share-email" className="block font-display text-base text-ink">
              Email address
            </label>
            <input
              id="share-email"
              type="email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              className="field"
              placeholder="someone@example.com"
              autoComplete="email"
            />
            <p className="font-display text-sm text-ink/70">They get a link to read the story. It&apos;s saved to your account first.</p>
            <button type="submit" disabled={!shareEmail.trim() || isSharing} className="btn btn-sun w-full">
              <Send size={20} strokeWidth={2.5} aria-hidden="true" /> {isSharing ? 'Sharing…' : 'Share'}
            </button>
          </form>
        </Modal>
      )}
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </>
  );

  if (view === 'reader' && readingStory) {
    return (
      <>
        <StoryReader
          story={readingStory}
          onClose={() => setView('home')}
          actions={{
            onSave: saveStory,
            onPrint: () => window.print(),
            onShare: openShare,
            isSaving: isSavingStory,
            isSaved: !!readingStory._id,
          }}
        />
        {dialogs}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-sky">
      <AppHeader>
        {view === 'home' && (
          <button type="button" onClick={openGrownUps} className="btn btn-paper whitespace-nowrap px-3 text-base sm:px-5 sm:text-lg">
            <Settings size={20} strokeWidth={2.5} aria-hidden="true" /> Grown-ups
          </button>
        )}
      </AppHeader>

      {view === 'grownups' ? (
        <main>
          <GrownUps
            words={words}
            onAddWords={addWords}
            onRemoveWord={removeWord}
            onClearWords={() => setWords([])}
            grade={grade}
            onGradeChange={setGrade}
            useAI={useAI}
            onUseAIChange={setUseAI}
            includeImages={includeImages}
            onIncludeImagesChange={setIncludeImages}
            storyFormat={storyFormat}
            onStoryFormatChange={setStoryFormat}
            learningNeeds={learningNeeds}
            onLearningNeedsChange={setLearningNeeds}
            isSignedIn={isSignedIn}
            userName={session?.user?.name}
            anthropicKeyHint={anthropicKey ? anthropicKeyHint(anthropicKey) : null}
            onSaveAnthropicKey={saveAnthropicKey}
            onRemoveAnthropicKey={removeAnthropicKey}
            savedStories={savedStories}
            isLoadingStories={isLoadingStories}
            storiesError={storiesError}
            onRetryStories={fetchSavedStories}
            onOpenStory={openStory}
            onSignIn={() => setShowAuthDialog(true)}
            onSignOut={handleSignOut}
            onBack={() => setView('home')}
          />
        </main>
      ) : (
        <main className="mx-auto max-w-5xl space-y-10 px-4 pb-16 sm:px-6">
          <section aria-labelledby="story-time-title" className="cutout px-6 py-8 sm:px-10 sm:py-10">
            <h1 id="story-time-title" className="font-display text-5xl font-bold text-ink sm:text-6xl">
              Story time!
            </h1>

            {words.length > 0 ? (
              <>
                <p className="mt-2 font-display text-xl text-ink/80">
                  {speech.supported ? 'Tap a word to hear it.' : 'These are your words.'}
                </p>
                <ul className="mt-6 flex flex-wrap gap-4" aria-label="Your words">
                  {words.map((word, index) => (
                    <li key={word}>
                      <WordCard
                        word={word}
                        index={index}
                        tilt
                        size={words.length > LARGE_CARD_LIMIT ? 'md' : 'lg'}
                        onSay={speech.supported ? (w) => speech.speak(w) : undefined}
                      />
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={handleGenerateStory}
                  disabled={isGeneratingStory}
                  className="btn btn-sun btn-big mt-8"
                >
                  <Sparkles size={28} strokeWidth={2.5} aria-hidden="true" />
                  {isGeneratingStory ? 'Making your story…' : 'Make my story'}
                </button>
              </>
            ) : (
              <>
                <p className="mt-2 max-w-xl font-display text-xl text-ink/80">
                  Ask a grown-up to choose the words to practise, or try some to start.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" onClick={() => addWords(STARTER_WORDS)} className="btn btn-sun btn-big">
                    <Sparkles size={28} strokeWidth={2.5} aria-hidden="true" /> Try some words
                  </button>
                  <button type="button" onClick={openGrownUps} className="btn btn-paper btn-big">
                    <Settings size={26} strokeWidth={2.5} aria-hidden="true" /> Choose words
                  </button>
                </div>
              </>
            )}
          </section>

          <StoryShelf stories={shelf} onOpen={openStory} />
        </main>
      )}

      {dialogs}
    </div>
  );
};

export default SightWordStoryGenerator;
