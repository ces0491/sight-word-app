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
 * Request an AI-written story from the server.
 * @returns {Promise<{ title: string, content: string[], usedWords: string[] }>}
 */
const requestAiStory = async ({ words, grade, learningNeeds }) => {
  const response = await fetch('/api/stories/generate-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ words, grade, learningNeeds }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'AI generation failed.');
  }
  return data;
};

/** Classes on <body> that styles/learningAdaptations.css reads. */
const NEED_CLASSES = {
  adhd: 'adhd-enabled',
  dyslexia: 'dyslexia-enabled',
  autism: 'autism-enabled',
  esl: 'esl-enabled',
  visualProcessing: 'visual-processing-enabled',
};

/** Many words on the home screen get smaller cards. */
const LARGE_CARD_LIMIT = 12;

/**
 * The app: story time for the child, the reader, and the grown-ups area.
 */
const SightWordStoryGenerator = () => {
  const { data: session } = useSession();
  const isSignedIn = !!session?.user;
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
  const [includeImages, setIncludeImages] = useState(true);
  const [storyFormat, setStoryFormat] = useState('highlighted');

  // Stories
  const [generatedStory, setGeneratedStory] = useState(null);
  const [readingStory, setReadingStory] = useState(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [savedStories, setSavedStories] = useState([]);
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  const [isSavingStory, setIsSavingStory] = useState(false);

  // Screens and dialogs
  const [view, setView] = useState('home'); // home | reader | grownups
  const [showGate, setShowGate] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  // Set when sign-in starts from Save, so the save runs once the session arrives
  const [saveAfterSignIn, setSaveAfterSignIn] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  const fetchSavedStories = async () => {
    try {
      setIsLoadingStories(true);
      const response = await fetch('/api/stories');
      if (response.ok) {
        setSavedStories(await response.json());
      } else {
        console.error('Failed to fetch stories');
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
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
    }
  }, [isSignedIn]);

  // AI mode needs an account; switch back to Classic if the user signs out
  useEffect(() => {
    if (!isSignedIn) setUseAI(false);
  }, [isSignedIn]);

  // Learning needs change how the reader looks (styles/learningAdaptations.css)
  useEffect(() => {
    const { classList } = document.body;
    Object.entries(NEED_CLASSES).forEach(([need, className]) => {
      classList.toggle(className, !!learningNeeds[need]);
    });
    return () => Object.values(NEED_CLASSES).forEach((className) => classList.remove(className));
  }, [learningNeeds]);

  const addWords = (newWords) => {
    setWords((current) => [...new Set([...current, ...newWords.map((w) => w.toLowerCase())])]);
  };
  const removeWord = (word) => setWords((current) => current.filter((w) => w !== word.toLowerCase()));

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
      if (useAI && isSignedIn) {
        try {
          storyData = await requestAiStory({ words, grade, learningNeeds });
        } catch (aiError) {
          console.error('AI story generation failed:', aiError);
          toast.warning(`${aiError.message} Using Classic mode instead.`);
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
      console.error('Failed to save story');
      toast.error('The story could not be saved. Please try again.');
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
          toast.error(errorData.message || 'The story could not be shared. Please try again.');
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
          }}
          // A save interrupted by sign-in resumes from the saveAfterSignIn effect
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
            onShare: () => setShowShareDialog(true),
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
            savedStories={savedStories}
            isLoadingStories={isLoadingStories}
            onOpenStory={openStory}
            onSignIn={() => setShowAuthDialog(true)}
            onSignOut={() => signOut({ redirect: false })}
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
