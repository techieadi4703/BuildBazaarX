import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "../lib/umami";

export const UMAMI_EXCLUDED_PREFIXES = ['/admin'];

export function useUmamiPageviews() {
  const location = useLocation();

  useEffect(() => {
    if (UMAMI_EXCLUDED_PREFIXES.some(prefix => location.pathname.startsWith(prefix))) {
      return;
    }
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);
}
