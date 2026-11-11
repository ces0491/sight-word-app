import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import StoryReader from '../../components/storybook/StoryReader';
import StatusScreen from '../../components/storybook/StatusScreen';
import StorySharing from '../../components/story/StorySharing';
import { useHydrated, useSavedStories } from '../../hooks/useSavedStories';

/** A saved story, read from the story library. */
export default function StoryPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const stories = useSavedStories();
  const [showShareDialog, setShowShareDialog] = useState(false);

  if (!hydrated || !router.isReady) {
    return <StatusScreen title="Opening the story…" />;
  }

  const story = stories.find((saved) => saved.id === router.query.id);
  if (!story) {
    return (
      <StatusScreen
        title="This story can't be opened"
        message="It isn't saved in this browser."
        action={{ href: '/stories', label: 'Back to the library' }}
      />
    );
  }

  return (
    <>
      <Head>
        <title>{`${story.title} | Sight Word Stories`}</title>
      </Head>
      <StoryReader
        story={story}
        closeLabel="Library"
        onClose={() => router.push('/stories')}
        actions={{ onPrint: () => window.print(), onShare: () => setShowShareDialog(true) }}
      />
      {showShareDialog && <StorySharing story={story} onClose={() => setShowShareDialog(false)} />}
    </>
  );
}
