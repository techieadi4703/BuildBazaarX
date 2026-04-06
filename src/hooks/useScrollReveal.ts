import { useEffect, useRef, useState, useCallback } from "react";

type RevealDirection = "up" | "down" | "left" | "right" | "scale" | "fade";

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.15,
  rootMargin = "0px 0px -60px 0px",
  triggerOnce = true,
  direction = "up",
  delay = 0,
  duration = 700,
}: UseScrollRevealOptions = {}) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) observer.unobserve(el);
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  const getTransform = (): string => {
    switch (direction) {
      case "up": return "translateY(40px)";
      case "down": return "translateY(-40px)";
      case "left": return "translateX(40px)";
      case "right": return "translateX(-40px)";
      case "scale": return "scale(0.92)";
      case "fade": return "none";
      default: return "translateY(40px)";
    }
  };

  const style: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "none" : getTransform(),
    transition: `opacity ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms, transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms`,
    willChange: "opacity, transform",
  };

  return { ref, style, isVisible };
}

// Hook for staggered children reveals
export function useStaggerReveal(
  itemCount: number,
  options: Omit<UseScrollRevealOptions, "delay"> & { staggerDelay?: number } = {}
) {
  const { staggerDelay = 120, ...revealOptions } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      {
        threshold: revealOptions.threshold ?? 0.1,
        rootMargin: revealOptions.rootMargin ?? "0px 0px -40px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const getItemStyle = useCallback(
    (index: number): React.CSSProperties => {
      const dir = revealOptions.direction ?? "up";
      const duration = revealOptions.duration ?? 600;
      const delay = index * staggerDelay;

      let transform: string;
      switch (dir) {
        case "up": transform = "translateY(40px)"; break;
        case "down": transform = "translateY(-40px)"; break;
        case "left": transform = "translateX(40px)"; break;
        case "right": transform = "translateX(-40px)"; break;
        case "scale": transform = "scale(0.92)"; break;
        default: transform = "none";
      }

      return {
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "none" : transform,
        transition: `opacity ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms, transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms`,
        willChange: "opacity, transform",
      };
    },
    [isVisible, staggerDelay, revealOptions.direction, revealOptions.duration]
  );

  return { containerRef, isVisible, getItemStyle };
}
