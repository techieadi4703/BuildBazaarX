import { useEffect, useRef } from 'react';

export function useScrollDepth(thresholds: number[], onCross: (depth: number) => void) {
  const crossedThresholds = useRef<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      if (documentHeight === windowHeight) return;

      const scrollPercent = (scrollY / (documentHeight - windowHeight)) * 100;

      thresholds.forEach((threshold) => {
        if (scrollPercent >= threshold && !crossedThresholds.current.has(threshold)) {
          crossedThresholds.current.add(threshold);
          onCross(threshold);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Check initial position in case the page is already scrolled
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [thresholds, onCross]);
}
