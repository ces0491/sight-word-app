import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import StoryReader from '../../components/storybook/StoryReader';
import StatusScreen from '../../components/storybook/StatusScreen';
import StorySharing from '../../components/story/StorySharing';
import { useSignedIn } from '../../hooks/useSignedIn';

/** A saved story, read from the story library. */
export default function StoryPage() {
  const router = useRouter();
  const { id } = router.query;
  const { status } = useSignedIn();
  const [story, setStory] = useState(null);
  const [error, setError] = useState(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated' || !id) return;
    const fetchStory = async () => {
      try {
        const response = await fetch(`/api/stories/${encodeURIComponent(id)}`);
        if (!response.ok) {
          setError(response.status === 404 ? 'This story was not found.' : 'The story could not be loaded.');
          return;
        }
        setStory(await response.json());
      } catch (fetchError) {
        console.error('Error fetching story:', fetchError);
        setError('The story could not be loaded.');
      }
    };
    fetchStory();
  }, [status, id]);

  if (error) {
    return <StatusScreen title="This story can't be opened" message={error} action={{ href: '/stories', label: 'Back to the library' }} />;
  }
  if (!story) {
    return <StatusScreen title="Opening the story…" />;
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
      {showShareDialog && <StorySharing storyId={story._id} onClose={() => setShowShareDialog(false)} />}
    </>
  );
}
