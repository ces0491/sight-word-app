import { useRouter } from 'next/router';
import GrownUpPage from '../../components/storybook/GrownUpPage';
import StatusScreen from '../../components/storybook/StatusScreen';
import StoryEditor from '../../components/story/StoryEditor';
import { useSignedIn } from '../../hooks/useSignedIn';

/** Write a story by hand. */
export default function NewStoryPage() {
  const router = useRouter();
  const { status } = useSignedIn();

  const handleSave = async (storyData) => {
    const response = await fetch('/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storyData),
    });
    if (!response.ok) {
      throw new Error('Failed to save story');
    }
    const savedStory = await response.json();
    router.push(`/stories/${savedStory._id}`);
  };

  if (status !== 'authenticated') {
    return <StatusScreen title="Loading…" />;
  }

  return (
    <GrownUpPage title="Write a story" back={{ href: '/stories', label: 'Library' }}>
      <StoryEditor onSave={handleSave} onCancel={() => router.push('/stories')} />
    </GrownUpPage>
  );
}
