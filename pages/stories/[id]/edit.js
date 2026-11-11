import { useRouter } from 'next/router';
import GrownUpPage from '../../../components/storybook/GrownUpPage';
import StatusScreen from '../../../components/storybook/StatusScreen';
import StoryEditor from '../../../components/story/StoryEditor';
import { useHydrated, useSavedStories } from '../../../hooks/useSavedStories';
import { updateStory } from '../../../lib/storyLibrary';

/** Edit a saved story's title, sentences, words and settings. */
export default function EditStoryPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const stories = useSavedStories();

  if (!hydrated || !router.isReady) {
    return <StatusScreen title="Opening the story…" />;
  }

  const story = stories.find((saved) => saved.id === router.query.id);
  if (!story) {
    return (
      <StatusScreen
        title="This story can't be edited"
        message="It isn't saved in this browser."
        action={{ href: '/stories', label: 'Back to the library' }}
      />
    );
  }

  const handleSave = (storyData) => {
    // Unchanged sentences keep their scene ids, so the pictures stay scene-based
    const sameSentences = JSON.stringify(storyData.content) === JSON.stringify(story.content);
    const { problem } = updateStory(story.id, {
      title: storyData.title,
      content: storyData.content,
      ...(sameSentences ? { scenes: story.scenes } : {}),
      words: storyData.words,
      format: storyData.format,
      includeImages: storyData.includeImages,
      grade: storyData.grade,
      learningNeeds: storyData.learningNeeds,
    });
    if (problem) throw new Error(problem);
    router.push(`/stories/${story.id}`);
  };

  return (
    <GrownUpPage title="Edit story" back={{ href: '/stories', label: 'Library' }}>
      <StoryEditor story={story} onSave={handleSave} onCancel={() => router.push('/stories')} />
    </GrownUpPage>
  );
}
