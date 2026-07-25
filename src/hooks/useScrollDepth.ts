import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/umami';

const DEFAULT_THRESHOLDS = [25, 50, 75, 100];

interface ScrollDepthOptions {
  /** Which surface is being measured, e.g. "material" | "design". */
  scope: string;
  /** Id of the entity being viewed, so depth can be attributed to it. */
  id?: string;
  /** Percentage marks to report. Defaults to 25/50/75/100. */
  thresholds?: number[];
}

/**
 * Reports how far the user scrolled through a page, once per threshold.
 *
 * Takes an options object — callers pass { scope, id } and the hook emits the
 * analytics event itself. (An earlier positional signature, (thresholds, onCross),
 * did not match either call site and threw "thresholds.forEach is not a function"
 * on mount, crashing both detail pages.)
 */
export function useScrollDepth({ scope, id, thresholds = DEFAULT_THRESHOLDS }: ScrollDepthOptions) {
  const crossedThresholds = useRef<Set<number>>(new Set());

  // Serialise the marks so a fresh inline array doesn't re-run the effect every render.
  const thresholdKey = thresholds.join(',');

  useEffect(() => {
    // Viewing a different entity starts the measurement over.
    crossedThresholds.current = new Set();
  }, [scope, id]);

  useEffect(() => {
    const marks = thresholdKey.split(',').map(Number);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Nothing to measure when the page doesn't scroll (also avoids /0).
      if (documentHeight <= windowHeight) return;

      const scrollPercent = (scrollY / (documentHeight - windowHeight)) * 100;

      marks.forEach((threshold) => {
        if (scrollPercent >= threshold && !crossedThresholds.current.has(threshold)) {
          crossedThresholds.current.add(threshold);
          trackEvent('scroll-depth', { depth: threshold, scope, id });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Check initial position in case the page is already scrolled
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scope, id, thresholdKey]);
}
