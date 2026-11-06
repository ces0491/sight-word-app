import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, Search, Trash2, Pencil, Link2Off } from 'lucide-react';
import GrownUpPage from '../../components/storybook/GrownUpPage';
import StatusScreen from '../../components/storybook/StatusScreen';
import Modal from '../../components/storybook/Modal';
import { useSignedIn } from '../../hooks/useSignedIn';

const SORTS = {
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  title: (a, b) => a.title.localeCompare(b.title),
  grade: (a, b) => a.grade - b.grade,
};

const gradeLabel = (grade) => (grade === 0 ? 'Kindergarten' : `Grade ${grade}`);

/** The story library: every saved story, to read, edit or delete. */
export default function StoriesPage() {
  const { status } = useSignedIn();
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [toDelete, setToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [toUnshare, setToUnshare] = useState(null);
  const [unshareError, setUnshareError] = useState('');

  const [reload, setReload] = useState(0);

  // Load once signed in, and again on "Try again". State is set only when the request returns.
  useEffect(() => {
    if (status !== 'authenticated') return undefined;
    let current = true;
    fetch('/api/stories')
      .then((response) => {
        if (!response.ok) throw new Error(`Stories request failed: ${response.status}`);
        return response.json();
      })
      .then((list) => {
        if (!current) return;
        setStories(list);
        setLoadError(false);
      })
      .catch((error) => {
        console.error('Error fetching stories:', error);
        if (current) setLoadError(true);
      })
      .finally(() => {
        if (current) setIsLoading(false);
      });
    return () => {
      current = false;
    };
  }, [status, reload]);

  const fetchStories = () => {
    setIsLoading(true);
    setLoadError(false);
    setReload((n) => n + 1);
  };

  /** Stop sharing: every link sent for the story stops working. */
  const confirmUnshare = async () => {
    try {
      const response = await fetch(`/api/stories/${toUnshare._id}/share`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to stop sharing');
      setStories((current) => current.map((story) => (story._id === toUnshare._id ? { ...story, sharedWith: [] } : story)));
      setToUnshare(null);
    } catch (error) {
      console.error('Error stopping sharing:', error);
      setUnshareError('Sharing could not be stopped. Please try again.');
    }
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/stories/${toDelete._id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete story');
      setStories((current) => current.filter((story) => story._id !== toDelete._id));
      setToDelete(null);
    } catch (error) {
      console.error('Error deleting story:', error);
      setDeleteError('The story could not be deleted. Please try again.');
    }
  };

  if (status !== 'authenticated' || isLoading) {
    return <StatusScreen title="Opening your library…" />;
  }
  if (loadError) {
    return (
      <GrownUpPage title="Story library">
        <div className="rounded-2xl border-2 border-ink/15 bg-paper p-10 text-center">
          <h2 className="font-display text-2xl font-semibold text-ink" role="alert">
            Your stories couldn&apos;t be loaded
          </h2>
          <p className="mt-2 font-display text-base text-ink/70">Check the connection and try again.</p>
          <button type="button" onClick={fetchStories} className="btn btn-sun mt-6">
            Try again
          </button>
        </div>
      </GrownUpPage>
    );
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
            {term ? 'Try another title or word.' : 'Make a story at story time and save it from its last page.'}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {shown.map((story) => (
            <li key={story._id} className="rounded-2xl border-2 border-ink/15 bg-paper p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-semibold text-ink">{story.title}</h2>
                  <p className="font-display text-sm text-ink/60">
                    {new Date(story.createdAt).toLocaleDateString()} · {gradeLabel(story.grade)} · {story.words.length} words
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Link href={`/stories/${story._id}/edit`} className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink/10" aria-label={`Edit ${story.title}`}>
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
                  {story.sharedWith?.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setUnshareError('');
                        setToUnshare(story);
                      }}
                      className="btn-quiet"
                    >
                      <Link2Off size={18} aria-hidden="true" /> Stop sharing
                    </button>
                  )}
                  <Link href={`/stories/${story._id}`} className="btn-quiet">
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
          <p className="font-display text-base text-ink">&ldquo;{toDelete.title}&rdquo; will be deleted. This can&apos;t be undone.</p>
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

      {toUnshare && (
        <Modal title="Stop sharing this story?" onClose={() => setToUnshare(null)} labelledBy="unshare-title">
          <p className="font-display text-base text-ink">
            The links sent for &ldquo;{toUnshare.title}&rdquo; to {toUnshare.sharedWith.join(', ')} will stop working. Sharing it again
            sends a new link.
          </p>
          {unshareError && (
            <p className="mt-3 rounded-xl bg-berry/10 p-3 font-display text-base text-ink" role="alert">
              {unshareError}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => setToUnshare(null)} className="btn-quiet">
              Keep sharing
            </button>
            <button type="button" onClick={confirmUnshare} className="btn btn-berry">
              <Link2Off size={18} aria-hidden="true" /> Stop sharing
            </button>
          </div>
        </Modal>
      )}
    </GrownUpPage>
  );
}
