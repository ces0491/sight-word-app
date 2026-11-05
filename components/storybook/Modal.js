import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * A dialog over the page. Escape and the close button call `onClose`;
 * focus moves into the dialog when it opens and back when it closes.
 */
const Modal = ({ title, onClose, children, labelledBy = 'modal-title', size = 'md' }) => {
  const panelRef = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    const first = panelRef.current?.querySelector('input, button:not([data-close]), select, textarea, a[href]');
    (first ?? panelRef.current)?.focus();

    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [onClose]);

  const width = size === 'lg' ? 'max-w-2xl' : 'max-w-md';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 sm:items-center" onMouseDown={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`cutout max-h-[90vh] w-full ${width} overflow-y-auto p-6`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={labelledBy} className="font-display text-2xl font-semibold text-ink">
            {title}
          </h2>
          <button
            type="button"
            data-close
            onClick={onClose}
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
