import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import GrownUpPage from '../../../components/storybook/GrownUpPage';
import StatusScreen from '../../../components/storybook/StatusScreen';
import StoryEditor from '../../../components/story/StoryEditor';
import { useSignedIn } from '../../../hooks/useSignedIn';

/** Edit a saved story's title, sentences, words and settings. */
export default function EditStoryPage() {
  const router = useRouter();
  const { id } = router.query;
  const { status } = useSignedIn();
  const [story, setStory] = useState(null);
  const [error, setError] = useState(null);

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

  const handleSave = async (storyData) => {
    // Unchanged sentences keep their scene ids, so the pictures stay scene-based
    const sameSentences = JSON.stringify(storyData.content) === JSON.stringify(story.content);
    const response = await fetch(`/api/stories/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: storyData.title,
        content: storyData.content,
        ...(sameSentences ? { scenes: story.scenes } : {}),
        words: storyData.words,
        format: storyData.format,
        includeImages: storyData.includeImages,
        grade: storyData.grade,
        learningNeeds: storyData.learningNeeds,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to save story');
    }
    router.push(`/stories/${id}`);
  };

  if (error) {
    return <StatusScreen title="This story can't be edited" message={error} action={{ href: '/stories', label: 'Back to the library' }} />;
  }
  if (!story) {
    return <StatusScreen title="Opening the story…" />;
  }

  return (
    <GrownUpPage title="Edit story" back={{ href: '/stories', label: 'Library' }}>
      <StoryEditor story={story} onSave={handleSave} onCancel={() => router.push('/stories')} />
    </GrownUpPage>
  );
}
