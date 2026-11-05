import React, { useState } from 'react';
import { Send } from 'lucide-react';
import Modal from '../storybook/Modal';

/** Email a link to a saved story, with an optional note. */
const StorySharing = ({ storyId, onClose }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState('');
  const [sentTo, setSentTo] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim()) {
      setError('Enter an email address.');
      return;
    }

    setError('');
    setIsSharing(true);
    try {
      const response = await fetch(`/api/stories/${storyId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), message: message.trim() || undefined }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.code === 'EMAIL_NOT_CONFIGURED'
            ? 'Email sharing is not set up on this site yet.'
            : data.message || 'The story could not be shared. Please try again.'
        );
      }
      setSentTo(email.trim());
      setEmail('');
      setMessage('');
    } catch (shareError) {
      setError(shareError.message);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Modal title="Share this story" onClose={onClose} labelledBy="story-sharing-title">
      {sentTo ? (
        <div className="space-y-4">
          <p className="font-display text-lg text-ink" role="status">
            Sent to {sentTo}.
          </p>
          <button type="button" onClick={onClose} className="btn btn-sun w-full">
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-xl bg-berry/10 p-3 font-display text-base text-ink" role="alert">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="share-to" className="mb-1 block font-display text-base font-medium text-ink">
              Email address
            </label>
            <input
              id="share-to"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="share-note" className="mb-1 block font-display text-base font-medium text-ink">
              Note (optional)
            </label>
            <textarea
              id="share-note"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              maxLength={500}
              className="field"
            />
          </div>
          <button type="submit" disabled={isSharing} className="btn btn-sun w-full">
            <Send size={20} strokeWidth={2.5} aria-hidden="true" /> {isSharing ? 'Sharing…' : 'Share'}
          </button>
        </form>
      )}
    </Modal>
  );
};

export default StorySharing;
