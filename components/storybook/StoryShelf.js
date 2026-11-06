import React, { useMemo } from 'react';
import StoryIllustration from '../EnhancedIllustration';
import { planIllustrations } from '../../lib/imageGeneration';

const MAX_BOOKS = 6;

/** One story as a book cover: its first picture and its title. */
const BookCover = ({ story, onOpen }) => {
  const plan = useMemo(() => planIllustrations(story), [story]);
  const firstPage = story.content?.[0] ?? '';
  return (
    <button
      type="button"
      onClick={() => onOpen(story)}
      className="cutout group flex w-full flex-col overflow-hidden text-left transition-transform duration-100 active:translate-x-1 active:translate-y-1 active:shadow-none"
    >
      <div className="aspect-2/1 w-full border-b-3 border-ink bg-mist">
        {firstPage && <StoryIllustration sentence={firstPage} options={plan[0]} width="100%" height="100%" alt="" />}
      </div>
      <span className="block px-4 py-3 font-display text-lg font-semibold leading-snug text-ink">{story.title}</span>
    </button>
  );
};

/** Stories to read again: the one just made, then saved ones. */
const StoryShelf = ({ stories, onOpen }) => {
  const books = stories.filter((s) => Array.isArray(s?.content) && s.content.length > 0).slice(0, MAX_BOOKS);
  if (books.length === 0) return null;
  return (
    <section aria-labelledby="shelf-title" className="space-y-4">
      <h2 id="shelf-title" className="font-display text-2xl font-semibold text-ink">
        Read again
      </h2>
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((story, index) => (
          <li key={story._id ?? `draft-${index}`}>
            <BookCover story={story} onOpen={onOpen} />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default StoryShelf;
