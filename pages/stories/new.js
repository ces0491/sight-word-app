import { useRouter } from 'next/router';
import GrownUpPage from '../../components/storybook/GrownUpPage';
import StoryEditor from '../../components/story/StoryEditor';
import { addStory } from '../../lib/storyLibrary';

/** Write a story by hand. It's saved in this browser's story library. */
export default function NewStoryPage() {
  const router = useRouter();

  const handleSave = (storyData) => {
    const { story, problem } = addStory(storyData);
    if (problem) throw new Error(problem);
    router.push(`/stories/${story.id}`);
  };

  return (
    <GrownUpPage title="Write a story" back={{ href: '/stories', label: 'Library' }}>
      <StoryEditor onSave={handleSave} onCancel={() => router.push('/stories')} />
    </GrownUpPage>
  );
}
