import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import StoryReader from '../components/storybook/StoryReader';
import StatusScreen from '../components/storybook/StatusScreen';
import { ToastContainer } from '../components/Toast';
import { readShareLink } from '../lib/shareLink';
import { addStory } from '../lib/storyLibrary';
import { useToast } from '../hooks/useToast';

const DAMAGED_LINK = 'The link is damaged or incomplete. Ask for it again, and copy all of it.';

/**
 * A story opened from a share link, read from the link itself
 * (lib/shareLink.js): straight into the reader, with Save to keep a copy in
 * this browser.
 */
export default function SharedStoryPage() {
  const router = useRouter();
  const toast = useToast();
  // story is undefined while the link is read, null if it holds no story
  const [shared, setShared] = useState({ story: undefined, savedId: null });

  // The story is only in the browser's copy of the link, so it's read after hydration. Pasting
  // another link into this tab changes only the part after "#", which doesn't reload the page.
  useEffect(() => {
    let latest = 0;
    const read = () => {
      const attempt = ++latest;
      readShareLink(window.location.hash).then((story) => {
        if (attempt === latest) setShared({ story, savedId: null });
      });
    };
    read();
    window.addEventListener('hashchange', read);
    return () => {
      latest = -1;
      window.removeEventListener('hashchange', read);
    };
  }, []);

  const { story, savedId } = shared;

  if (story === undefined) {
    return <StatusScreen title="Opening the story…" />;
  }
  if (story === null) {
    return <StatusScreen title="This story can't be opened" message={DAMAGED_LINK} action={{ href: '/', label: 'Make your own story' }} />;
  }

  const saveStory = () => {
    const { story: saved, problem } = addStory(story);
    if (problem) {
      toast.error(problem);
      return;
    }
    setShared((current) => (current.story === story ? { ...current, savedId: saved.id } : current));
    toast.success('Story saved in this browser. Find it in the story library.');
  };

  return (
    <>
      <Head>
        <title>{`${story.title} | Sight Word Stories`}</title>
        <meta name="description" content={`A sight word story to read together: ${story.title}`} />
      </Head>
      <StoryReader
        story={story}
        closeLabel="Close"
        onClose={() => router.push('/')}
        actions={{ onSave: saveStory, onPrint: () => window.print(), isSaved: !!savedId }}
      />
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </>
  );
}
