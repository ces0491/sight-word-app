import { useEffect } from 'react';

export const LEAVE_MESSAGE = 'Leave without saving your changes?';

/**
 * While `active`, ask before leaving the page: on reload or closing the tab
 * (the browser's own prompt), and on any link in the page. Links are checked
 * in the capture phase, before Next.js handles the click, so staying put
 * needs no router workaround.
 *
 * @param {boolean} active - True while there are unsaved changes
 */
export function useLeaveWarning(active) {
  useEffect(() => {
    if (!active) return undefined;

    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    const onClick = (event) => {
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!link || link.target === '_blank' || event.defaultPrevented) return;
      if (!window.confirm(LEAVE_MESSAGE)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, [active]);
}

export default useLeaveWarning;
