import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A dialog over the page. Escape and the close button call `onClose`;
 * focus moves into the dialog when it opens, stays inside it while it is
 * open, and goes back when it closes.
 */
const Modal = ({ title, onClose, children, labelledBy = 'modal-title', size = 'md' }) => {
  const panelRef = useRef(null);
  // Parents often pass a new onClose on every render; keep the latest without re-running the focus effect
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Once, on open: focus the first field or button, and give focus back on close
  useEffect(() => {
    const previous = document.activeElement;
    const first = panelRef.current?.querySelector('input, button:not([data-close]), select, textarea, a[href]');
    (first ?? panelRef.current)?.focus();
    return () => previous?.focus?.();
  }, []);

  // Handled on the dialog itself, so only the dialog in use responds
  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onCloseRef.current();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = [...panelRef.current.querySelectorAll(FOCUSABLE)];
    if (items.length === 0) {
      event.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const width = size === 'lg' ? 'max-w-2xl' : 'max-w-md';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 sm:items-center" onMouseDown={() => onCloseRef.current()}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`cutout max-h-[90vh] w-full ${width} overflow-y-auto p-6`}
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={labelledBy} className="font-display text-2xl font-semibold text-ink">
            {title}
          </h2>
          <button
            type="button"
            data-close
            onClick={() => onCloseRef.current()}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-ink/10"
            aria-label="Close"
          >
            <X size={22} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
