import { useRouter } from 'next/router';
import GrownUpPage from '../../components/storybook/GrownUpPage';
import StatusScreen from '../../components/storybook/StatusScreen';
import StoryEditor from '../../components/story/StoryEditor';
import { useSignedIn } from '../../hooks/useSignedIn';
import { responseProblem } from '../../lib/storyChecks';

/** Write a story by hand. */
export default function NewStoryPage() {
  const router = useRouter();
  const { status, sessionEnded } = useSignedIn({ keepPageOnSignOut: true });

  const handleSave = async (storyData) => {
    const response = await fetch('/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storyData),
    });
    if (!response.ok) {
      throw new Error(await responseProblem(response, 'The story could not be saved. Please try again.'));
    }
    const savedStory = await response.json();
    router.push(`/stories/${savedStory._id}`);
  };

  // Once the editor is open, it stays open if the session ends, so the work isn't lost
  if (status !== 'authenticated' && !sessionEnded) {
    return <StatusScreen title="Loading…" />;
  }

  return (
    <GrownUpPage title="Write a story" back={{ href: '/stories', label: 'Library' }}>
      <StoryEditor
        onSave={handleSave}
        onCancel={() => router.push('/stories')}
        notice={sessionEnded ? "You've been signed out. Your changes are still here: sign in again in another tab, then save." : undefined}
      />
    </GrownUpPage>
  );
}
