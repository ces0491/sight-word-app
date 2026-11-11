import React, { useEffect, useRef, useState } from 'react';
import { Copy } from 'lucide-react';
import Modal from '../storybook/Modal';
import { makeShareLink } from '../../lib/shareLink';

/**
 * A link to the story, to copy and send. The link carries the story itself
 * (lib/shareLink.js), so nothing is stored and it can't be switched off.
 * @param {object} props
 * @param {object} props.story
 * @param {() => void} props.onClose
 */
const StorySharing = ({ story, onClose }) => {
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const linkField = useRef(null);

  useEffect(() => {
    let current = true;
    makeShareLink(story, window.location.origin)
      .then((made) => {
        if (current) setLink(made);
      })
      .catch((shareError) => {
        console.error('Error making a share link:', shareError);
        if (current) setError('A link could not be made for this story.');
      });
    return () => {
      current = false;
    };
  }, [story]);

  // Focus starts on the dialog itself while the link is made; move it to the link once it's there
  useEffect(() => {
    if (link) linkField.current?.focus();
  }, [link]);

  const copyLink = async () => {
    setError('');
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch (copyError) {
      console.error('Error copying share link:', copyError);
      setError('The link could not be copied. Select it and copy it instead.');
    }
  };

  return (
    <Modal title="Share this story" onClose={onClose} labelledBy="story-sharing-title">
      <div className="space-y-4">
        <p className="font-display text-base text-ink">
          The link holds the story itself, so anyone it reaches can read it, and it can&apos;t be switched off later. Learning
          needs aren&apos;t included.
        </p>
        {error && (
          <p className="rounded-xl bg-berry/10 p-3 font-display text-base text-ink" role="alert">
            {error}
          </p>
        )}
        {link ? (
          <>
            <div>
              <label htmlFor="share-link" className="mb-1 block font-display text-base font-medium text-ink">
                Link to the story
              </label>
              <input
                ref={linkField}
                id="share-link"
                type="text"
                readOnly
                value={link}
                onFocus={(e) => e.target.select()}
                className="field"
              />
            </div>
            <div>
              <button type="button" onClick={copyLink} className="btn btn-sun w-full">
                <Copy size={20} strokeWidth={2.5} aria-hidden="true" /> Copy link
              </button>
              <p className="mt-2 text-center font-display text-sm text-ink" role="status">
                {copied ? 'Link copied.' : ''}
              </p>
            </div>
          </>
        ) : (
          !error && <p className="font-display text-base text-ink/70">Making a link…</p>
        )}
      </div>
    </Modal>
  );
};

export default StorySharing;
