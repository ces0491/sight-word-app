import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, Search, Trash2, Pencil } from 'lucide-react';
import GrownUpPage from '../../components/storybook/GrownUpPage';
import StatusScreen from '../../components/storybook/StatusScreen';
import Modal from '../../components/storybook/Modal';
import { useHydrated, useSavedStories } from '../../hooks/useSavedStories';
import { deleteStory } from '../../lib/storyLibrary';

const SORTS = {
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  title: (a, b) => a.title.localeCompare(b.title),
  grade: (a, b) => a.grade - b.grade,
};

const gradeLabel = (grade) => (grade === 0 ? 'Kindergarten' : `Grade ${grade}`);

/** The story library: the stories saved in this browser, to read, edit or delete. */
export default function StoriesPage() {
  const hydrated = useHydrated();
  const stories = useSavedStories();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [toDelete, setToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const confirmDelete = () => {
    const problem = deleteStory(toDelete.id);
    if (problem) {
      setDeleteError(problem);
      return;
    }
    setToDelete(null);
  };

  // Before hydration there is no browser storage to read, so "no stories" wouldn't be true yet
  if (!hydrated) {
    return <StatusScreen title="Opening your library…" />;
  }

  const term = searchTerm.trim().toLowerCase();
  const shown = stories
    .filter((story) => !term || story.title.toLowerCase().includes(term) || story.words.some((w) => w.toLowerCase().includes(term)))
    .sort(SORTS[sortBy]);

  return (
    <GrownUpPage
      title="Story library"
      actions={
        <Link href="/stories/new" className="btn btn-sun">
          <Plus size={20} strokeWidth={2.5} aria-hidden="true" /> Write a story
        </Link>
      }
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <label htmlFor="library-search" className="sr-only">
            Search stories or words
          </label>
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" aria-hidden="true" />
          <input
            id="library-search"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="field pl-10"
            placeholder="Search stories or words"
          />
        </div>
        <div className="sm:w-48">
          <label htmlFor="library-sort" className="mb-1 block font-display text-base text-ink">
            Sort by
          </label>
          <select id="library-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="field">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title">Title</option>
            <option value="grade">Reading level</option>
          </select>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="rounded-2xl border-2 border-ink/15 bg-paper p-10 text-center">
          <BookOpen size={48} className="mx-auto text-ink/30" aria-hidden="true" />
          <h2 className="mt-4 font-display text-2xl font-semibold text-ink">
            {term ? 'No stories match that search' : 'No saved stories yet'}
          </h2>
          <p className="mt-2 font-display text-base text-ink/70">
            {term
              ? 'Try another title or word.'
              : 'Make a story at story time and save it from its last page. Stories are saved in this browser.'}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {shown.map((story) => (
            <li key={story.id} className="rounded-2xl border-2 border-ink/15 bg-paper p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-semibold text-ink">{story.title}</h2>
                  <p className="font-display text-sm text-ink/60">
                    {new Date(story.createdAt).toLocaleDateString()} · {gradeLabel(story.grade)} · {story.words.length} words
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Link href={`/stories/${story.id}/edit`} className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink/10" aria-label={`Edit ${story.title}`}>
                    <Pencil size={18} aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError('');
                      setToDelete(story);
                    }}
                    className="grid h-10 w-10 place-items-center rounded-full hover:bg-berry/15"
                    aria-label={`Delete ${story.title}`}
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 font-read text-lg text-ink">{story.content[0]}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="truncate font-read text-base text-ink/70">{story.words.slice(0, 6).join(', ')}</p>
                <div className="flex shrink-0 gap-1">
                  <Link href={`/stories/${story.id}`} className="btn-quiet">
                    <BookOpen size={18} aria-hidden="true" /> Read
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {toDelete && (
        <Modal title="Delete this story?" onClose={() => setToDelete(null)} labelledBy="delete-title">
          <p className="font-display text-base text-ink">
            &ldquo;{toDelete.title}&rdquo; will be deleted from this browser. This can&apos;t be undone. Links you&apos;ve
            shared keep working, as they hold the story.
          </p>
          {deleteError && (
            <p className="mt-3 rounded-xl bg-berry/10 p-3 font-display text-base text-ink" role="alert">
              {deleteError}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => setToDelete(null)} className="btn-quiet">
              Keep it
            </button>
            <button type="button" onClick={confirmDelete} className="btn btn-berry">
              <Trash2 size={18} aria-hidden="true" /> Delete
            </button>
          </div>
        </Modal>
      )}
    </GrownUpPage>
  );
}
