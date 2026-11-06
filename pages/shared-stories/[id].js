import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import StoryReader from '../../components/storybook/StoryReader';
import StatusScreen from '../../components/storybook/StatusScreen';

const INVALID_LINK = 'This story link is invalid or no longer available.';

/** A story opened from a share link: straight into the reader. */
export default function SharedStoryPage() {
  const router = useRouter();
  const { id, token } = router.query;
  const [story, setStory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const missingToken = router.isReady && (!id || !token);

  useEffect(() => {
    if (!router.isReady || !id || !token) return;

    const fetchSharedStory = async () => {
      try {
        const response = await fetch(
          `/api/shared-stories/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}`
        );
        if (!response.ok) {
          setError(response.status === 404 ? INVALID_LINK : 'The story could not be loaded. Please try again.');
          return;
        }
        setStory(await response.json());
      } catch (fetchError) {
        console.error('Error fetching shared story:', fetchError);
        setError('The story could not be loaded. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSharedStory();
  }, [router.isReady, id, token]);

  if (missingToken) {
    return (
      <StatusScreen title="This story can't be opened" message={INVALID_LINK} action={{ href: '/', label: 'Make your own story' }} />
    );
  }

  if (isLoading) {
    return <StatusScreen title="Opening the story…" />;
  }

  if (error) {
    return (
      <StatusScreen
        title="This story can't be opened"
        message={error}
        action={{ href: '/', label: 'Make your own story' }}
      />
    );
  }

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
        actions={{ onPrint: () => window.print() }}
      />
    </>
  );
}
